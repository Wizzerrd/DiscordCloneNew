export default function Home() {
    // Pull from Vite env vars (set these in .env.local for dev)
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/callback';

    const loginUrl = `${cognitoDomain}/login?client_id=${clientId}&response_type=token&scope=email+openid+profile&redirect_uri=${encodeURIComponent(
        redirectUri
    )}`;

    const handleLogin = () => {
        window.location.href = loginUrl;
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '5rem' }}>
            <h1>DiscordClone 🔐</h1>
            <p>Log in to continue</p>
            <button onClick={handleLogin}>Login with Cognito</button>
        </div>
    );
}
