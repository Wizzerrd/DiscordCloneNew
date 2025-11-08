import { verifyCognitoToken } from '../verifyCognitoToken.js';

export async function requireAuth(req, res, next) {
    try {
        // Try Authorization header first
        let token = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        // Fallback to cookie if header missing
        if (!token && req.cookies?.id_token) {
            token = req.cookies.id_token;
        }

        if (!token) {
            return res.status(401).json({ error: 'Missing token' });
        }

        const decoded = await verifyCognitoToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Auth verification failed:', err.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

