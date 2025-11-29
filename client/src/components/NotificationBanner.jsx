import { useNotification } from '../context/NotificationContext';

const NotificationBanner = () => {
    const { notification, dismissNotification } = useNotification();

    if (!notification) return null;

    const styles = {
        container: {
            position: 'fixed',
            top: '80px', // Below navbar
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            width: '90%',
            maxWidth: '600px',
            padding: '15px 20px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideDown 0.3s ease-out',
            background: notification.type === 'success' ? '#f0fff4' : '#ebf8ff',
            border: `1px solid ${notification.type === 'success' ? '#48bb78' : '#4299e1'}`,
            color: notification.type === 'success' ? '#2f855a' : '#2b6cb0',
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: 'inherit',
            marginLeft: '15px',
            padding: '0 5px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>
                    {notification.type === 'success' ? '📧' : 'ℹ️'}
                </span>
                <div>
                    <strong>{notification.type === 'success' ? 'Check your email!' : 'Notification'}</strong>
                    <div style={{ fontSize: '0.95rem' }}>{notification.message}</div>
                </div>
            </div>
            <button onClick={dismissNotification} style={styles.closeBtn}>&times;</button>
            <style>{`
                @keyframes slideDown {
                    from { transform: translate(-50%, -20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default NotificationBanner;
