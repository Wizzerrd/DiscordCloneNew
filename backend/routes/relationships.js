import express from "express";
import { db } from "../db.js";
import { relationships } from "../schema/relationships.js";
import { users } from "../schema/users.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { eq, and, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";


const router = express.Router();

/**
 * Send a friend request
 */
router.post("/send", requireAuth, async (req, res) => {
    const { receiverId } = req.body;
    const { sub } = req.user;

    if (!receiverId) return res.status(400).json({ error: "receiverId required" });
    if (receiverId === sub) return res.status(400).json({ error: "Cannot friend yourself" });

    try {
        // Try to find target user by ID or email (allow flexibility)
        const [targetUser] = await db
            .select()
            .from(users)
            .where(or(eq(users.id, receiverId), eq(users.email, receiverId)));

        if (!targetUser)
            return res.status(404).json({ error: "No user found with that ID or email" });

        // Check if already friends or request exists
        const existing = await db
            .select()
            .from(relationships)
            .where(
                and(
                    eq(relationships.senderId, sub),
                    eq(relationships.receiverId, targetUser.id),
                    eq(relationships.type, "friend")
                )
            );

        if (existing.length > 0) {
            return res
                .status(400)
                .json({ error: "Friend request already sent or existing relationship" });
        }

        // Check if reciprocal relationship exists (means they already sent you one)
        const reciprocal = await db
            .select()
            .from(relationships)
            .where(
                and(
                    eq(relationships.senderId, targetUser.id),
                    eq(relationships.receiverId, sub),
                    eq(relationships.type, "friend")
                )
            );

        if (reciprocal.length > 0) {
            // Accept automatically if they already sent one
            await db.insert(relationships).values({
                senderId: sub,
                receiverId: targetUser.id,
                type: "friend",
            });

            return res.json({ message: "Friend request accepted automatically" });
        }

        // Otherwise, create new request
        await db.insert(relationships).values({
            senderId: sub,
            receiverId: targetUser.id,
            type: "friend",
        });

        res.json({ message: "Friend request sent successfully" });
    } catch (err) {
        if (err.message.includes("duplicate key")) {
            return res.status(400).json({ error: "Request already exists" });
        }
        console.error("Send friend request failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});

/**
 * Accept a friend request (creates reciprocal row)
 */
router.post("/accept", requireAuth, async (req, res) => {
    const { senderId } = req.body;
    const { sub } = req.user;

    if (!senderId) return res.status(400).json({ error: "senderId required" });

    try {
        // verify that there is an incoming request
        const [incoming] = await db
            .select()
            .from(relationships)
            .where(and(
                eq(relationships.senderId, senderId),
                eq(relationships.receiverId, sub),
                eq(relationships.type, "friend")
            ));

        if (!incoming) {
            return res.status(404).json({ error: "No incoming request from this user" });
        }

        // insert reciprocal relationship to confirm friendship
        await db.insert(relationships).values({
            senderId: sub,
            receiverId: senderId,
            type: "friend",
        });

        res.json({ message: "Friend request accepted" });
    } catch (err) {
        if (err.message.includes("duplicate key")) {
            return res.status(400).json({ error: "Already accepted" });
        }
        console.error("Accept friend request failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});

/**
 * Remove a friend (delete both friend rows)
 */
router.post("/remove", requireAuth, async (req, res) => {
    const { targetId } = req.body;
    const { sub } = req.user;

    if (!targetId) return res.status(400).json({ error: "targetId required" });

    try {
        await db.delete(relationships).where(
            and(
                or(
                    and(eq(relationships.senderId, sub), eq(relationships.receiverId, targetId)),
                    and(eq(relationships.senderId, targetId), eq(relationships.receiverId, sub))
                ),
                eq(relationships.type, "friend")
            )
        );

        res.json({ message: "Friend removed successfully" });
    } catch (err) {
        console.error("Remove friend failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});

/**
 * Block a user (also removes any friend relations)
 */
router.post("/block", requireAuth, async (req, res) => {
    const { targetId } = req.body;
    const { sub } = req.user;

    if (!targetId) return res.status(400).json({ error: "targetId required" });

    try {
        // remove any friend relationships between the two
        await db.delete(relationships).where(
            and(
                or(
                    and(eq(relationships.senderId, sub), eq(relationships.receiverId, targetId)),
                    and(eq(relationships.senderId, targetId), eq(relationships.receiverId, sub))
                ),
                eq(relationships.type, "friend")
            )
        );

        // insert a new "blocked" relationship
        await db.insert(relationships).values({
            senderId: sub,
            receiverId: targetId,
            type: "blocked",
        });

        res.json({ message: "User blocked successfully" });
    } catch (err) {
        if (err.message.includes("duplicate key")) {
            return res.status(400).json({ error: "User already blocked" });
        }
        console.error("Block user failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});

/**
 * Unblock a user
 */
router.post("/unblock", requireAuth, async (req, res) => {
    const { targetId } = req.body;
    const { sub } = req.user;

    if (!targetId) return res.status(400).json({ error: "targetId required" });

    try {
        await db.delete(relationships).where(
            and(
                eq(relationships.senderId, sub),
                eq(relationships.receiverId, targetId),
                eq(relationships.type, "blocked")
            )
        );

        res.json({ message: "User unblocked successfully" });
    } catch (err) {
        console.error("Unblock user failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});

/**
 * List all relationships for the current user
 * Includes outgoing, incoming, confirmed (friends), and blocked
 */

router.get("/list", requireAuth, async (req, res) => {
    const { sub } = req.user;

    try {
        // Alias users table to join twice cleanly
        const senderUser = alias(users, "sender_user");
        const receiverUser = alias(users, "receiver_user");

        // 1️⃣ Fetch relationships + joined user info
        const results = await db
            .select({
                senderId: relationships.senderId,
                receiverId: relationships.receiverId,
                type: relationships.type,
                createdAt: relationships.createdAt,
                senderEmail: senderUser.email,
                receiverEmail: receiverUser.email,
            })
            .from(relationships)
            .leftJoin(senderUser, eq(senderUser.id, relationships.senderId))
            .leftJoin(receiverUser, eq(receiverUser.id, relationships.receiverId))
            .where(
                or(eq(relationships.senderId, sub), eq(relationships.receiverId, sub))
            );

        // 2️⃣ Deduplicate and classify
        const byUser = new Map();

        for (const r of results) {
            const otherUserId = r.senderId === sub ? r.receiverId : r.senderId;
            if (!byUser.has(otherUserId)) {
                byUser.set(otherUserId, {
                    id: otherUserId,
                    email:
                        r.senderId === sub
                            ? r.receiverEmail
                            : r.senderEmail || "(unknown)",
                    status: null,
                    type: r.type,
                    createdAt: r.createdAt,
                });
            }

            const entry = byUser.get(otherUserId);

            if (r.type === "blocked") {
                entry.status = "blocked";
            } else if (r.type === "friend") {
                if (entry.status === "pending" && r.senderId !== sub) {
                    entry.status = "friend";
                } else if (entry.status === null) {
                    entry.status = r.senderId === sub ? "pending" : "incoming";
                } else if (entry.status === "incoming" && r.senderId === sub) {
                    entry.status = "friend";
                }
            }

            byUser.set(otherUserId, entry);
        }

        const relationshipsList = Array.from(byUser.values()).map((r) => ({
            ...r,
            status: r.status || "pending",
        }));

        res.json(relationshipsList);
    } catch (err) {
        console.error("Error fetching relationships:", err);
        res.status(500).json({ error: "Database error" });
    }
});

export default router;
