import { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaTag, FaCalendarCheck, FaStar, FaHeart, FaComment, FaShare } from 'react-icons/fa';
import ReelReviewsModal from './ReelReviewsModal';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ReelCard = ({ reel, onBook }) => {
    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true);
    const [showReviews, setShowReviews] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(reel.likes_count || 0);
    const { user } = useContext(AuthContext);
    const { showNotification } = useNotification();

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoRef.current.play().catch(() => { });
                        // Increment view count
                        axios.post(`${API_URL}/api/reels/${reel.id}/view`).catch(err => console.error('Failed to increment view', err));
                    } else {
                        videoRef.current.pause();
                    }
                });
            },
            { threshold: 0.6 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        // Check if liked
        if (user) {
            axios.get(`${API_URL}/api/reels/${reel.id}/is-liked`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
                .then(res => setLiked(res.data.liked))
                .catch(err => console.error('Failed to check like status', err));
        }

        return () => {
            if (videoRef.current) observer.unobserve(videoRef.current);
        };
    }, [reel.id, user]);

    const handleLike = async () => {
        if (!user) {
            showNotification('Please login to like reels', 'info');
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/api/reels/${reel.id}/like`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setLiked(res.data.liked);
            setLikesCount(res.data.likes_count);
        } catch (error) {
            console.error('Like error:', error);
            showNotification('Failed to like reel', 'error');
        }
    };

    return (
        <div className="reel-card">
            <video
                ref={videoRef}
                src={`${API_URL}${reel.video_url}`}
                className="reel-video"
                loop
                muted={isMuted}
                onClick={toggleMute}
            />
            <div className="reel-host-info">
                {reel.User?.profile_picture ? (
                    <img src={`${API_URL}${reel.User.profile_picture}`} alt={reel.User.username} />
                ) : (
                    <div className="host-avatar-placeholder">
                        {reel.User?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                )}
                <span className="host-username">{reel.User?.username || 'Unknown Host'}</span>
            </div>
            <div className="reel-overlay">
                <div className="reel-info">
                    <h3>{reel.title}</h3>
                    <p><FaMapMarkerAlt /> {reel.location}</p>
                    <p>{reel.description}</p>
                    <p className="price">Ksh {reel.price}</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <span className="badge"><FaTag /> {reel.category}</span>
                    </div>
                </div>
            </div>
            <div className="reel-actions">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button className="action-btn" onClick={() => onBook(reel)}>
                        <FaCalendarCheck />
                    </button>
                    <span className="action-label">Book</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button
                        className="action-btn"
                        onClick={handleLike}
                        style={{ color: liked ? '#3182ce' : 'white', borderColor: liked ? '#3182ce' : 'rgba(255,255,255,0.2)' }}
                    >
                        <FaHeart />
                    </button>
                    <span className="action-label">{likesCount}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button className="action-btn" onClick={() => setShowReviews(true)}>
                        <FaComment />
                    </button>
                    <span className="action-label">Reviews</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button className="action-btn" onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: reel.title,
                                text: `Check out this experience on ZuruSasa: ${reel.title}`,
                                url: window.location.href
                            }).catch(console.error);
                        } else {
                            alert('Share feature not supported on this device');
                        }
                    }}>
                        <FaShare />
                    </button>
                    <span className="action-label">Share</span>
                </div>
            </div>
            {showReviews && <ReelReviewsModal reel={reel} onClose={() => setShowReviews(false)} />}
        </div>
    );
};

export default ReelCard;
