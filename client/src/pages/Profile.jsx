import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            // Fetch latest user data to get current profile pic
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.data.profile_picture) {
                setPreview(`${API_URL}${res.data.profile_picture}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('username', username);
        if (file) {
            formData.append('profile_picture', file);
        }

        try {
            const res = await axios.put(`${API_URL}/api/users/me`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setMessage('Profile updated successfully!');
            // Update local context/storage if needed, though AuthContext might need a refresh method
            // For now, let's just update the user object in localStorage loosely or rely on fetch
        } catch (error) {
            setMessage('Error updating profile: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px' }}>
            <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center' }}>Edit Profile</h2>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '3px solid var(--primary-color)',
                        background: '#eee'
                    }}>
                        {preview ? (
                            <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                                No Image
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '100%', boxShadow: 'none', padding: '0', background: 'transparent' }}>
                    <div className="form-group">
                        <label>Profile Picture</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div className="form-group">
                        <label>Username</label>
                        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    {message && <p style={{ textAlign: 'center', color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
