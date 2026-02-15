import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { userService } from '../services/userService';
import { User, LogIn, Menu, X, Dumbbell, BarChart2, Utensils, Users, Bell } from 'lucide-react';
import logo from '../assets/logopulsefit.png.jpg';

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
        { name: 'Treinos', path: '/', icon: <Dumbbell size={22} /> },
        { name: 'Progresso', path: '/progress', icon: <BarChart2 size={22} /> },
        { name: 'Dieta', path: '/diet', icon: <Utensils size={22} /> },
        { name: 'Social', path: '/social', icon: <Users size={22} /> }
    ];

    const openAuth = () => window.dispatchEvent(new CustomEvent('open-auth-modal'));
    const openProfile = () => window.dispatchEvent(new CustomEvent('open-profile-modal'));

    return (
        <>
            <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0A0A0B]/80 backdrop-blur-md transition-all">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center">
                            <img src={logo} alt="PulseFit" className="h-16 w-auto" />
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden md:block">
                            <div className="flex items-baseline space-x-2">
                                {links.map(link => {
                                    const isActive = activePath === link.path;
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

            {/* Mobile Bottom Navigation (Compact Futuristic Dock) */}
            <div className="md:hidden fixed bottom-4 inset-x-0 z-50 flex justify-center pointer-events-none">
                <div className="pointer-events-auto bg-[#050505]/80 backdrop-blur-2xl border border-white/5 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] flex items-center p-1.5 gap-1 ring-1 ring-white/5 transition-all">
                    {links.map(link => {
                        const isActive = activePath === link.path;
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                                    ? 'text-white'
                                    : 'text-slate-600 hover:text-slate-300'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-sm animate-pulse"></div>
                                )}
                                <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`}>
                                    {React.cloneElement(link.icon, { size: isActive ? 22 : 20, strokeWidth: isActive ? 3 : 2 })}
                                </div>
                                {isActive && (
                                    <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_#a855f7]"></div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Gradient Overlay (Bottom) */}
            <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none md:hidden z-40"></div>
        </>
    );
}
