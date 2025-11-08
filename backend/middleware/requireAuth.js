import { verifyCognitoToken } from '../verifyCognitoToken.js';

export async function requireAuth(req, res, next) {
    try {
        const token = req.cookies?.id_token || req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Not authenticated' });

        const decoded = await verifyCognitoToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Auth check failed:', err.message);
        return res.status(401).json({ error: 'Invalid or expired session' });
    }
}
