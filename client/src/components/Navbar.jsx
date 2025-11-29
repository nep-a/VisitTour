import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaPlus, FaUser, FaSignOutAlt } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav>
            <Link to="/" style={{ textDecoration: 'none' }}>
                <h1>VisitTours</h1>
            </Link>
            <ul>
                {user ? (
                    <>
                        {/* Host Links */}
                        {user.role === 'host' && (
                            <>
                                <li>
                                    <Link to="/upload" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px' }}>
                                        <FaPlus /> <span className="nav-text">Upload</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                                </li>
                            </>
                        )}

                        {/* Admin Links */}
                        {user.role === 'admin' && (
                            <>
                                <li>
                                    <Link to="/upload" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px' }}>
                                        <FaPlus /> <span className="nav-text">Upload</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/admin" className="nav-link" style={{ color: '#e53e3e', fontWeight: 'bold' }}>Admin Panel</Link>
                                </li>
                            </>
                        )}

                        {/* Sales/Marketing Links */}
                        {['sales', 'marketing'].includes(user.role) && (
                            <li>
                                <Link to="/admin" className="nav-link" style={{ color: '#e53e3e', fontWeight: 'bold' }}>Admin Panel</Link>
                            </li>
                        )}

                        {/* Traveler Links */}
                        {user.role === 'traveler' && (
                            <li>
                                <Link to="/my-bookings" className="nav-link">My Bookings</Link>
                            </li>
                        )}
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                                {user.profile_picture ? (
                                    <img
                                        src={`${API_URL}${user.profile_picture}`}
                                        alt={user.username}
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }}
                                    />
                                ) : (
                                    <span className="nav-text"><FaUser /></span>
                                )}
                                <span className="nav-text">{user.username}</span>
                            </Link>
                            <button onClick={handleLogout} className="btn" style={{ background: 'transparent', color: 'var(--text-color)', padding: '5px' }}>
                                <FaSignOutAlt />
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login" className="nav-link">Login</Link></li>
                        <li><Link to="/register" className="btn btn-primary">Sign Up</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
