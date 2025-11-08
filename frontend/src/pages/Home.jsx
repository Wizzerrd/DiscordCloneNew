export default function Home() {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const handleLogin = () => {
        window.location.href = `${API_BASE}/auth/login`;
    };

    return (
        <div style={{ textAlign: "center", marginTop: "5rem" }}>
            <h1>DiscordClone 🔐</h1>
            <p>Log in to continue</p>
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}
