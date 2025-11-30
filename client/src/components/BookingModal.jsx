import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { FaTimes } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BookingModal = ({ reel, onClose }) => {
    const { user } = useContext(AuthContext);
    const { showNotification } = useNotification();
    const [date, setDate] = useState('');
    const [name, setName] = useState(user?.username || '');
    const [phone, setPhone] = useState('');
    const [guests, setGuests] = useState(1);
    const [requests, setRequests] = useState('');
    const [message, setMessage] = useState('');

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to book');
            return;
        }
        try {
            await axios.post(`${API_URL}/api/bookings`, {
                reel_id: reel.id,
                booking_date: date,
                traveler_name: name,
                phone_number: phone,
                guests,
                special_requests: requests
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showNotification('Booking successful! Please check your email for confirmation.', 'success');
            onClose();
        } catch (error) {
            setMessage('Booking failed: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content booking-modal">
                <button className="close-btn" onClick={onClose}><FaTimes /></button>
                <h2>Book {reel.title}</h2>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    Total Price: Ksh {(reel.price * guests).toLocaleString()}
                </p>
                <form onSubmit={handleBooking} className="auth-form">
                    <div className="form-group">
                        <label>Select Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Your Name</label>
                        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>M-Pesa / Phone Number</label>
                        <input type="tel" placeholder="e.g. 0712345678" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Number of Guests</label>
                        <input type="number" min="1" value={guests} onChange={(e) => setGuests(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Special Requests</label>
                        <textarea placeholder="Any special needs?" value={requests} onChange={(e) => setRequests(e.target.value)} rows="2" />
                    </div>
                    {message && <p style={{ color: 'red' }}>{message}</p>}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Back to Reel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Booking</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
