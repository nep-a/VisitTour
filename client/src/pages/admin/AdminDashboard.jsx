import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaUsers, FaBullhorn, FaAd, FaSignOutAlt, FaList, FaSearch, FaEdit, FaKey, FaTrash, FaEnvelope, FaMoneyBillWave, FaEye, FaStar, FaPlus, FaCog, FaCalendarAlt, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Toast from '../../components/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // State
    const [activeSection, setActiveSection] = useState('analytics');
    const [analyticsData, setAnalyticsData] = useState(null);
    const [users, setUsers] = useState([]);
    const [ads, setAds] = useState([]);
    const [logs, setLogs] = useState([]);
    const [toast, setToast] = useState(null);

    // Forms & Modals
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'sales' });
    const [newAd, setNewAd] = useState({ title: '', image_url: '', link: '' });
    const [emailCampaign, setEmailCampaign] = useState({ subject: '', message: '', target: 'all' });
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('7days');
    const [editingUser, setEditingUser] = useState(null);
    const [resetPasswordUser, setResetPasswordUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (!user || !['admin', 'sales', 'marketing'].includes(user.role)) {
            navigate('/login');
            return;
        }
        if (user.role === 'sales' && activeSection === 'analytics') setActiveSection('sales');
        if (user.role === 'marketing' && activeSection === 'analytics') setActiveSection('marketing');
    }, [user, navigate]);

    useEffect(() => {
        if (activeSection === 'analytics' && user.role === 'admin') fetchAnalytics();
        if (activeSection === 'users' && user.role === 'admin') fetchUsers();
        if (activeSection === 'sales' && ['admin', 'sales'].includes(user.role)) fetchAds();
        if (activeSection === 'logs' && user.role === 'admin') fetchLogs();
    }, [activeSection, user, dateRange]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/analytics?range=${dateRange}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAnalyticsData(res.data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load analytics', 'error');
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(res.data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load users', 'error');
        }
    };

    const fetchAds = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/ads`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAds(res.data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load ads', 'error');
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/logs`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setLogs(res.data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load logs', 'error');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/admin/users`, newUser, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showToast('User created successfully');
            setNewUser({ username: '', email: '', password: '', role: 'sales' });
            fetchUsers();
        } catch (error) {
            showToast('Failed to create user', 'error');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/api/admin/users/${editingUser.id}`, editingUser, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showToast('User updated successfully');
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            showToast('Failed to update user', 'error');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            // Simulated API call - in real app, this would hit a reset endpoint
            await axios.put(`${API_URL}/api/admin/users/${resetPasswordUser.id}`, { password: newPassword }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showToast('Password reset successfully');
            setResetPasswordUser(null);
            setNewPassword('');
        } catch (error) {
            showToast('Failed to reset password', 'error');
        }
    };

    const handleCreateAd = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/admin/ads`, newAd, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showToast('Ad created successfully');
            setNewAd({ title: '', image_url: '', link: '' });
            fetchAds();
        } catch (error) {
            showToast('Failed to create ad', 'error');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`${API_URL}/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showToast('User deleted successfully');
            fetchUsers();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete user', 'error');
        }
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/admin/marketing/email`, emailCampaign, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showToast('Email campaign queued successfully');
            setEmailCampaign({ subject: '', message: '', target: 'all' });
        } catch (error) {
            showToast('Failed to send email', 'error');
        }
    };

    const handleResendInvite = async (email) => {
        try {
            // Simulated API call
            showToast(`Verification email sent to ${email}`);
        } catch (error) {
            showToast('Failed to send verification email', 'error');
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="admin-container">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <a href="/" className="sidebar-brand">
                        VisitTours <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Admin</span>
                    </a>
                </div>
                <nav className="sidebar-nav">
                    {user.role === 'admin' && (
                        <>
                            <button onClick={() => setActiveSection('analytics')} className={`admin-nav-item ${activeSection === 'analytics' ? 'active' : ''}`}>
                                <FaChartBar /> <span>Analytics</span>
                            </button>
                            <button onClick={() => setActiveSection('users')} className={`admin-nav-item ${activeSection === 'users' ? 'active' : ''}`}>
                                <FaUsers /> <span>User Management</span>
                            </button>
                            <button onClick={() => setActiveSection('logs')} className={`admin-nav-item ${activeSection === 'logs' ? 'active' : ''}`}>
                                <FaList /> <span>Audit Logs</span>
                            </button>
                        </>
                    )}
                    {['admin', 'marketing'].includes(user.role) && (
                        <button onClick={() => setActiveSection('marketing')} className={`admin-nav-item ${activeSection === 'marketing' ? 'active' : ''}`}>
                            <FaBullhorn /> <span>Marketing</span>
                        </button>
                    )}
                    {['admin', 'sales'].includes(user.role) && (
                        <button onClick={() => setActiveSection('sales')} className={`admin-nav-item ${activeSection === 'sales' ? 'active' : ''}`}>
                            <FaAd /> <span>Sales & Ads</span>
                        </button>
                    )}
                    <button onClick={() => setActiveSection('settings')} className={`admin-nav-item ${activeSection === 'settings' ? 'active' : ''}`}>
                        <FaCog /> <span>Settings</span>
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={() => { logout(); navigate('/login'); }} className="logout-btn">
                        <FaSignOutAlt /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="header-title" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
                        {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                    </div>
                    <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="user-info" style={{ textAlign: 'right' }}>
                            <span className="user-name" style={{ display: 'block', fontWeight: '600' }}>{user.username}</span>
                            <span className="user-role" style={{ fontSize: '0.85rem', color: '#718096', textTransform: 'uppercase' }}>{user.role}</span>
                        </div>
                        <div className="user-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {activeSection === 'analytics' && analyticsData && (
                        <div className="analytics-dashboard">
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaCalendarAlt style={{ color: '#718096' }} />
                                    <select
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                        style={{ border: 'none', background: 'transparent', fontSize: '0.9rem', color: 'var(--text-color)', cursor: 'pointer', outline: 'none' }}
                                    >
                                        <option value="7days">Last 7 Days</option>
                                        <option value="30days">Last 30 Days</option>
                                        <option value="90days">Last 3 Months</option>
                                        <option value="year">This Year</option>
                                    </select>
                                </div>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-title">Total Revenue</div>
                                    <div className="stat-number">${analyticsData.overview.totalRevenue.toLocaleString()}</div>
                                    <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#48bb78' }}>+12% from last month</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-title">Total Bookings</div>
                                    <div className="stat-number">{analyticsData.overview.totalBookings}</div>
                                    <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#48bb78' }}>+5% from last month</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-title">Total Views</div>
                                    <div className="stat-number">{analyticsData.overview.totalViews.toLocaleString()}</div>
                                    <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#48bb78' }}>+24% from last month</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-title">Avg Rating</div>
                                    <div className="stat-number">{analyticsData.overview.avgRating}</div>
                                    <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#ecc94b' }}>4.8 stars average</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                                <div className="chart-container">
                                    <div className="chart-header">
                                        <h3>User Distribution</h3>
                                    </div>
                                    <div style={{ height: '300px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Travelers', value: analyticsData.overview.totalTravelers },
                                                        { name: 'Bus. Hosts', value: analyticsData.overview.businessHosts },
                                                        { name: 'Ind. Hosts', value: analyticsData.overview.individualHosts }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {analyticsData.overview.totalTravelers > 0 && <Cell fill="#0088FE" />}
                                                    {analyticsData.overview.businessHosts > 0 && <Cell fill="#00C49F" />}
                                                    {analyticsData.overview.individualHosts > 0 && <Cell fill="#FFBB28" />}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="chart-container">
                                    <div className="chart-header">
                                        <h3>Booking Trends</h3>
                                    </div>
                                    <div style={{ height: '300px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={analyticsData.trends}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                                <YAxis axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                                <Line type="monotone" dataKey="count" stroke="#3182ce" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'users' && (
                        <div>
                            <div className="glass-panel" style={{ marginBottom: '24px' }}>
                                <h3 style={{ marginBottom: '20px' }}>Add New Staff Member</h3>
                                <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                                        <label>Username</label>
                                        <input placeholder="Enter username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} required />
                                    </div>
                                    <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                                        <label>Email</label>
                                        <input placeholder="Enter email" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                                    </div>
                                    <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                                        <label>Temporary Password</label>
                                        <input placeholder="Enter password" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
                                    </div>
                                    <div className="form-group" style={{ width: '150px', marginBottom: 0 }}>
                                        <label>Role</label>
                                        <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                            <option value="admin">Admin</option>
                                            <option value="sales">Sales</option>
                                            <option value="marketing">Marketing</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ height: '48px' }}>
                                        <FaPlus /> Add User
                                    </button>
                                </form>
                            </div>

                            <div className="glass-panel">
                                <div style={{ paddingBottom: '20px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0 }}>Staff Directory</h3>
                                    <div style={{ position: 'relative' }}>
                                        <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                                        <input
                                            placeholder="Search users..."
                                            style={{ paddingLeft: '35px', width: '250px', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4a5568' }}>
                                                            {u.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        {u.username}
                                                    </div>
                                                </td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <span className={`badge-role badge-${u.role}`}>{u.role}</span>
                                                </td>
                                                <td>
                                                    <span style={{ color: '#38a169', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38a169' }}></span> Active
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => setEditingUser(u)} className="btn btn-sm btn-secondary" title="Edit">
                                                            <FaEdit />
                                                        </button>
                                                        <button onClick={() => setResetPasswordUser(u)} className="btn btn-sm btn-secondary" title="Reset Password">
                                                            <FaKey />
                                                        </button>
                                                        <button onClick={() => handleResendInvite(u.email)} className="btn btn-sm btn-secondary" title="Resend Invite">
                                                            <FaPaperPlane />
                                                        </button>
                                                        {['sales', 'marketing'].includes(u.role) && (
                                                            <button onClick={() => handleDeleteUser(u.id)} className="btn btn-sm btn-danger" title="Delete">
                                                                <FaTrash />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeSection === 'marketing' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="glass-panel">
                                <h3>Create Email Campaign</h3>
                                <form onSubmit={handleSendEmail}>
                                    <div className="form-group">
                                        <label>Target Audience</label>
                                        <select value={emailCampaign.target} onChange={e => setEmailCampaign({ ...emailCampaign, target: e.target.value })}>
                                            <option value="all">All Users</option>
                                            <option value="hosts">Hosts Only</option>
                                            <option value="travelers">Travelers Only</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Subject Line</label>
                                        <input value={emailCampaign.subject} onChange={e => setEmailCampaign({ ...emailCampaign, subject: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Message Content</label>
                                        <textarea rows="8" value={emailCampaign.message} onChange={e => setEmailCampaign({ ...emailCampaign, message: e.target.value })} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                        <FaEnvelope /> Send Campaign
                                    </button>
                                </form>
                            </div>
                            <div className="stat-card" style={{ height: 'fit-content' }}>
                                <h3>Campaign Tips</h3>
                                <ul style={{ paddingLeft: '20px', color: '#718096', lineHeight: '1.6' }}>
                                    <li>Keep subject lines under 50 characters.</li>
                                    <li>Personalize messages where possible.</li>
                                    <li>Avoid spammy keywords like "Free", "Guarantee".</li>
                                    <li>Test your email on mobile devices.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeSection === 'sales' && (
                        <div>
                            <div className="glass-panel" style={{ marginBottom: '24px' }}>
                                <h3>Create New Advertisement</h3>
                                <form onSubmit={handleCreateAd} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div className="form-group" style={{ flex: 2, minWidth: '250px', marginBottom: 0 }}>
                                        <label>Ad Title</label>
                                        <input placeholder="Enter title" value={newAd.title} onChange={e => setNewAd({ ...newAd, title: e.target.value })} required />
                                    </div>
                                    <div className="form-group" style={{ flex: 2, minWidth: '250px', marginBottom: 0 }}>
                                        <label>Image URL</label>
                                        <input placeholder="https://..." value={newAd.image_url} onChange={e => setNewAd({ ...newAd, image_url: e.target.value })} required />
                                    </div>
                                    <div className="form-group" style={{ flex: 2, minWidth: '250px', marginBottom: 0 }}>
                                        <label>Target Link</label>
                                        <input placeholder="https://..." value={newAd.link} onChange={e => setNewAd({ ...newAd, link: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ height: '48px' }}>
                                        <FaPlus /> Create Ad
                                    </button>
                                </form>
                            </div>

                            <h3 style={{ marginBottom: '20px' }}>Active Campaigns</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                                {ads.map(ad => (
                                    <div key={ad.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                                        <div style={{ height: '180px', overflow: 'hidden' }}>
                                            <img src={ad.image_url} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h4 style={{ margin: '0 0 10px 0' }}>{ad.title}</h4>
                                            <a href={ad.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none', marginBottom: '15px', display: 'block' }}>
                                                {ad.link || 'No link provided'}
                                            </a>
                                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#718096' }}>
                                                <span>By: {ad.User?.username}</span>
                                                <span style={{ color: '#38a169', fontWeight: '600' }}>Active</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'logs' && (
                        <div className="glass-panel">
                            <div style={{ paddingBottom: '20px', borderBottom: '1px solid #edf2f7', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0 }}>System Audit Logs</h3>
                            </div>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Action</th>
                                        <th>Details</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map(log => (
                                        <tr key={log.id}>
                                            <td>{log.User?.username}</td>
                                            <td><span className={`badge-role badge-${log.User?.role}`}>{log.User?.role}</span></td>
                                            <td style={{ fontWeight: '500' }}>{log.action}</td>
                                            <td style={{ color: '#718096', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.details}>{log.details}</td>
                                            <td style={{ color: '#718096', fontSize: '0.85rem' }}>{new Date(log.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeSection === 'settings' && (
                        <div className="glass-panel" style={{ maxWidth: '600px' }}>
                            <h3>Admin Settings</h3>
                            <form>
                                <div className="form-group">
                                    <label>Display Name</label>
                                    <input defaultValue={user.username} />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input defaultValue={user.email} disabled style={{ background: '#edf2f7', cursor: 'not-allowed' }} />
                                </div>
                                <div className="form-group">
                                    <label>Notification Preferences</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'normal' }}>
                                            <input type="checkbox" defaultChecked /> Email me about new users
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'normal' }}>
                                            <input type="checkbox" defaultChecked /> Email me about system errors
                                        </label>
                                    </div>
                                </div>
                                <button type="button" className="btn btn-primary" onClick={() => showToast('Settings saved successfully')}>
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setEditingUser(null)}><FaTimes /></button>
                        <h3>Edit User</h3>
                        <form onSubmit={handleUpdateUser}>
                            <div className="form-group">
                                <label>Username</label>
                                <input value={editingUser.username} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}>
                                    <option value="admin">Admin</option>
                                    <option value="sales">Sales</option>
                                    <option value="marketing">Marketing</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Update User</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetPasswordUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setResetPasswordUser(null)}><FaTimes /></button>
                        <h3>Reset Password</h3>
                        <p style={{ marginBottom: '20px', color: '#718096' }}>Enter a new temporary password for <strong>{resetPasswordUser.username}</strong>.</p>
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Enter new password" />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Reset Password</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

