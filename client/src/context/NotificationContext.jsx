import { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        // Auto dismiss after 10 seconds if not dismissed manually
        setTimeout(() => {
            setNotification(null);
        }, 10000);
    };

    const dismissNotification = () => {
        setNotification(null);
    };

    return (
        <NotificationContext.Provider value={{ notification, showNotification, dismissNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};
