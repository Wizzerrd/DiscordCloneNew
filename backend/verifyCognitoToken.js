import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const region = process.env.COGNITO_REGION;
const userPoolId = process.env.COGNITO_POOL_ID;
const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

let pems = null;

async function getPems() {
    if (pems) return pems;
    const url = `${issuer}/.well-known/jwks.json`;
    const res = await fetch(url);
    const { keys } = await res.json();
    pems = {};
    keys.forEach((key) => {
        pems[key.kid] = jwkToPem(key);
    });
    return pems;
}

export async function verifyCognitoToken(token) {
    try {
        const decoded = jwt.decode(token, { complete: true });
        const pems = await getPems();
        const pem = pems[decoded.header.kid];
        if (!pem) throw new Error('Invalid token');
        return jwt.verify(token, pem, { issuer });
    } catch (err) {
        console.error('Token verification error:', err.message);
        throw new Error('Invalid token');
    }
}
