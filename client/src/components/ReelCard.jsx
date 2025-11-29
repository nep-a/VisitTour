import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaTag, FaCalendarCheck, FaStar } from 'react-icons/fa';
import ReelReviewsModal from './ReelReviewsModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ReelCard = ({ reel, onBook }) => {
    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true);
    const [showReviews, setShowReviews] = useState(false);

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

        return () => {
            if (videoRef.current) observer.unobserve(videoRef.current);
        };
    }, [reel.id]);

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
                <button className="action-btn" onClick={() => onBook(reel)}>
                    <FaCalendarCheck />
                </button>
                <button className="action-btn" onClick={() => setShowReviews(true)}>
                    <FaStar />
                </button>
            </div>
            {showReviews && <ReelReviewsModal reel={reel} onClose={() => setShowReviews(false)} />}
        </div>
    );
};

export default ReelCard;
