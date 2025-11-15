// lib/secrets.js
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-west-2" });

let cachedSecret = null;
let cacheTs = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getSecret(secretArnOrName) {
    if (cachedSecret && (Date.now() - cacheTs) < CACHE_TTL) {
        return cachedSecret;
    }

    const cmd = new GetSecretValueCommand({ SecretId: secretArnOrName });
    const res = await client.send(cmd);

    // secret string can be JSON or plain text
    const secretString = res.SecretString || Buffer.from(res.SecretBinary, "base64").toString();
    let parsed;
    try { parsed = JSON.parse(secretString); } catch (e) { parsed = secretString; }

    cachedSecret = parsed;
    cacheTs = Date.now();
    return parsed;
}
