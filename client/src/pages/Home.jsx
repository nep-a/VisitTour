import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ReelCard from '../components/ReelCard';
import BookingModal from '../components/BookingModal';
import CustomSelect from '../components/CustomSelect';
import { FaSearch, FaRedo, FaUmbrellaBeach, FaPaw, FaHotel, FaUtensils, FaLandmark } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Home = () => {
    const [reels, setReels] = useState([]);
    const [selectedReel, setSelectedReel] = useState(null);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        category: '',
        minPrice: '',
        maxPrice: ''
    });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const loadingRef = useRef(false);

    const fetchReels = useCallback(async (pageNum, reset = false) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        try {
            const params = new URLSearchParams({ ...filters, page: pageNum, limit: 5 }).toString();
            const res = await axios.get(`${API_URL}/api/reels?${params}`);

            if (reset) {
                setReels(res.data);
            } else {
                setReels(prev => {
                    const newReels = res.data.filter(newReel => !prev.some(existing => existing.id === newReel.id));
                    return [...prev, ...newReels];
                });
            }

            setHasMore(res.data.length === 5);
        } catch (error) {
            console.error('Error fetching reels:', error);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [filters]);

    // Initial load and filter changes
    useEffect(() => {
        setPage(1);
        fetchReels(1, true);
    }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

    // Toggle mobile view class
    useEffect(() => {
        document.body.classList.add('mobile-reels-view');
        return () => {
            document.body.classList.remove('mobile-reels-view');
        };
    }, []);

    // Infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
                if (hasMore && !loading) {
                    setPage(prev => {
                        const nextPage = prev + 1;
                        fetchReels(nextPage, false);
                        return nextPage;
                    });
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, loading, fetchReels]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchReels(1, true);
    };

    const handleRefresh = () => {
        setPage(1);
        fetchReels(1, true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleBookClick = (reel) => {
        if (!user) {
            if (confirm('You need to sign in to book this experience. Go to login?')) {
                navigate('/login');
            }
            return;
        }
        setSelectedReel(reel);
    };

    return (
        <div>
            <div className="glass-panel" style={{ marginTop: '80px', marginBottom: '20px', width: '90%', maxWidth: '800px', margin: '80px auto 20px auto', padding: '10px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                    <input name="search" placeholder="Search (e.g. Diani, Mara)..." value={filters.search} onChange={handleChange} style={{ padding: '8px', borderRadius: '5px', border: 'none' }} />
                    <input name="location" placeholder="Location (e.g. Nairobi)" value={filters.location} onChange={handleChange} style={{ padding: '8px', borderRadius: '5px', border: 'none' }} />
                    <div style={{ minWidth: '180px' }}>
                        <CustomSelect
                            placeholder="All Categories"
                            value={filters.category}
                            onChange={(val) => setFilters({ ...filters, category: val })}
                            options={[
                                { value: '', label: 'All Categories' },
                                { value: 'Safari', label: 'Safari', icon: <FaPaw /> },
                                { value: 'Beach', label: 'Beach', icon: <FaUmbrellaBeach /> },
                                { value: 'Staycation', label: 'Staycation', icon: <FaHotel /> },
                                { value: 'Culture', label: 'Culture', icon: <FaLandmark /> },
                                { value: 'Food', label: 'Food', icon: <FaUtensils /> },
                            ]}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary"><FaSearch /></button>
                    <button type="button" className="btn btn-secondary" onClick={handleRefresh} title="Refresh Feed"><FaRedo /></button>
                </form>
            </div>

            <div className="feed-container" style={{ paddingTop: '0' }}>
                {reels.length > 0 ? (
                    reels.map(reel => (
                        <ReelCard key={reel.id} reel={reel} onBook={handleBookClick} />
                    ))
                ) : (
                    !loading && <p style={{ marginTop: '100px' }}>No reels found. Try adjusting filters.</p>
                )}
                {loading && <p style={{ textAlign: 'center', padding: '20px' }}>Loading...</p>}
                {!hasMore && reels.length > 0 && <p style={{ textAlign: 'center', padding: '20px' }}>No more reels to show.</p>}
            </div>

            {selectedReel && (
                <BookingModal reel={selectedReel} onClose={() => setSelectedReel(null)} />
            )}
        </div>
    );
};

export default Home;
