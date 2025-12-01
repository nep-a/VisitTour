import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            return { success: true };
        } catch (error) {
            let message = error.response?.data?.message || 'Login failed';
            if (error.code === 'ERR_NETWORK') {
                message = 'Network error. Please check your connection or try again later. (Possible CORS issue)';
            }
            return {
                success: false,
                message,
                isUnverified: error.response?.data?.isUnverified
            };
        }
    };

    const register = async (username, email, password, role, hostType) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/register`, { username, email, password, role, hostType });
            return { success: true, token: res.data.token };
        } catch (error) {
            let message = error.response?.data?.message || 'Registration failed';
            if (error.code === 'ERR_NETWORK') {
                message = 'Network error. Unable to reach the server. Please check if the backend is running and accessible.';
            }
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
