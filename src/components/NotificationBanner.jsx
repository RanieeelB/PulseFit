import React, { useState, useEffect } from 'react';
import { getActiveNotifications } from '../services/notificationService';
import { X, Download, Info } from 'lucide-react';

const NotificationBanner = () => {
    const [notifications, setNotifications] = useState([]);
    const [dismissedIds, setDismissedIds] = useState(() => {
        const saved = localStorage.getItem('dismissed_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const fetchNotifications = async () => {
            const data = await getActiveNotifications();
            if (data && data.length > 0) {
                // Filter out dismissed notifications
                const activeData = data.filter(n => !dismissedIds.includes(n.id));
                setNotifications(activeData);
            }
        };

        fetchNotifications();
    }, [dismissedIds]);

    const dismissNotification = (id) => {
        const newDismissed = [...dismissedIds, id];
        setDismissedIds(newDismissed);
        localStorage.setItem('dismissed_notifications', JSON.stringify(newDismissed));
        setNotifications(notifications.filter(n => n.id !== id));
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 left-0 right-0 w-full z-[100] flex flex-col gap-3 px-4 pointer-events-none">
            {notifications.map(notification => (
                <div key={notification.id} className="pointer-events-auto w-full max-w-md mx-auto bg-slate-800/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col relative animate-fade-in-down">
                    {/* Glowing Accent based on type */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${notification.type === 'update' ? 'bg-primary' : 'bg-blue-500'}`} />

                    <div className="flex items-start p-4 gap-3 text-slate-200">
                        <div className={`mt-1 flex-shrink-0 ${notification.type === 'update' ? 'text-primary' : 'text-blue-400'}`}>
                            {notification.type === 'update' ? <Download size={22} className="animate-pulse" /> : <Info size={22} />}
                        </div>
                        <div className="flex-grow">
                            {notification.title && (
                                <h4 className="text-white font-bold mb-1">{notification.title}</h4>
                            )}
                            <p className="text-slate-300 text-sm font-medium leading-relaxed">{notification.message}</p>

                            {notification.type === 'update' && notification.download_url && (
                                <a
                                    href={notification.download_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95"
                                >
                                    <Download size={18} />
                                    BAIXAR NOVA VERSÃO
                                </a>
                            )}
                        </div>
                        <button
                            onClick={() => dismissNotification(notification.id)}
                            className="flex-shrink-0 text-slate-400 hover:text-white transition-colors p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationBanner;
