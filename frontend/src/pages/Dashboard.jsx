import { useEffect, useState } from 'react';

export default function Dashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
            credentials: 'include', // sends cookie with request
        })
            .then(res => {
                if (!res.ok) throw new Error('Not authenticated');
                return res.json();
            })
            .then(setUser)
            .catch(() => setUser(null));
    }, []);

    if (!user)
        return (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <h2>Not signed in</h2>
                <a href={`${import.meta.env.VITE_API_BASE_URL}/auth/login`}>Sign in</a>
            </div>
        );

    return (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h1>Welcome 👋</h1>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button onClick={() => (window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/logout`)}>
                Logout
            </button>
        </div>
    );
}
