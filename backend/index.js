import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { verifyCognitoToken } from './verifyCognitoToken.js';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173'];

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error('CORS: Not allowed'));
        },
        credentials: true,
    })
);

app.get('/health', (_, res) => res.status(200).send('OK'));

// === PROTECTED TEST ENDPOINT (works with cookie or Bearer header) ===
app.get('/api/protected', async (req, res) => {
    const bearer = req.headers.authorization?.split(' ')[1];
    const cookieToken = req.cookies.id_token;
    const token = bearer || cookieToken;

    if (!token) return res.status(401).json({ message: 'Missing token' });

    try {
        const decoded = await verifyCognitoToken(token);
        res.json({ message: 'Token verified successfully!', user: decoded });
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(403).json({ message: 'Invalid or expired token' });
    }
});

// === ROUTES ===
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`✅ Backend running on port ${port}`));
