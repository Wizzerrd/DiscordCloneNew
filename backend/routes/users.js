import express from 'express';
import { db } from '../db.js';
import { users } from '../schema/users.js';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// === Get current authenticated user ===
router.get('/me', requireAuth, async (req, res) => {
    try {
        const { sub } = req.user;
        const [user] = await db.select().from(users).where(eq(users.id, sub));
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Fetch current user failed:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// === List all users (for dev/admin) ===
router.get('/', async (req, res) => {
    try {
        const allUsers = await db.select().from(users);
        res.json(allUsers);
    } catch (err) {
        console.error('Fetch users failed:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;
