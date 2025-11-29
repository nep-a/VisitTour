import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Verification = () => {
    const [status, setStatus] = useState('loading');
    const [feedback, setFeedback] = useState('');
    const [legalName, setLegalName] = useState('');
    const [hostType, setHostType] = useState('individual');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/verification/status`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setStatus(res.data.status);
            setFeedback(res.data.feedback);
            if (res.data.legalName) setLegalName(res.data.legalName);
            if (res.data.hostType) setHostType(res.data.hostType);
        } catch (error) {
            console.error(error);
            setStatus('unverified');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please upload a document');

        const formData = new FormData();
        formData.append('document', file);
        formData.append('legalName', legalName);

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/verification/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setStatus(res.data.status);
            setFeedback(res.data.feedback);
        } catch (error) {
            alert('Upload failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') return <div className="container" style={{ paddingTop: '100px' }}>Loading...</div>;

    return (
        <div className="container" style={{ paddingTop: '100px' }}>
            <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2>Host Verification</h2>

                {status === 'verified' && (
                    <div className="alert alert-success" style={{ background: 'rgba(0, 255, 0, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #0f0' }}>
                        <h3 style={{ color: '#0f0', marginTop: 0 }}>✅ Verified</h3>
                        <p>Your account is fully verified. You can now publish reels.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/upload')} style={{ marginTop: '10px' }}>Go to Upload</button>
                    </div>
                )}

                {status === 'pending' && (
                    <div className="alert alert-info" style={{ background: 'rgba(0, 100, 255, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #0af' }}>
                        <h3 style={{ color: '#0af', marginTop: 0 }}>⏳ Verification Pending</h3>
                        <p>Your documents are being processed. This usually takes a few minutes.</p>
                    </div>
                )}

                {(status === 'unverified' || status === 'rejected') && (
                    <div>
                        {status === 'rejected' && (
                            <div className="alert alert-danger" style={{ background: 'rgba(255, 0, 0, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #f00', marginBottom: '20px' }}>
                                <h3 style={{ color: '#f00', marginTop: 0 }}>❌ Verification Failed</h3>
                                <p>{feedback}</p>
                                <p>Please try again with valid documents.</p>
                            </div>
                        )}

                        <p>To ensure trust and safety, all hosts must verify their identity before publishing content.</p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                            <div className="form-group">
                                <label>Legal Name</label>
                                <input
                                    value={legalName}
                                    onChange={(e) => setLegalName(e.target.value)}
                                    placeholder="Enter your full legal name"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    {hostType === 'business'
                                        ? 'Business Registration Certificate'
                                        : 'Identity Document (ID or Passport)'}
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    required
                                    style={{ width: '100%', padding: '10px' }}
                                />
                                <small style={{ color: '#ccc' }}>Accepted formats: JPG, PNG, PDF</small>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Verifying...' : 'Submit for Verification'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Verification;
