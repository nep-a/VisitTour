import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import ReviewModal from '../components/ReviewModal';
import { FaCalendarAlt, FaTimesCircle, FaCheck, FaTrash } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);
    const [editForm, setEditForm] = useState({ newDate: '', guests: 1 });
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
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

    const handleCancelClick = (booking) => {
        setBookingToCancel(booking);
        setShowCancelModal(true);
    };

    const handleCancelConfirm = async () => {
        if (!bookingToCancel) return;
        try {
            await axios.put(`${API_URL}/api/bookings/${bookingToCancel.id}/cancel`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showNotification('Booking cancelled successfully', 'success');
            fetchBookings();
            setShowCancelModal(false);
            setBookingToCancel(null);
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to cancel booking', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this booking from your list? This cannot be undone.')) return;
        try {
            await axios.put(`${API_URL}/api/bookings/${id}/delete`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showNotification('Booking removed successfully', 'success');
            fetchBookings();
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to delete booking', 'error');
        }
    };

    const handleUpdate = async (id) => {
        if (!editForm.newDate || editForm.guests < 1) return;
        try {
            await axios.put(`${API_URL}/api/bookings/${id}/update`, editForm, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showNotification('Booking updated successfully', 'success');
            setEditingBooking(null);
            fetchBookings();
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to update booking', 'error');
        }
    };

    const startEditing = (booking) => {
        setEditingBooking(booking.id);
        setEditForm({ newDate: booking.booking_date, guests: booking.guests });
    };

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
                                        <td style={{ padding: '10px' }}>
                                            {editingBooking === booking.id ? (
                                                <input
                                                    type="date"
                                                    value={editForm.newDate}
                                                    onChange={(e) => setEditForm({ ...editForm, newDate: e.target.value })}
                                                    style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc', width: '130px' }}
                                                />
                                            ) : (
                                                booking.booking_date
                                            )}
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            {editingBooking === booking.id ? (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={editForm.guests}
                                                    onChange={(e) => setEditForm({ ...editForm, guests: parseInt(e.target.value) })}
                                                    style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc', width: '60px' }}
                                                />
                                            ) : (
                                                booking.guests
                                            )}
                                        </td>
                                        <td style={{ padding: '10px' }}>Ksh {booking.total_price}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                padding: '5px 10px',
                                                borderRadius: '15px',
                                                background: booking.status === 'confirmed' ? '#48bb78' :
                                                    booking.status === 'completed' ? '#38a169' :
                                                        booking.status === 'cancelled' ? '#f56565' : '#ed8936',
                                                color: 'white',
                                                fontSize: '0.8rem',
                                                textTransform: 'capitalize'
                                            }}>
                                                {booking.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                                            {editingBooking === booking.id ? (
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button onClick={() => handleUpdate(booking.id)} className="btn btn-sm btn-primary" title="Save"><FaCheck /></button>
                                                    <button onClick={() => setEditingBooking(null)} className="btn btn-sm btn-secondary" title="Cancel"><FaTimesCircle /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                        <>
                                                            <button
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={() => startEditing(booking)}
                                                                title="Edit Booking"
                                                            >
                                                                <FaCalendarAlt />
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleCancelClick(booking)}
                                                                title="Cancel Booking"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                    {(booking.status === 'cancelled' || booking.status === 'completed') && (
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleDelete(booking.id)}
                                                            title="Delete from list"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                    {booking.status === 'completed' && (
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => setSelectedBooking(booking)}
                                                        >
                                                            Review
                                                        </button>
                                                    )}
                                                </>
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

            {showCancelModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <h3>Cancel Booking?</h3>
                        <p>Are you sure you want to cancel your booking for <strong>{bookingToCancel?.Reel?.title}</strong>?</p>
                        <p style={{ fontSize: '0.9rem', color: '#718096' }}>This action cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                            <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>No, Keep it</button>
                            <button className="btn btn-danger" onClick={handleCancelConfirm}>Yes, Cancel Booking</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
