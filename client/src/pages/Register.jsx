import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../components/CustomSelect';
import { FaUser, FaBuilding, FaUserTie } from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'traveler',
        hostType: 'individual'
    });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [demoToken, setDemoToken] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await register(formData.username, formData.email, formData.password, formData.role, formData.hostType);
        if (res.success) {
            setSuccess(true);
            if (res.token) setDemoToken(res.token);
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-panel auth-form">
                <h2 style={{ textAlign: 'center' }}>Join ZuruSasa</h2>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                {success ? (
                    <div className="alert alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <h3>Registration Successful!</h3>
                        <p>Please check your email to verify your account.</p>
                        {demoToken && (
                            <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', width: '100%' }}>
                                <strong>Demo Only:</strong><br />
                                <a href={`/verify-email/${demoToken}`} style={{ color: 'inherit', wordBreak: 'break-all' }}>
                                    Click here to verify email
                                </a>
                            </div>
                        )}
                        <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ marginTop: '15px' }}>
                            Go to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="form-group">
                            <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <CustomSelect
                                placeholder="Select Role"
                                value={formData.role}
                                onChange={(val) => setFormData({ ...formData, role: val })}
                                options={[
                                    { value: 'traveler', label: 'Traveler', icon: <FaUser /> },
                                    { value: 'host', label: 'Host', icon: <FaUserTie /> }
                                ]}
                            />
                        </div>
                        {formData.role === 'host' && (
                            <div className="form-group">
                                <label style={{ marginBottom: '8px', display: 'block' }}>Host Type</label>
                                <CustomSelect
                                    placeholder="Select Host Type"
                                    value={formData.hostType}
                                    onChange={(val) => setFormData({ ...formData, hostType: val })}
                                    options={[
                                        { value: 'individual', label: 'Individual', icon: <FaUser /> },
                                        { value: 'business', label: 'Business', icon: <FaBuilding /> }
                                    ]}
                                />
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary">Sign Up</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Register;
