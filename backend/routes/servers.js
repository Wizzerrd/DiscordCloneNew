import express from "express";
import { db } from "../db.js";
import { servers } from "../schema/servers.js";
import { serverMembers } from "../schema/serverMembers.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { eq, and } from "drizzle-orm";

const router = express.Router();

/**
 * Create a new server
 */
router.post("/", requireAuth, async (req, res) => {
    const { name } = req.body;
    const { sub } = req.user;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ error: "Server name required (min 2 chars)" });
    }

    try {
        const [newServer] = await db.insert(servers).values({
            name,
            ownerId: sub,
        }).returning();

        // Automatically add the creator as an owner member
        await db.insert(serverMembers).values({
            serverId: newServer.id,
            userId: sub,
            role: "owner",
        });

        res.status(201).json(newServer);
    } catch (err) {
        console.error("Create server failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});

/**
 * Get all servers the authenticated user belongs to
 */
router.get("/mine", requireAuth, async (req, res) => {
    const { sub } = req.user;

    try {
        const myServers = await db.execute(`
      SELECT s.id, s.name, s.owner_id, s.icon_url, sm.role
      FROM servers s
      JOIN server_members sm ON s.id = sm.server_id
      WHERE sm.user_id = '${sub}'
      ORDER BY s.created_at DESC;
    `);
        res.json(myServers.rows);
    } catch (err) {
        console.error("Fetch user servers failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});

/**
 * Join a server by ID
 */
router.post("/:serverId/join", requireAuth, async (req, res) => {
    const { serverId } = req.params;
    const { sub } = req.user;

    try {
        await db.insert(serverMembers).values({
            serverId,
            userId: sub,
            role: "member",
        });
        res.json({ message: "Joined server successfully" });
    } catch (err) {
        if (err.message.includes("duplicate key")) {
            return res.status(400).json({ error: "Already a member" });
        }
        console.error("Join server failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});

/**
 * Get all members of a server
 */
router.get("/:serverId/members", requireAuth, async (req, res) => {
    const { serverId } = req.params;

    try {
        const members = await db.execute(`
      SELECT u.id, u.email, u.username, sm.role, sm.joined_at
      FROM users u
      JOIN server_members sm ON sm.user_id = u.id
      WHERE sm.server_id = '${serverId}'
      ORDER BY sm.joined_at ASC;
    `);
        res.json(members.rows);
    } catch (err) {
        console.error("Fetch server members failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});

/**
 * Delete a server (owner only)
 */
router.delete("/:serverId", requireAuth, async (req, res) => {
    const { sub } = req.user;
    const { serverId } = req.params;

    try {
        const [server] = await db.select().from(servers).where(eq(servers.id, serverId));

        if (!server) return res.status(404).json({ error: "Server not found" });
        if (server.ownerId !== sub) return res.status(403).json({ error: "Not authorized" });

        await db.delete(serverMembers).where(eq(serverMembers.serverId, serverId));
        await db.delete(servers).where(eq(servers.id, serverId));

        res.json({ message: "Server deleted successfully" });
    } catch (err) {
        console.error("Delete server failed:", err);
        res.status(500).json({ error: "Database error" });
    }
});

export default router;
