import express from 'express';
import cors from 'cors';
import { verifyCognitoToken } from './verifyCognitoToken.js';
import dotenv from 'dotenv';
dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
    : ["http://localhost:5173"];

const app = express();

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error("CORS: Not allowed"));
        },
        credentials: true,
    })
);

app.get("/health", (req, res) => res.status(200).send("OK"));

app.get('/api/protected', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Missing token' });

    const token = authHeader.split(' ')[1];

    try {
        const decoded = await verifyCognitoToken(token);
        res.json({ message: 'Token verified successfully!', user: decoded });
    } catch {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
});

app.listen(8000, () => console.log('✅ Backend running on port 8000'));
