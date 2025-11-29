import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import ReviewModal from '../components/ReviewModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const { showNotification } = useNotification();

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/bookings/my-bookings`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setBookings(res.data);
        } catch (error) {
            console.error(error);
            showNotification('Failed to fetch bookings', 'error');
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <div className="container" style={{ marginTop: '100px' }}>
            <h2>My Bookings</h2>
            <div className="glass-panel">
                {bookings.length === 0 ? (
                    <p>You haven't booked any trips yet.</p>
                ) : (
                    <div className="table-container">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '10px' }}>Experience</th>
                                    <th style={{ padding: '10px' }}>Date</th>
                                    <th style={{ padding: '10px' }}>Guests</th>
                                    <th style={{ padding: '10px' }}>Total</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={{ padding: '10px' }}>{booking.Reel.title}</td>
                                        <td style={{ padding: '10px' }}>{booking.booking_date}</td>
                                        <td style={{ padding: '10px' }}>{booking.guests}</td>
                                        <td style={{ padding: '10px' }}>Ksh {booking.total_price}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                padding: '5px 10px',
                                                borderRadius: '15px',
                                                background: booking.status === 'confirmed' ? '#48bb78' :
                                                    booking.status === 'completed' ? '#38a169' : '#ed8936',
                                                color: 'white',
                                                fontSize: '0.8rem'
                                            }}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            {booking.status === 'completed' && (
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                                    onClick={() => setSelectedBooking(booking)}
                                                >
                                                    Leave Review
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedBooking && (
                <ReviewModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onReviewSubmitted={fetchBookings}
                />
            )}
        </div>
    );
};

export default MyBookings;
