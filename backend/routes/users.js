import express from 'express';
import { getDb } from '../db.js';
import { users } from '../schema/users.js';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();
const dbPromise = getDb()

// === Get current authenticated user ===
router.get('/me', requireAuth, async (req, res) => {
    try {
        const db = await dbPromise
        const { sub } = req.user;
        const [user] = await db.select().from(users).where(eq(users.id, sub));

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Fetch current user failed:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// === Update current user's username ===
router.put('/me', requireAuth, async (req, res) => {
    try {
        const db = await dbPromise
        const { sub } = req.user;
        const { username } = req.body;

        if (!username || username.trim().length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters long' });
        }

        const updated = await db
            .update(users)
            .set({ username })
            .where(eq(users.id, sub))
            .returning();

        res.json({ message: 'Username updated', user: updated[0] });
    } catch (err) {
        console.error('Update username failed:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// === List all users (for dev/admin) ===
router.get('/', async (req, res) => {
    try {
        const db = await dbPromise
        const allUsers = await db.select().from(users);
        res.json(allUsers);
    } catch (err) {
        console.error('Fetch users failed:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
