import React, { useState, useEffect, useRef } from 'react';
import { getActiveNotifications } from '../services/notificationService';
import { Download, Info, Check, Bell } from 'lucide-react';

const NotificationDropdown = ({ isOpen, onClose, onUnreadCountChange }) => {
    const [notifications, setNotifications] = useState([]);
    const [readIds, setReadIds] = useState(() => {
        const saved = localStorage.getItem('read_notifications');
        return saved ? JSON.parse(saved) : [];
    });
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            const data = await getActiveNotifications();
            if (data && data.length > 0) {
                setNotifications(data);

                // Calculate unread count and notify parent
                const unread = data.filter(n => !readIds.includes(n.id)).length;
                onUnreadCountChange(unread);
            } else {
                setNotifications([]);
                onUnreadCountChange(0);
            }
        };

        fetchNotifications();
    }, [readIds, onUnreadCountChange]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // Also check if the click wasn't on the bell button itself to avoid immediate toggle issues
                const isBellButton = event.target.closest('button[data-notification-trigger="true"]');
                if (!isBellButton) {
                    onClose();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        // Better mobile support
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // When dropdown opens, mark all current as read to clear the badge immediately
    useEffect(() => {
        if (isOpen && notifications.length > 0) {
            const currentIds = notifications.map(n => n.id);
            const newReadIds = Array.from(new Set([...readIds, ...currentIds]));

            if (newReadIds.length !== readIds.length) {
                setReadIds(newReadIds);
                localStorage.setItem('read_notifications', JSON.stringify(newReadIds));
                onUnreadCountChange(0);
            }
        }
    }, [isOpen, notifications, readIds, onUnreadCountChange]);

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute top-14 right-0 w-80 sm:w-96 max-h-[80vh] bg-slate-800/95 dark:bg-[#0f0f12]/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden flex flex-col z-[100] animate-slide-up origin-top-right ring-1 ring-white/5"
            style={{ animationDuration: '0.2s' }}
        >
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Bell size={18} className="text-primary" />
                    Notificações
                </h3>
                <span className="text-xs font-semibold text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
                    {notifications.length} {notifications.length === 1 ? 'aviso' : 'avisos'}
                </span>
            </div>

            <div className="overflow-y-auto overflow-x-hidden flex-grow custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-slate-400 gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                            <Check size={24} className="text-slate-500" />
                        </div>
                        <p className="text-sm font-medium">Nenhuma novidade por aqui!</p>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-white/5">
                        {notifications.map((notification, index) => {
                            const isNew = isOpen && !readIds.includes(notification.id); // It's "new" right as we open it

                            return (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-white/5 transition-colors relative group ${notification.type === 'update' ? 'bg-primary/5' : ''}`}
                                >
                                    {/* Indicator for unread if we wanted to keep it highlighted, though we mark read instantly */}
                                    {isNew && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-md"></div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'update' ? 'bg-primary/20 text-primary' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {notification.type === 'update' ? <Download size={16} /> : <Info size={16} />}
                                        </div>
                                        <div className="flex-grow">
                                            {notification.title && (
                                                <h4 className="text-white font-bold text-sm mb-1 group-hover:text-primary transition-colors">{notification.title}</h4>
                                            )}
                                            <p className="text-slate-300 text-xs font-medium leading-relaxed">{notification.message}</p>

                                            {notification.type === 'update' && notification.download_url && (
                                                <a
                                                    href={notification.download_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95 w-full justify-center"
                                                    onClick={(e) => {
                                                        // Don't close dropdown on link click
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <Download size={14} />
                                                    Baixar Nova Versão
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-3 border-t border-white/5 bg-white/5 text-center">
                    <p className="text-[10px] text-slate-500 font-medium">Você será avisado de novas atualizações.</p>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
