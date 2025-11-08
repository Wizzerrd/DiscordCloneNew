import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchServers, createServer } from "../features/serversSlice";

export default function Servers() {
    const dispatch = useDispatch();
    const { list: servers, loading, error } = useSelector((state) => state.servers);
    const [newName, setNewName] = useState("");

    useEffect(() => {
        dispatch(fetchServers());
    }, [dispatch]);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        await dispatch(createServer(newName));
        setNewName("");
    };

    if (loading) return <p style={{ textAlign: "center" }}>Loading servers...</p>;
    if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

    return (
        <div style={{ maxWidth: 600, margin: "3rem auto", textAlign: "center" }}>
            <h1>🛠️ My Servers</h1>

            <div style={{ marginBottom: "2rem" }}>
                <input
                    placeholder="New server name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <button onClick={handleCreate} style={{ marginLeft: "1rem" }}>
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
