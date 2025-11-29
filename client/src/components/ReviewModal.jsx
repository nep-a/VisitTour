import { useState } from 'react';
import axios from 'axios';
import { FaStar, FaTimes } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ReviewModal = ({ booking, onClose, onReviewSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(null);
    const { showNotification } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/reviews`, {
                booking_id: booking.id,
                rating,
                comment
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            showNotification('Review submitted successfully!', 'success');
            onReviewSubmitted();
            onClose();
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to submit review', 'error');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}><FaTimes /></button>
                <h2>Rate your experience</h2>
                <p>How was your trip with {booking.Reel.title}?</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                        {[...Array(5)].map((star, i) => {
                            const ratingValue = i + 1;
                            return (
                                <label key={i}>
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={ratingValue}
                                        onClick={() => setRating(ratingValue)}
                                        style={{ display: 'none' }}
                                    />
                                    <FaStar
                                        className="star"
                                        color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                        size={30}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(null)}
                                        style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                                    />
                                </label>
                            );
                        })}
                    </div>

                    <div className="form-group">
                        <textarea
                            placeholder="Share your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            minLength={10}
                            maxLength={500}
                            rows="4"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">Submit Review</button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
