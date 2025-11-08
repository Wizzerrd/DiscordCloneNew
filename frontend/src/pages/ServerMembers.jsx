import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ServerMembers() {
    const { id } = useParams();
    const [members, setMembers] = useState([]);
    const [serverName, setServerName] = useState("");
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const loadMembers = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/servers/${id}/members`, {
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to fetch members");
                const data = await res.json();
                setMembers(data);

                // optionally infer server name from first row if present
                if (data.length > 0) setServerName(`${data[0].role === "owner" ? "Your " : ""}Server`);
            } catch (err) {
                console.error("Error fetching members:", err);
            }
        };
        loadMembers();
    }, [id]);

    return (
        <div style={{ maxWidth: 600, margin: "3rem auto", textAlign: "center" }}>
            <Link to="/servers">← Back to Servers</Link>
            <h1>👥 Members of {serverName || "Server"}</h1>
            {members.length === 0 ? (
                <p>No members found.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {members.map((m) => (
                        <li key={m.id} style={{ marginBottom: "0.5rem" }}>
                            <strong>{m.username || m.email}</strong> — {m.role}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
