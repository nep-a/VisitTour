import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [demoToken, setDemoToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        setDemoToken('');

        try {
            const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            setMessage(res.data.message);
            // For demo purposes only, show the link
            if (res.data.token) {
                setDemoToken(res.data.token);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-panel auth-form">
                <h2 style={{ textAlign: 'center' }}>Reset Password</h2>
                <p style={{ textAlign: 'center', color: '#666' }}>Enter your email to receive a reset link.</p>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                {demoToken && (
                    <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '8px', fontSize: '0.9rem' }}>
                        <strong>Demo Only:</strong><br />
                        <Link to={`/reset-password/${demoToken}`}>Click here to reset password</Link>
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
