import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaStar } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ReelReviewsModal = ({ reel, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/reviews/reel/${reel.id}`);
                setReviews(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [reel.id]);

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                <button className="close-btn" onClick={onClose}><FaTimes /></button>
                <h2>Reviews for {reel.title}</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d3748' }}>{averageRating}</span>
                    <div style={{ color: '#ffc107' }}>
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} color={i < Math.round(averageRating) ? '#ffc107' : '#e2e8f0'} size={24} />
                        ))}
                    </div>
                    <span style={{ color: '#718096' }}>({reviews.length} reviews)</span>
                </div>

                {loading ? (
                    <p>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <p>No reviews yet. Be the first to book and review!</p>
                ) : (
                    <div className="reviews-list">
                        {reviews.map(review => (
                            <div key={review.id} style={{
                                padding: '15px',
                                borderBottom: '1px solid #e2e8f0',
                                marginBottom: '15px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <strong>{review.User.username}</strong>
                                    <span style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div style={{ color: '#ffc107', marginBottom: '5px', fontSize: '0.9rem' }}>
                                    {[...Array(review.rating)].map((_, i) => <span key={i}>★</span>)}
                                </div>
                                <p style={{ color: '#4a5568' }}>{review.comment}</p>
                                {review.host_reply && (
                                    <div style={{
                                        background: '#f7fafc',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        marginTop: '10px',
                                        borderLeft: '3px solid var(--primary-color)',
                                        fontSize: '0.9rem'
                                    }}>
                                        <strong>Host Reply:</strong>
                                        <p style={{ margin: '5px 0 0 0' }}>{review.host_reply}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReelReviewsModal;
