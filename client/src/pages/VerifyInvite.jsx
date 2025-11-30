import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VerifyInvite = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [toast, setToast] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setToast({ message: 'Passwords do not match', type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/verify-invite`, { token, newPassword: password });
            setToast({ message: 'Account verified successfully! Redirecting to login...', type: 'success' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setToast({ message: error.response?.data?.message || 'Verification failed', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-box">
                    <h2>Invalid Link</h2>
                    <p>The verification link is invalid or missing.</p>
                    <button onClick={() => navigate('/login')} className="btn btn-primary">Go to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="auth-box">
                <h2>Welcome to ZuruSasa</h2>
                <p style={{ marginBottom: '20px', color: '#718096' }}>Please set your password to activate your account.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter new password"
                            minLength="6"
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm new password"
                            minLength="6"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                        {isLoading ? 'Activating...' : 'Activate Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyInvite;
