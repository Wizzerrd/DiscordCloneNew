import { useEffect, useState } from 'react';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const idToken = localStorage.getItem('id_token');

        if (!idToken) {
            setError('No token found. Please log in again.');
            return;
        }

        async function verifyToken() {
            try {
                const res = await fetch('http://localhost:8000/api/protected', {
                    headers: { Authorization: `Bearer ${idToken}` },
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setUser(data.user);
            } catch (err) {
                console.error('Token verification failed:', err);
                setError('Token invalid or expired. Please log in again.');
            }
        }

        verifyToken();
    }, []);

    if (error)
        return (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <h2>⚠️ {error}</h2>
            </div>
        );

    if (!user)
        return (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <h2>Loading user info...</h2>
            </div>
        );

    return (
        <div style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
            <h1>Welcome 👋</h1>
            <p>
                <strong>User ID:</strong> {user.sub}
            </p>
            <p>
                <strong>Email:</strong> {user.email || '(no email claim)'}
            </p>
            <button
                onClick={() => {
                    localStorage.clear();
                    window.location.href = '/';
                }}
            >
                Log out
            </button>
        </div>
    );
}
