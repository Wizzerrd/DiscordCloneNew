import express from 'express';
import fetch from 'node-fetch';
import { verifyCognitoToken } from '../verifyCognitoToken.js';
import { db } from '../db.js';
import { users } from '../schema/users.js';

const router = express.Router();

// === LOGIN ===
router.get('/login', (req, res) => {
    const loginUrl = `https://${process.env.COGNITO_DOMAIN}/login?client_id=${process.env.COGNITO_CLIENT_ID}&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent(process.env.COGNITO_REDIRECT_URI)}`;
    res.redirect(loginUrl);
});

// === CALLBACK ===
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('Missing authorization code');

    try {
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.COGNITO_CLIENT_ID,
            redirect_uri: process.env.COGNITO_REDIRECT_URI,
            code,
        });

        const response = await fetch(`https://${process.env.COGNITO_DOMAIN}/oauth2/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Token exchange failed:', text);
            return res.status(500).send('Token exchange failed');
        }

        const tokens = await response.json();
        const decoded = await verifyCognitoToken(tokens.id_token);

        // Sync user record
        const { sub, email } = decoded;
        await db.insert(users)
            .values({ id: sub, email, lastLoginAt: new Date() })
            .onConflictDoUpdate({
                target: users.id,
                set: { email, lastLoginAt: new Date() },
            });

        // Set secure cookie
        res.cookie('id_token', tokens.id_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (err) {
        console.error('Auth callback error:', err);
        res.status(500).send('Authentication failed');
    }
});

// === LOGOUT ===
router.get('/logout', (req, res) => {
    res.clearCookie('id_token');
    const logoutUrl = `https://${process.env.COGNITO_DOMAIN}/logout?client_id=${process.env.COGNITO_CLIENT_ID}&logout_uri=${encodeURIComponent(process.env.FRONTEND_URL)}`;
    res.redirect(logoutUrl);
});

export default router;
