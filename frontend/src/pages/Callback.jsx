import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Callback() {
    const navigate = useNavigate();

    useEffect(() => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const idToken = params.get('id_token');
        const accessToken = params.get('access_token');
        const expiresIn = params.get('expires_in');

        if (idToken && accessToken) {
            localStorage.setItem('id_token', idToken);
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('expires_in', expiresIn);
            console.log('✅ Tokens stored:', { idToken, accessToken, expiresIn });

            // Clear hash before redirecting (to avoid re-triggering)
            window.location.hash = '';
            navigate('/dashboard', { replace: true });
        } else {
            // Only warn if tokens are *not already* in storage (prevents double log)
            if (!localStorage.getItem('id_token')) {
                console.error('❌ No tokens found in URL');
                navigate('/', { replace: true });
            }
        }
    }, [navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h2>Signing you in...</h2>
        </div>
    );
}
