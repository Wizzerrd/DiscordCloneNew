import express from "express";
import { getDb } from "../db.js";
import { relationships } from "../schema/relationships.js";
import { users } from "../schema/users.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { eq, and, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const router = express.Router();
const dbPromise = getDb()

/**
 * Send friend request
 */
/**
 * Send friend request
 */
router.post("/send", requireAuth, async (req, res) => {
    const { receiverId } = req.body;
    const { sub } = req.user;

    if (!receiverId) return res.status(400).json({ error: "receiverId required" });
    if (receiverId === sub) return res.status(400).json({ error: "Cannot friend yourself" });

    try {
        const db = await dbPromise
        // ✅ 1. Confirm target exists
        const [targetUser] = await db
            .select()
            .from(users)
            .where(or(eq(users.id, receiverId), eq(users.email, receiverId)));

        if (!targetUser)
            return res.status(404).json({ error: "User not found" });

        // ✅ 2. Check for blocking (either direction)
        const blockExists = await db
            .select()
            .from(relationships)
            .where(
                or(
                    and(
                        eq(relationships.senderId, sub),
                        eq(relationships.receiverId, targetUser.id),
                        eq(relationships.type, "blocked")
                    ),
                    and(
                        eq(relationships.senderId, targetUser.id),
                        eq(relationships.receiverId, sub),
                        eq(relationships.type, "blocked")
                    )
                )
            );

        if (blockExists.length > 0) {
            return res.status(403).json({
                error: "Cannot send request — one of you has blocked the other",
            });
        }

        // ✅ 3. Check for existing outgoing request
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

        if (existing.length > 0)
            return res.status(400).json({ error: "Request already exists" });

        // ✅ 4. Check for reciprocal request (auto-accept case)
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
            await db.insert(relationships).values({
                senderId: sub,
                receiverId: targetUser.id,
                type: "friend",
            });

            return res.json({
                message: "Friend request accepted automatically",
                relationship: {
                    id: targetUser.id,
                    email: targetUser.email,
                    username: targetUser.username,
                    status: "friend",
                    type: "friend",
                    createdAt: new Date(),
                },
            });
        }

        // ✅ 5. Normal request insert
        await db.insert(relationships).values({
            senderId: sub,
            receiverId: targetUser.id,
            type: "friend",
        });

        res.json({
            message: "Friend request sent successfully",
            relationship: {
                id: targetUser.id,
                email: targetUser.email,
                username: targetUser.username,
                status: "pending",
                type: "friend",
                createdAt: new Date(),
            },
        });
    } catch (err) {
        console.error("Send friend request failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});


/**
 * Accept friend request
 */
router.post("/accept", requireAuth, async (req, res) => {
    const { senderId } = req.body;
    const { sub } = req.user;

    if (!senderId) return res.status(400).json({ error: "senderId required" });

    try {
        const db = await dbPromise
        const [incoming] = await db
            .select()
            .from(relationships)
            .where(and(
                eq(relationships.senderId, senderId),
                eq(relationships.receiverId, sub),
                eq(relationships.type, "friend")
            ));

        if (!incoming)
            return res.status(404).json({ error: "No incoming request from this user" });

        await db.insert(relationships).values({
            senderId: sub,
            receiverId: senderId,
            type: "friend",
        });

        const [user] = await db.select().from(users).where(eq(users.id, senderId));

        res.json({
            message: "Friend request accepted",
            relationship: {
                id: senderId,
                email: user.email,
                username: user.username,
                status: "friend",
                type: "friend",
                createdAt: new Date(),
            },
        });
    } catch (err) {
        console.error("Accept request failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});

/**
 * Cancel sent friend request
 */
router.post("/cancel", requireAuth, async (req, res) => {
    const { targetId } = req.body;
    const { sub } = req.user;

    if (!targetId) return res.status(400).json({ error: "targetId required" });

    try {
        const db = await dbPromise
        const deleted = await db
            .delete(relationships)
            .where(
                and(
                    eq(relationships.senderId, sub),
                    eq(relationships.receiverId, targetId),
                    eq(relationships.type, "friend")
                )
            )
            .returning({ receiverId: relationships.receiverId });

        if (deleted.length === 0)
            return res.status(404).json({ error: "No pending request to cancel" });

        res.json({ message: "Friend request canceled", targetId });
    } catch (err) {
        console.error("Cancel request failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});


/**
 * Remove friend
 */
router.post("/remove", requireAuth, async (req, res) => {
    const { targetId } = req.body;
    const { sub } = req.user;

    if (!targetId) return res.status(400).json({ error: "targetId required" });

    try {
        const db = await dbPromise
        await db.delete(relationships).where(
            and(
                or(
                    and(eq(relationships.senderId, sub), eq(relationships.receiverId, targetId)),
                    and(eq(relationships.senderId, targetId), eq(relationships.receiverId, sub))
                ),
                eq(relationships.type, "friend")
            )
        );

        res.json({ message: "Friend removed", targetId });
    } catch (err) {
        console.error("Remove friend failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});

/**
 * Block user
 */
router.post("/block", requireAuth, async (req, res) => {
    const { targetId } = req.body;
    const { sub } = req.user;

    if (!targetId) return res.status(400).json({ error: "targetId required" });

    try {
        const db = await dbPromise
        await db.delete(relationships).where(
            and(
                or(
                    and(eq(relationships.senderId, sub), eq(relationships.receiverId, targetId)),
                    and(eq(relationships.senderId, targetId), eq(relationships.receiverId, sub))
                ),
                eq(relationships.type, "friend")
            )
        );

        await db.insert(relationships).values({
            senderId: sub,
            receiverId: targetId,
            type: "blocked",
        });

        const [user] = await db.select().from(users).where(eq(users.id, targetId));

        res.json({
            message: "User blocked",
            relationship: {
                id: targetId,
                email: user.email,
                username: user.username,
                status: "blocked",
                type: "blocked",
                createdAt: new Date(),
            },
        });
    } catch (err) {
        console.error("Block user failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});

/**
 * Unblock user
 */
router.post("/unblock", requireAuth, async (req, res) => {
    const { targetId } = req.body;
    const { sub } = req.user;

    if (!targetId) return res.status(400).json({ error: "targetId required" });

    try {
        const db = await dbPromise
        await db.delete(relationships).where(
            and(
                eq(relationships.senderId, sub),
                eq(relationships.receiverId, targetId),
                eq(relationships.type, "blocked")
            )
        );

        res.json({ message: "User unblocked", targetId });
    } catch (err) {
        console.error("Unblock user failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});

router.get("/list", requireAuth, async (req, res) => {
    const { sub } = req.user;

    try {
        const db = await dbPromise
        const senderUser = alias(users, "sender_user");
        const receiverUser = alias(users, "receiver_user");

        const results = await db
            .select({
                senderId: relationships.senderId,
                receiverId: relationships.receiverId,
                type: relationships.type,
                createdAt: relationships.createdAt,
                senderEmail: senderUser.email,
                receiverEmail: receiverUser.email,
                senderUsername: senderUser.username,
                receiverUsername: receiverUser.username,
            })
            .from(relationships)
            .leftJoin(senderUser, eq(senderUser.id, relationships.senderId))
            .leftJoin(receiverUser, eq(receiverUser.id, relationships.receiverId))
            .where(or(eq(relationships.senderId, sub), eq(relationships.receiverId, sub)));

        const byUser = new Map();

        for (const r of results) {
            const isSender = r.senderId === sub;
            const otherUserId = isSender ? r.receiverId : r.senderId;

            // 👇 Skip relationships the user shouldn’t see
            if (r.type === "blocked" && !isSender) continue;

            const otherEmail = isSender ? r.receiverEmail : r.senderEmail;
            const otherUsername = isSender ? r.receiverUsername : r.senderUsername;

            if (!byUser.has(otherUserId)) {
                byUser.set(otherUserId, {
                    id: otherUserId,
                    email: otherEmail || "(unknown)",
                    username: otherUsername,
                    status: null,
                    type: r.type,
                    createdAt: r.createdAt,
                });
            }

            const entry = byUser.get(otherUserId);

            if (r.type === "blocked") {
                entry.status = "blocked";
            } else if (r.type === "friend") {
                if (entry.status === "pending" && !isSender) {
                    entry.status = "friend";
                } else if (entry.status === null) {
                    entry.status = isSender ? "pending" : "incoming";
                } else if (entry.status === "incoming" && isSender) {
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
