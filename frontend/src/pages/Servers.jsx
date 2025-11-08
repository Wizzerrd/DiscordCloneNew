import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Servers() {
    const [servers, setServers] = useState([]);
    const [newName, setNewName] = useState("");
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const loadServers = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/servers/mine`, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch servers");
            const data = await res.json();
            setServers(data);
        } catch (err) {
            console.error("Failed to load servers:", err);
        }
    };

    const createServer = async () => {
        if (!newName.trim()) return;
        try {
            const res = await fetch(`${API_BASE}/api/servers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newName }),
            });
            if (res.ok) {
                setNewName("");
                loadServers();
            } else {
                console.error("Failed to create server");
            }
        } catch (err) {
            console.error("Error creating server:", err);
        }
    };

    useEffect(() => {
        loadServers();
    }, []);

    return (
        <div style={{ maxWidth: 600, margin: "3rem auto", textAlign: "center" }}>
            <h1>🛠️ My Servers</h1>

            <div style={{ marginBottom: "2rem" }}>
                <input
                    placeholder="New server name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <button onClick={createServer} style={{ marginLeft: "1rem" }}>
                    Create
                </button>
            </div>

            {servers.length === 0 ? (
                <p>No servers yet. Create one above.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {servers.map((s) => (
                        <li key={s.id} style={{ marginBottom: "0.75rem" }}>
                            <Link to={`/servers/${s.id}/members`}>{s.name}</Link> <span>({s.role})</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
