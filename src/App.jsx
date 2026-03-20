import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Progress from './pages/Progress';
import Diet from './pages/Diet';
import Social from './pages/Social';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import WorkoutManagerModal from './components/WorkoutManagerModal';
import CardioModal from './components/CardioModal';

import { supabase } from './services/supabaseClient';
import { useEffect } from 'react';
import { isDemoMode, setDemoMode } from './utils/demoMode';

function App() {
    useEffect(() => {
        // Handle /demo hit first
        if (window.location.pathname.startsWith('/demo')) {
            setDemoMode(true);
            return;
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session && !isDemoMode()) {
                // Delay slightly to ensure CustomEvent listeners are attached
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('open-auth-modal'));
                }, 100);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                // If user logs out, or session expires, show modal again? 
                // Maybe not strictly necessary for logout button, but good for expiration.
                // window.dispatchEvent(new CustomEvent('open-auth-modal'));
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <Router>
            <div className="min-h-screen bg-background-dark text-slate-800 dark:text-slate-200 font-display flex flex-col overflow-x-hidden relative">
                {isDemoMode() && (
                    <div className="bg-primary/20 backdrop-blur-md border-b border-primary/30 py-2.5 px-4 flex items-center justify-between text-xs sm:text-sm font-bold text-primary animate-pulse-slow z-[60]">
                        <div className="flex items-center gap-2">
                            <span className="material-icons-round text-base sm:text-lg">visibility</span>
                            <span>Modo de Demonstração (Apenas Leitura)</span>
                        </div>
                        <button
                            onClick={() => {
                                setDemoMode(false);
                                window.location.href = '/';
                            }}
                            className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark transition-all text-[10px] sm:text-xs"
                        >
                            Sair do Demo
                        </button>
                    </div>
                )}
                <Navbar />
                <main className="flex-grow w-full">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/demo" element={<Home />} />
                        <Route path="/progress" element={<Progress />} />
                        <Route path="/diet" element={<Diet />} />
                        <Route path="/social" element={<Social />} />
                        <Route path="*" element={<Home />} />
                    </Routes>
                </main>

                {/* Global Modals */}
                <AuthModal />
                <ProfileModal />
                <WorkoutManagerModal />
                <CardioModal />
            </div>
        </Router>
    );
}

export default App;
