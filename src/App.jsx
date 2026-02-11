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

import { supabase } from './services/supabaseClient';
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
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
            <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display flex flex-col overflow-x-hidden relative">
                <Navbar />
                <main className="flex-grow w-full">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/index.html" element={<Home />} /> {/* Redirect/Alias */}
                        <Route path="/progress.html" element={<Progress />} />
                        <Route path="/diet.html" element={<Diet />} />
                        <Route path="/social.html" element={<Social />} />
                    </Routes>
                </main>

                {/* Global Modals */}
                <AuthModal />
                <ProfileModal />
                <WorkoutManagerModal />
            </div>
        </Router>
    );
}

export default App;
