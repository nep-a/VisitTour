import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await axios.post(`${API_URL}/api/auth/verify-email`, { token });
                setStatus('success');
                setMessage(res.data.message);
                setTimeout(() => navigate('/login'), 3000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed.');
            }
        };
        if (token) verify();
    }, [token, navigate]);

    return (
        <div className="auth-container">
            <div className="glass-panel auth-form" style={{ textAlign: 'center' }}>
                <h2>Email Verification</h2>

                {status === 'verifying' && <p>Verifying your email...</p>}

                {status === 'success' && (
                    <div className="alert alert-success">
                        <h3>✅ Verified!</h3>
                        <p>{message}</p>
                        <p>Redirecting to login...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="alert alert-danger">
                        <h3>❌ Verification Failed</h3>
                        <p>{message}</p>
                        <Link to="/login" className="btn btn-primary" style={{ marginTop: '10px', textDecoration: 'none' }}>
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
