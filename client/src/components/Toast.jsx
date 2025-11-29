import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <FaCheckCircle />,
        error: <FaExclamationCircle />,
        info: <FaInfoCircle />
    };

    const colors = {
        success: '#48bb78',
        error: '#f56565',
        info: '#4299e1'
    };

    return (
        <div className="animate-fade-in" style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999,
            borderLeft: `4px solid ${colors[type]}`,
            minWidth: '300px'
        }}>
            <span style={{ color: colors[type], fontSize: '1.2rem', display: 'flex' }}>
                {icons[type]}
            </span>
            <p style={{ margin: 0, color: '#2d3748', fontWeight: '500', flex: 1 }}>{message}</p>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', padding: 0, display: 'flex' }}>
                <FaTimes />
            </button>
        </div>
    );
};

export default Toast;
