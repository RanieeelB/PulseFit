import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { userService } from '../services/userService';
import { User, LogIn, Menu, X, Dumbbell, BarChart2, Utensils, Users, Bell } from 'lucide-react';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // Simulate active page based on path
    const activePath = location.pathname;

    useEffect(() => {
        async function loadUser() {
            try {
                const profile = await userService.getProfile();
                setUser(profile);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        }
        loadUser();

        // Listen for profile updates
        const handleProfileUpdate = (e) => setUser(e.detail);
        window.addEventListener('user-profile-updated', handleProfileUpdate);

        return () => window.removeEventListener('user-profile-updated', handleProfileUpdate);
    }, []);

    const links = [
        { name: 'Treinos', path: '/', icon: <Dumbbell size={24} /> },
        { name: 'Progresso', path: '/progress.html', icon: <BarChart2 size={24} /> },
        { name: 'Dieta', path: '/diet.html', icon: <Utensils size={24} /> },
        { name: 'Social', path: '/social.html', icon: <Users size={24} /> }
    ];

    const openAuth = () => window.dispatchEvent(new CustomEvent('open-auth-modal'));
    const openProfile = () => window.dispatchEvent(new CustomEvent('open-profile-modal'));

    return (
        <>
            <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md transition-all">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="material-icons-round text-white">fitness_center</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Pulse<span className="text-primary">Fit</span>
                            </span>
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden md:block">
                            <div className="flex items-baseline space-x-2">
                                {links.map(link => {
                                    const isActive = activePath === link.path || (link.path === '/' && activePath === '/index.html');
                                    return (
                                        <Link
                                            key={link.name}
                                            to={link.path}
                                            className={isActive
                                                ? 'bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold transition-all'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 px-4 py-2 rounded-xl text-sm font-semibold transition-all'
                                            }
                                        >
                                            {link.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* User Section */}
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                                <Bell size={24} />
                                {user?.notifications > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface-dark"></span>
                                )}
                            </button>

                            {loading ? (
                                <div className="animate-pulse flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                                    <div className="hidden sm:block w-20 h-4 bg-slate-200 dark:bg-white/10 rounded"></div>
                                </div>
                            ) : user ? (
                                <button
                                    onClick={openProfile}
                                    className="flex items-center gap-3 pl-4 border-l border-white/5 hover:opacity-100 transition-all group"
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{user.name}</p>
                                        <div className="flex items-center justify-end gap-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                                            <p className="text-[10px] text-slate-400 font-mono">LVL {user.level}</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -inset-1 bg-gradient-to-br from-primary to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition-opacity"></div>
                                        <img
                                            alt="Profile"
                                            className="relative h-10 w-10 rounded-xl object-cover border border-white/10"
                                            src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'}
                                        />
                                    </div>
                                </button>
                            ) : (
                                <button
                                    onClick={openAuth}
                                    className="text-sm font-bold text-primary hover:underline"
                                >
                                    Entrar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav >

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-50 flex justify-around items-center py-3 animate-slide-up">
                {links.map(link => {
                    const isActive = activePath === link.path || (link.path === '/' && activePath === '/index.html');
                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`flex flex-col items-center gap-1 p-2 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
                        >
                            {link.icon}
                            <span className="text-[10px] font-bold">{link.name}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Mobile Gradients */}
            <div className="fixed top-[80px] left-0 right-0 h-16 bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none md:hidden z-40"></div>
            <div className="fixed bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none md:hidden z-40"></div>
        </>
    );
}
