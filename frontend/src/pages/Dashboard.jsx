import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSession, logout } from "../features/authSlice";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, loading } = useSelector((s) => s.auth);
    const [username, setUsername] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (!loading && !user) navigate("/home");
        if (user) setUsername(user.username || "");
    }, [loading, user, navigate]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await fetch(`${API_BASE}/api/users/me`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username }),
            });
            if (!res.ok) throw new Error("Update failed");
            const data = await res.json();
            setSaving(false);
            setUsername(data.user.username);
        } catch {
            setError("Failed to update username");
            setSaving(false);
        }
    };

    if (loading)
        return <p style={{ textAlign: "center", marginTop: "3rem" }}>Loading...</p>;

    if (!user) return null; // redirect handled above

    return (
        <div style={{ maxWidth: 600, margin: "3rem auto", textAlign: "center" }}>
            <h1>Welcome 👋</h1>
            <p>
                <strong>User ID:</strong> {user.id}
            </p>
            <p>
                <strong>Email:</strong> {user.email}
            </p>

            <div style={{ marginTop: "2rem" }}>
                <label>
                    <strong>Username:</strong>
                    <input
                        style={{ marginLeft: "1rem" }}
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </label>
                <button onClick={handleSave} disabled={saving} style={{ marginLeft: "1rem" }}>
                    {saving ? "Saving..." : "Save"}
                </button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>

            <button
                onClick={() => dispatch(logout()).then(() => (window.location.href = "/home"))}
                style={{ marginTop: "2rem" }}
            >
                Log out
            </button>
        </div>
    );
}
