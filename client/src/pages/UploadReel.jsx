import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UploadReel = () => {
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        price: '',
        category: 'Stay'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = function () {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > 105) {
                    alert("Video duration must be 1 minute 45 seconds or less.");
                    setFile(null);
                    e.target.value = ""; // Reset input
                } else {
                    setFile(selectedFile);
                }
            };
            video.src = URL.createObjectURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please select a video');

        const data = new FormData();
        data.append('video', file);
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/reels`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            navigate('/');
        } catch (error) {

            if (error.response?.status === 403 && error.response?.data?.verificationStatus) {
                alert(error.response.data.message);
                navigate('/verification');
            } else {
                alert('Upload failed: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px' }}>
            <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2>Upload New Reel</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label>Video (Max 1m 45s)</label>
                        <input type="file" accept="video/*" onChange={handleFileChange} required />
                    </div>
                    <div className="form-group">
                        <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows="3" />
                    </div>
                    <div className="form-group">
                        <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <input name="price" type="number" placeholder="Price (Ksh)" value={formData.price} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="Safari">Safari</option>
                            <option value="Beach">Beach</option>
                            <option value="Staycation">Staycation</option>
                            <option value="Culture">Culture</option>
                            <option value="Food">Food</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Uploading...' : 'Publish Reel'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadReel;
