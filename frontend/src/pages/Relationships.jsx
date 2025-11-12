import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchRelationships,
    sendFriendRequest,
    acceptRequest,
    removeFriend,
    blockUser,
    unblockUser,
    cancelRequest,
} from "../features/relationshipsSlice";
import { Link } from "react-router-dom";

export default function Relationships() {
    const dispatch = useDispatch();
    const { list: relationships, loading, error } = useSelector(
        (state) => state.relationships
    );
    const [targetId, setTargetId] = useState("");

    // === Initial load ===
    useEffect(() => {
        dispatch(fetchRelationships());
    }, [dispatch]);

    // === Handlers ===
    const handleSendRequest = () => {
        if (!targetId.trim()) return alert("Enter a valid user ID or email");
        dispatch(sendFriendRequest(targetId.trim()))
            .unwrap()
            .then(() => setTargetId(""))
            .catch((err) => alert(`❌ ${err}`));
    };

    const handleAccept = (senderId) => dispatch(acceptRequest(senderId));
    const handleRemove = (targetId) => dispatch(removeFriend(targetId));
    const handleBlock = (targetId) => dispatch(blockUser(targetId));
    const handleUnblock = (targetId) => dispatch(unblockUser(targetId));
    const handleCancel = (targetId) => dispatch(cancelRequest(targetId));

    if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
    if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

    const friends = relationships.filter((r) => r.status === "friend");
    const pending = relationships.filter((r) => r.status === "pending");
    const incoming = relationships.filter((r) => r.status === "incoming");
    const blocked = relationships.filter((r) => r.status === "blocked");

    return (
        <div style={{ maxWidth: 600, margin: "3rem auto", textAlign: "center" }}>
            <Link to="/dashboard">← Back to Dashboard</Link>

            <h1>👥 Relationships</h1>

            {/* === Add friend form === */}
            <div style={{ marginBottom: "2rem" }}>
                <input
                    placeholder="Enter user ID or email to send request"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                />
                <button onClick={handleSendRequest} style={{ marginLeft: "1rem" }}>
                    Send Request
                </button>
            </div>

            <Section title="Friends" list={friends}>
                {friends.length === 0 ? (
                    <p>No friends yet.</p>
                ) : (
                    friends.map((r) => (
                        <RelationshipRow
                            key={`${r.id}-friend`}
                            name={r.username || r.email}
                            status="Friend"
                            onRemove={() => handleRemove(r.id)}
                            onBlock={() => handleBlock(r.id)}
                        />
                    ))
                )}
            </Section>

            <Section title="Pending Requests" list={pending}>
                {pending.length === 0 ? (
                    <p>No outgoing requests.</p>
                ) : (
                    pending.map((r) => (
                        <RelationshipRow
                            key={`${r.id}-pending`}
                            name={r.username || r.email}
                            status="Pending"
                            onCancel={() => handleCancel(r.id)} // 👈 new button
                            onBlock={() => handleBlock(r.id)}
                        />
                    ))
                )}
            </Section>

            <Section title="Incoming Requests" list={incoming}>
                {incoming.length === 0 ? (
                    <p>No incoming requests.</p>
                ) : (
                    incoming.map((r) => (
                        <RelationshipRow
                            key={`${r.id}-incoming`}
                            name={r.username || r.email}
                            status="Incoming"
                            onAccept={() => handleAccept(r.id)}
                            onBlock={() => handleBlock(r.id)}
                        />
                    ))
                )}
            </Section>

            <Section title="Blocked Users" list={blocked}>
                {blocked.length === 0 ? (
                    <p>No blocked users.</p>
                ) : (
                    blocked.map((r) => (
                        <RelationshipRow
                            key={`${r.id}-blocked`}
                            name={r.username || r.email}
                            status="Blocked"
                            onUnblock={() => handleUnblock(r.id)}
                        />
                    ))
                )}
            </Section>
        </div>
    );
}

/* === UI components === */
function Section({ title, children }) {
    return (
        <div style={{ marginTop: "2rem" }}>
            <h2>{title}</h2>
            <div>{children}</div>
        </div>
    );
}

function RelationshipRow({ name, status, onAccept, onRemove, onBlock, onUnblock, onCancel }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
                borderBottom: "1px solid #ccc",
                paddingBottom: "0.5rem",
            }}
        >
            <div>
                <strong>{name}</strong>{" "}
                <span style={{ color: "#777" }}>({status})</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
                {onAccept && <button onClick={onAccept}>Accept</button>}
                {onCancel && <button onClick={onCancel}>Cancel</button>}
                {onRemove && <button onClick={onRemove}>Remove</button>}
                {onBlock && <button onClick={onBlock}>Block</button>}
                {onUnblock && <button onClick={onUnblock}>Unblock</button>}
            </div>
        </div>
    );
}

