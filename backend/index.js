import express from 'express';
import cors from 'cors';
import { verifyCognitoToken } from './verifyCognitoToken.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));

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
