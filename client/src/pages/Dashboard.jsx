import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import CustomSelect from '../components/CustomSelect';
import EditReelModal from '../components/EditReelModal';
import { FaClock, FaCheckCircle, FaSpinner, FaFlagCheckered, FaTimesCircle, FaEye, FaChartLine, FaUsers, FaTrash, FaEdit, FaCog } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [myReels, setMyReels] = useState([]);
    const [editingReel, setEditingReel] = useState(null);
    const [analytics, setAnalytics] = useState({ totalViews: 0, totalReels: 0, topReels: [] });
    const [teamMembers, setTeamMembers] = useState([]);
    const [verification, setVerification] = useState({ status: 'loading', feedback: '' });
    const [settings, setSettings] = useState({ username: '', bio: '', phone_number: '' });
    const [managedAccounts, setManagedAccounts] = useState([]);
    const [currentHostId, setCurrentHostId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const { showNotification } = useNotification();

    useEffect(() => {
        if (user) {
            setCurrentHostId(user.id);
            fetchManagedAccounts();
        }
    }, [user]);

    useEffect(() => {
        if (!currentHostId) return;
        fetchVerification();
        if (activeTab === 'bookings') fetchBookings();
        if (activeTab === 'reviews') fetchReviews();
        if (activeTab === 'reels') fetchMyReels();
        if (activeTab === 'analytics') fetchAnalytics();
        if (activeTab === 'team') fetchTeamMembers();
        if (activeTab === 'settings') fetchSettings();
    }, [activeTab, currentHostId]);

    const fetchManagedAccounts = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/team/managing`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setManagedAccounts(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchVerification = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/verification/status`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setVerification(res.data);
        } catch (error) {
            console.error(error);
            setVerification({ status: 'unverified' });
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/bookings/host-bookings`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { hostId: currentHostId }
            });
            setBookings(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/reviews/host-reviews`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { hostId: currentHostId }
            });
            setReviews(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/reels/host/analytics`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { hostId: currentHostId }
            });
            setAnalytics(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMyReels = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/reels/host/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { hostId: currentHostId }
            });
            setMyReels(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSettings = async () => {
        try {
            const endpoint = currentHostId === user.id ? `${API_URL}/api/users/me` : `${API_URL}/api/users/profile/${currentHostId}`;
            const res = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSettings({
                username: res.data.username || '',
                bio: res.data.bio || '',
                phone_number: res.data.phone_number || ''
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        try {
            const endpoint = currentHostId === user.id ? `${API_URL}/api/users/me` : `${API_URL}/api/users/profile/${currentHostId}`;
            await axios.put(endpoint, settings, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showNotification('Profile updated', 'success');
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to update profile', 'error');
        }
    };

    const handleDeleteReel = async (id) => {
        if (!confirm('Are you sure you want to delete this reel?')) return;
        try {
            await axios.delete(`${API_URL}/api/reels/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showNotification('Reel deleted', 'success');
            fetchMyReels();
        } catch (error) {
            showNotification('Failed to delete reel', 'error');
        }
    };

    const handleReply = async (reviewId, replyText) => {
        try {
            await axios.put(`${API_URL}/api/reviews/${reviewId}/reply`,
                { reply: replyText },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            showNotification('Reply sent!', 'success');
            fetchReviews();
        } catch (error) {
            showNotification('Failed to send reply', 'error');
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            await axios.put(`${API_URL}/api/bookings/${bookingId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
            showNotification(`Booking status updated to ${newStatus}`, 'success');
        } catch (error) {
            showNotification('Failed to update status', 'error');
        }
    };

    const handleAddTeamMember = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const role = e.target.role.value;
        try {
            await axios.post(`${API_URL}/api/team`,
                { email, role },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            showNotification('Team member added!', 'success');
            e.target.reset();
            fetchTeamMembers();
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to add member', 'error');
        }
    };

    const handleRemoveTeamMember = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await axios.delete(`${API_URL}/api/team/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showNotification('Team member removed', 'success');
            fetchTeamMembers();
        } catch (error) {
            showNotification('Failed to remove member', 'error');
        }
    };

    return (
        <div className="container dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Host Dashboard</h2>
                {managedAccounts.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label>Managing:</label>
                        <select
                            value={currentHostId || ''}
                            onChange={(e) => setCurrentHostId(Number(e.target.value))}
                            style={{ padding: '8px', borderRadius: '5px' }}
                        >
                            <option value={user?.id}>My Account</option>
                            {managedAccounts.map(team => (
                                <option key={team.id} value={team.host_id}>
                                    {team.Host.username}'s Account
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {verification.status !== 'verified' && (
                <div className="alert" style={{
                    background: verification.status === 'pending' ? 'rgba(0, 100, 255, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: `1px solid ${verification.status === 'pending' ? '#0af' : '#f00'}`,
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h4 style={{ margin: 0, color: verification.status === 'pending' ? '#0af' : '#f00' }}>
                            {verification.status === 'pending' ? 'Verification Pending' : 'Account Not Verified'}
                        </h4>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                            {verification.status === 'pending'
                                ? 'Your documents are being processed.'
                                : 'You must verify your identity to publish reels.'}
                        </p>
                    </div>
                    {verification.status !== 'pending' && (
                        <a href="/verification" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                            Verify Now
                        </a>
                    )}
                </div>
            )}

            <div className="dashboard-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <button
                    className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    Bookings
                </button>
                <button
                    className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    Reviews
                </button>
                <button
                    className={`btn ${activeTab === 'reels' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('reels')}
                >
                    My Reels
                </button>
                <button
                    className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    Analytics
                </button>
                {((currentHostId === user?.id && user?.host_type === 'business') || (currentHostId !== user?.id)) && (
                    <button
                        className={`btn ${activeTab === 'team' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('team')}
                    >
                        Team
                    </button>
                )}
                <button
                    className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </div>

            {activeTab === 'bookings' && (
                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>Recent Bookings</h3>
                        <select onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="table-container">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '10px' }}>Traveler</th>
                                    <th style={{ padding: '10px' }}>Reel</th>
                                    <th style={{ padding: '10px' }}>Date</th>
                                    <th style={{ padding: '10px' }}>Guests</th>
                                    <th style={{ padding: '10px' }}>Total</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.filter(b => filterStatus === 'all' || b.status === filterStatus).map(booking => (
                                    <tr key={booking.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ fontWeight: '500' }}>{booking.traveler_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#718096' }}>{booking.User?.email}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#718096' }}>{booking.phone_number}</div>
                                        </td>
                                        <td style={{ padding: '10px' }}>{booking.Reel?.title}</td>
                                        <td style={{ padding: '10px' }}>{booking.booking_date}</td>
                                        <td style={{ padding: '10px' }}>{booking.guests}</td>
                                        <td style={{ padding: '10px' }}>Ksh {booking.total_price}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span className={`badge`} style={{
                                                background: booking.status === 'confirmed' ? '#c6f6d5' :
                                                    booking.status === 'pending' ? '#feebc8' :
                                                        booking.status === 'cancelled' ? '#fed7d7' : '#bee3f8',
                                                color: booking.status === 'confirmed' ? '#22543d' :
                                                    booking.status === 'pending' ? '#744210' :
                                                        booking.status === 'cancelled' ? '#822727' : '#2a4365',
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', textTransform: 'capitalize'
                                            }}>
                                                {booking.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                {booking.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleStatusChange(booking.id, 'confirmed')} className="btn btn-sm" style={{ background: '#48bb78', color: 'white', padding: '6px' }} title="Confirm">
                                                            <FaCheckCircle />
                                                        </button>
                                                        <button onClick={() => handleStatusChange(booking.id, 'cancelled')} className="btn btn-sm" style={{ background: '#f56565', color: 'white', padding: '6px' }} title="Cancel">
                                                            <FaTimesCircle />
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status === 'confirmed' && (
                                                    <button onClick={() => handleStatusChange(booking.id, 'completed')} className="btn btn-sm" style={{ background: '#4299e1', color: 'white', padding: '6px' }} title="Mark Completed">
                                                        <FaFlagCheckered />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {bookings.length === 0 && <p style={{ textAlign: 'center', padding: '20px' }}>No bookings found.</p>}
                    </div>
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="glass-panel">
                    <h3>Reviews</h3>
                    <div className="reviews-list" style={{ marginTop: '20px' }}>
                        {reviews.map(review => (
                            <div key={review.id} style={{ padding: '15px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div>
                                        <strong>{review.Reel.title}</strong>
                                        <div style={{ fontSize: '0.9rem', color: '#718096' }}>by {review.User.username}</div>
                                    </div>
                                    <div style={{ color: '#ffc107' }}>
                                        {[...Array(review.rating)].map((_, i) => <span key={i}>★</span>)}
                                    </div>
                                </div>
                                <p style={{ margin: '10px 0' }}>{review.comment}</p>
                                {review.host_reply ? (
                                    <div style={{ background: '#f7fafc', padding: '10px', borderRadius: '8px', marginTop: '10px', borderLeft: '3px solid var(--primary-color)' }}>
                                        <strong>Your Reply:</strong>
                                        <p style={{ margin: '5px 0 0 0' }}>{review.host_reply}</p>
                                    </div>
                                ) : (
                                    <form onSubmit={(e) => { e.preventDefault(); handleReply(review.id, e.target.reply.value); }} style={{ marginTop: '10px' }}>
                                        <input name="reply" placeholder="Write a reply..." style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #e2e8f0', marginBottom: '5px' }} />
                                        <button type="submit" className="btn btn-sm btn-primary">Reply</button>
                                    </form>
                                )}
                            </div>
                        ))}
                        {reviews.length === 0 && <p style={{ textAlign: 'center', padding: '20px' }}>No reviews yet.</p>}
                    </div>
                </div>
            )}

            {activeTab === 'reels' && (
                <div className="glass-panel">
                    <h3>My Reels</h3>
                    <div className="table-container">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '10px' }}>Title</th>
                                    <th style={{ padding: '10px' }}>Views</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myReels.map(reel => (
                                    <tr key={reel.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={{ padding: '10px' }}>{reel.title}</td>
                                        <td style={{ padding: '10px' }}>{reel.views}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                padding: '5px 10px',
                                                borderRadius: '15px',
                                                background: reel.moderation_status === 'approved' ? '#48bb78' :
                                                    reel.moderation_status === 'rejected' ? '#f56565' : '#ed8936',
                                                color: 'white',
                                                fontSize: '0.8rem'
                                            }}>
                                                {reel.moderation_status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <button onClick={() => setEditingReel(reel)} className="btn btn-sm" style={{ marginRight: '5px', background: '#4299e1', color: 'white' }}>
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDeleteReel(reel.id)} className="btn btn-sm" style={{ background: '#e53e3e', color: 'white' }}>
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {editingReel && (
                        <EditReelModal
                            reel={editingReel}
                            onClose={() => setEditingReel(null)}
                            onUpdate={(updatedReel) => {
                                setMyReels(prev => prev.map(r => r.id === updatedReel.id ? updatedReel : r));
                                showNotification('Reel updated', 'success');
                            }}
                        />
                    )}
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="glass-panel">
                    <h3>Analytics</h3>
                    <div className="stats-grid" style={{ marginTop: '20px' }}>
                        <div className="stat-card">
                            <h3>Total Views</h3>
                            <div className="stat-number"><FaEye /> {analytics.totalViews}</div>
                        </div>
                        <div className="stat-card">
                            <h3>Total Reels</h3>
                            <div className="stat-number"><FaChartLine /> {analytics.totalReels}</div>
                        </div>
                    </div>
                    <h4 style={{ marginTop: '30px' }}>Top Performing Reels</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {analytics.topReels.map(reel => (
                            <li key={reel.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                                <span>{reel.title}</span>
                                <span><strong>{reel.views}</strong> views</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {activeTab === 'team' && (
                <div className="glass-panel">
                    <h3>Team Management</h3>
                    <p>Add staff members to help manage your bookings and reels.</p>

                    <form onSubmit={handleAddTeamMember} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <input name="email" type="email" placeholder="Staff Email" required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', flex: 1 }} />
                        <select name="role" style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}>
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button type="submit" className="btn btn-primary">Add Member</button>
                    </form>

                    <div className="table-container">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '10px' }}>User</th>
                                    <th style={{ padding: '10px' }}>Email</th>
                                    <th style={{ padding: '10px' }}>Role</th>
                                    <th style={{ padding: '10px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamMembers.map(member => (
                                    <tr key={member.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={{ padding: '10px' }}>{member.Member.username}</td>
                                        <td style={{ padding: '10px' }}>{member.Member.email}</td>
                                        <td style={{ padding: '10px' }}>{member.role}</td>
                                        <td style={{ padding: '10px' }}>
                                            <button onClick={() => handleRemoveTeamMember(member.id)} className="btn btn-sm" style={{ background: '#e53e3e', color: 'white' }}>
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="glass-panel">
                    <h3>Profile Settings</h3>
                    <form onSubmit={handleUpdateSettings} style={{ maxWidth: '500px' }}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                value={settings.username}
                                onChange={e => setSettings({ ...settings, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                value={settings.phone_number}
                                onChange={e => setSettings({ ...settings, phone_number: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Bio</label>
                            <textarea
                                value={settings.bio}
                                onChange={e => setSettings({ ...settings, bio: e.target.value })}
                                rows="4"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
