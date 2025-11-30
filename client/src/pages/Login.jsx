import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isUnverified, setIsUnverified] = useState(false);
    const [resendStatus, setResendStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsUnverified(false);
        const res = await login(email, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.message);
            if (res.isUnverified) {
                setIsUnverified(true);
            }
        }
    };

    const handleResend = async () => {
        try {
            setResendStatus('Sending...');
            // We need to import axios or use a context method. Since axios is not imported, let's assume we can use fetch or add axios.
            // But wait, axios is not imported in the original file. Let's use fetch for simplicity or add axios import.
            // Better to add axios import.
            // For now, I'll use fetch to avoid adding import if possible, but the project uses axios.
            // I will add axios import in a separate step if needed, but let's try to use the existing pattern.
            // Actually, I can just use fetch.
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                setResendStatus('Email sent!');
            } else {
                setResendStatus(data.message || 'Failed to send.');
            }
        } catch (err) {
            setResendStatus('Error sending email.');
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-panel auth-form">
                <h2 style={{ textAlign: 'center' }}>Welcome Back</h2>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                {isUnverified && (
                    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                        <button
                            type="button"
                            onClick={handleResend}
                            className="btn btn-sm btn-secondary"
                            disabled={resendStatus === 'Sending...' || resendStatus === 'Email sent!'}
                        >
                            {resendStatus || 'Resend Verification Email'}
                        </button>
                    </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="form-group">
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <Link to="/forgot-password" style={{ color: 'var(--primary-color)', fontSize: '0.9rem', textDecoration: 'none' }}>
                        Forgot Password?
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
