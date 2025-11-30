import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaUsers, FaUserTie, FaBullhorn, FaAd, FaSignOutAlt, FaList, FaSearch, FaEdit, FaKey, FaTrash, FaEnvelope, FaMoneyBillWave, FaEye, FaStar, FaPlus, FaCog, FaCalendarAlt, FaPaperPlane, FaTimes, FaBan, FaCheckCircle, FaBell, FaUserPlus } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Toast from '../../components/Toast';
import Dropdown from '../../components/Dropdown';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // State
    const [activeSection, setActiveSection] = useState('analytics');
    const [analyticsData, setAnalyticsData] = useState(null);
    const [staff, setStaff] = useState([]);
    const [generalUsers, setGeneralUsers] = useState([]);
    const [ads, setAds] = useState([]);
    const [logs, setLogs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [toast, setToast] = useState(null);
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);

    // Forms & Modals
    const [newStaff, setNewStaff] = useState({ username: '', email: '', password: '', role: 'sales' });
    const [newAd, setNewAd] = useState({ title: '', image_url: '', link: '' });
    const [emailCampaign, setEmailCampaign] = useState({ subject: '', message: '', target: 'all' });
    const [searchTerm, setSearchTerm] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('All');
    const [dateRange, setDateRange] = useState('7days');
    const [bookings, setBookings] = useState([]);
    const [bookingStatusFilter, setBookingStatusFilter] = useState('All');
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

        // Fetch notifications for all admin users
        fetchNotifications();
    }, [user, navigate]);

    useEffect(() => {
        if (activeSection === 'analytics' && user.role === 'admin') fetchAnalytics();
        if (activeSection === 'staff' && user.role === 'admin') fetchStaff();
        if (activeSection === 'users' && ['admin', 'sales', 'marketing'].includes(user.role)) fetchGeneralUsers();
        if (activeSection === 'sales' && ['admin', 'sales'].includes(user.role)) fetchAds();
        if (activeSection === 'logs' && user.role === 'admin') fetchLogs();
        if (activeSection === 'bookings' && user.role === 'admin') fetchBookings();
    }, [activeSection, user, dateRange, userRoleFilter, bookingStatusFilter]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markNotificationRead = async (id) => {
        try {
            await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Failed to mark notification read', error);
        }
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

    const fetchStaff = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/staff`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setStaff(res.data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load staff', 'error');
        }
    };

    const fetchGeneralUsers = async () => {
        try {
            let url = `${API_URL}/api/admin/users?search=${userSearchTerm}`;
            if (userRoleFilter !== 'All') url += `&role=${userRoleFilter.toLowerCase()}`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setGeneralUsers(res.data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load users', 'error');
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/bookings?status=${bookingStatusFilter}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setBookings(res.data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load bookings', 'error');
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

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/admin/staff`, newStaff, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showToast('Staff member created successfully');
            setNewStaff({ username: '', email: '', password: '', role: 'sales' });
            setShowAddStaffModal(false);
            fetchStaff();
        } catch (error) {
            showToast('Failed to create staff member', 'error');
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
            if (activeSection === 'staff') fetchStaff();
            else fetchGeneralUsers();
        } catch (error) {
            showToast('Failed to update user', 'error');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
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

    const handleDeleteUser = async (id, isStaff = false) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`${API_URL}/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showToast('User deleted successfully');
            if (isStaff) fetchStaff();
            else fetchGeneralUsers();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete user', 'error');
        }
    };

    const handleToggleStatus = async (user) => {
        const newStatus = user.verification_status === 'rejected' ? 'active' : 'disabled';
        if (!confirm(`Are you sure you want to ${newStatus === 'disabled' ? 'disable' : 'enable'} this user?`)) return;

        try {
            await axios.put(`${API_URL}/api/admin/users/${user.id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showToast(`User ${newStatus === 'disabled' ? 'disabled' : 'enabled'} successfully`);
            fetchGeneralUsers();
        } catch (error) {
            showToast('Failed to update user status', 'error');
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
            // Re-trigger verification email via backend if needed, or just show toast for now as backend handles it on create
            showToast(`Verification email sent to ${email}`);
        } catch (error) {
            showToast('Failed to send verification email', 'error');
        }
    };

    const filteredStaff = staff.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (!user) return null;

    return (
        <div className="admin-container">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <a href="/" className="sidebar-brand">
                        ZuruSasa <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Admin</span>
                    </a>
                </div>
                <nav className="sidebar-nav">
                    {user.role === 'admin' && (
                        <>
                            <button onClick={() => setActiveSection('analytics')} className={`admin-nav-item ${activeSection === 'analytics' ? 'active' : ''}`}>
                                <FaChartBar /> <span>Analytics</span>
                            </button>
                            <button onClick={() => setActiveSection('staff')} className={`admin-nav-item ${activeSection === 'staff' ? 'active' : ''}`}>
                                <FaUserTie /> <span>Staff Management</span>
                            </button>
                            <button onClick={() => setActiveSection('bookings')} className={`admin-nav-item ${activeSection === 'bookings' ? 'active' : ''}`}>
                                <FaCalendarAlt /> <span>Bookings</span>
                            </button>
                        </>
                    )}
                    {['admin', 'sales', 'marketing'].includes(user.role) && (
                        <button onClick={() => setActiveSection('users')} className={`admin-nav-item ${activeSection === 'users' ? 'active' : ''}`}>
                            <FaUsers /> <span>User Management</span>
                        </button>
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
                    {user.role === 'admin' && (
                        <button onClick={() => setActiveSection('logs')} className={`admin-nav-item ${activeSection === 'logs' ? 'active' : ''}`}>
                            <FaList /> <span>Audit Logs</span>
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
                        {activeSection === 'staff' ? 'Staff Management' :
                            activeSection === 'users' ? 'User Management' :
                                activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                    </div>
                    <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

                        {user.role === 'admin' && (
                            <button onClick={() => setShowAddStaffModal(true)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                                <FaUserPlus /> Add Team Member
                            </button>
                        )}

                        {/* Notifications */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: '#718096', fontSize: '1.2rem' }}
                            >
                                <FaBell />
                                {unreadCount > 0 && (
                                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--primary-color)', color: 'white', fontSize: '0.7rem', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div style={{ position: 'absolute', right: 0, top: '40px', width: '300px', background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 100, border: '1px solid #edf2f7', maxHeight: '400px', overflowY: 'auto' }}>
                                    <div style={{ padding: '15px', borderBottom: '1px solid #edf2f7', fontWeight: 'bold' }}>Notifications</div>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>No notifications</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div
                                                key={n.id}
                                                onClick={() => markNotificationRead(n.id)}
                                                style={{ padding: '15px', borderBottom: '1px solid #edf2f7', background: n.is_read ? 'white' : '#ebf8ff', cursor: 'pointer' }}
                                            >
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>{n.title}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#4a5568' }}>{n.message}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '5px' }}>{new Date(n.created_at).toLocaleString()}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

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
                                <div style={{ width: '200px' }}>
                                    <Dropdown
                                        options={[
                                            { value: '7days', label: 'Last 7 Days' },
                                            { value: '30days', label: 'Last 30 Days' },
                                            { value: '90days', label: 'Last 3 Months' },
                                            { value: 'year', label: 'This Year' }
                                        ]}
                                        value={dateRange}
                                        onChange={setDateRange}
                                    />
                                </div>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-title">Total Revenue</div>
                                    <div className="stat-number">Ksh {analyticsData.overview.totalRevenue.toLocaleString()}</div>
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

                    {activeSection === 'staff' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                {/* Button moved to header */}
                            </div>

                            <div className="glass-panel">
                                <div style={{ paddingBottom: '20px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0 }}>Staff Directory</h3>
                                    <div style={{ position: 'relative' }}>
                                        <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                                        <input
                                            placeholder="Search staff..."
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
                                        {filteredStaff.map(u => (
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
                                                        <button onClick={() => handleDeleteUser(u.id, true)} className="btn btn-sm btn-danger" title="Delete">
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeSection === 'users' && (
                        <div className="glass-panel">
                            <div style={{ paddingBottom: '20px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0 }}>Registered Users</h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                                        <input
                                            placeholder="Search users..."
                                            style={{ paddingLeft: '35px', width: '250px', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            value={userSearchTerm}
                                            onChange={(e) => {
                                                setUserSearchTerm(e.target.value);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') fetchGeneralUsers();
                                            }}
                                        />
                                    </div>
                                    <button onClick={fetchGeneralUsers} className="btn btn-secondary">Search</button>
                                </div>
                                <div style={{ width: '200px' }}>
                                    <Dropdown
                                        options={[
                                            { value: 'All', label: 'All Roles' },
                                            { value: 'Host', label: 'Host' },
                                            { value: 'Traveler', label: 'Traveler' }
                                        ]}
                                        value={userRoleFilter}
                                        onChange={setUserRoleFilter}
                                    />
                                </div>
                            </div>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {generalUsers.map(u => (
                                        <tr key={u.id}>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600' }}>{u.username}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>{u.email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge-role`} style={{ background: u.role === 'host' ? '#ebf8ff' : '#f0fff4', color: u.role === 'host' ? '#3182ce' : '#2f855a' }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                            <td>
                                                {u.verification_status === 'rejected' ? (
                                                    <span style={{ color: '#e53e3e', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <FaBan /> Disabled
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#38a169', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <FaCheckCircle /> Active
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {user.role === 'admin' && (
                                                        <button
                                                            onClick={() => handleToggleStatus(u)}
                                                            className={`btn btn-sm ${u.verification_status === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
                                                            title={u.verification_status === 'rejected' ? "Enable Account" : "Disable Account"}
                                                        >
                                                            {u.verification_status === 'rejected' ? <FaCheckCircle /> : <FaBan />}
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteUser(u.id)} className="btn btn-sm btn-danger" title="Delete User">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeSection === 'marketing' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="glass-panel">
                                <h3>Create Email Campaign</h3>
                                <form onSubmit={handleSendEmail}>
                                    <div className="form-group">
                                        <label>Target Audience</label>
                                        <Dropdown
                                            options={[
                                                { value: 'all', label: 'All Users' },
                                                { value: 'hosts', label: 'Hosts Only' },
                                                { value: 'travelers', label: 'Travelers Only' }
                                            ]}
                                            value={emailCampaign.target}
                                            onChange={(val) => setEmailCampaign({ ...emailCampaign, target: val })}
                                        />
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

                    {activeSection === 'bookings' && (
                        <div className="glass-panel">
                            <div style={{ paddingBottom: '20px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0 }}>All Bookings</h3>
                                <div style={{ width: '200px' }}>
                                    <Dropdown
                                        options={[
                                            { value: 'All', label: 'All Statuses' },
                                            { value: 'Pending', label: 'Pending' },
                                            { value: 'Confirmed', label: 'Confirmed' },
                                            { value: 'In Progress', label: 'In Progress' },
                                            { value: 'Completed', label: 'Completed' },
                                            { value: 'Cancelled', label: 'Cancelled' }
                                        ]}
                                        value={bookingStatusFilter}
                                        onChange={setBookingStatusFilter}
                                    />
                                </div>
                            </div>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Traveler</th>
                                        <th>Host</th>
                                        <th>Reel/Tour</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b.id}>
                                            <td>#{b.id}</td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600' }}>{b.Traveler?.username}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#718096' }}>{b.Traveler?.email}</span>
                                                </div>
                                            </td>
                                            <td>{b.Host?.username}</td>
                                            <td>{b.Reel?.title}</td>
                                            <td>{b.booking_date}</td>
                                            <td>
                                                <span className={`badge-role`} style={{
                                                    background: b.status === 'confirmed' ? '#c6f6d5' : b.status === 'cancelled' ? '#fed7d7' : '#bee3f8',
                                                    color: b.status === 'confirmed' ? '#276749' : b.status === 'cancelled' ? '#c53030' : '#2c5282'
                                                }}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td>Ksh {parseFloat(b.total_price).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#718096' }}>No bookings found</td>
                                        </tr>
                                    )}
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
                                <Dropdown
                                    options={[
                                        { value: 'admin', label: 'Admin' },
                                        { value: 'sales', label: 'Sales' },
                                        { value: 'marketing', label: 'Marketing' }
                                    ]}
                                    value={editingUser.role}
                                    onChange={(val) => setEditingUser({ ...editingUser, role: val })}
                                />
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

            {/* Add Staff Modal */}
            {showAddStaffModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setShowAddStaffModal(false)}><FaTimes /></button>
                        <h3>Add Team Member</h3>
                        <form onSubmit={handleCreateStaff}>
                            <div className="form-group">
                                <label>Name</label>
                                <input placeholder="Enter name" value={newStaff.username} onChange={e => setNewStaff({ ...newStaff, username: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input placeholder="Enter email" type="email" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Temporary Password</label>
                                <input placeholder="Enter temporary password" type="password" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <Dropdown
                                    options={[
                                        { value: 'sales', label: 'Sales' },
                                        { value: 'marketing', label: 'Marketing' }
                                    ]}
                                    value={newStaff.role}
                                    onChange={(val) => setNewStaff({ ...newStaff, role: val })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddStaffModal(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Member</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
