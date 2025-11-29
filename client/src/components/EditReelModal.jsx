import { useState } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EditReelModal = ({ reel, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: reel.title,
        description: reel.description,
        price: reel.price,
        category: reel.category,
        is_active: reel.is_active
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${API_URL}/api/reels/${reel.id}`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            onUpdate(res.data);
            onClose();
        } catch (error) {
            alert('Failed to update reel');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}><FaTimes /></button>
                <h2>Edit Reel</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Price (Ksh)</label>
                        <input name="price" type="number" value={formData.price} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="Adventure">Adventure</option>
                            <option value="Relaxation">Relaxation</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Wildlife">Wildlife</option>
                            <option value="Beach">Beach</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            id="is_active"
                        />
                        <label htmlFor="is_active" style={{ marginBottom: 0 }}>Active (Visible to travelers)</label>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default EditReelModal;
