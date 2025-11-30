import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [status, setStatus] = useState('verifying');
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                await axios.post(`${API_URL}/api/auth/verify-email`, { token });
                setStatus('success');
                showNotification('Email verified successfully!', 'success');
                setTimeout(() => navigate('/login'), 3000);
            } catch (error) {
                console.error(error);
                setStatus('error');
                showNotification(error.response?.data?.message || 'Verification failed', 'error');
            }
        };

        verify();
    }, [token, navigate, showNotification]);

    return (
        <div className="container" style={{ marginTop: '100px', textAlign: 'center' }}>
            <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto' }}>
                {status === 'verifying' && (
                    <>
                        <h2>Verifying Email...</h2>
                        <p>Please wait while we verify your email address.</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <h2 style={{ color: '#48bb78' }}>Verified!</h2>
                        <p>Your email has been verified successfully.</p>
                        <p>Redirecting to login...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <h2 style={{ color: '#f56565' }}>Verification Failed</h2>
                        <p>The verification link is invalid or has expired.</p>
                        <button onClick={() => navigate('/login')} className="btn btn-primary">Go to Login</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
