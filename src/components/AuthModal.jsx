import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthModal() {
    const dialogRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const open = () => dialogRef.current?.showModal();
        const close = () => dialogRef.current?.close();

        window.addEventListener('open-auth-modal', open);
        window.addEventListener('close-auth-modal', close);

        return () => {
            window.removeEventListener('open-auth-modal', open);
            window.removeEventListener('close-auth-modal', close);
        };
    }, []);

    const handleAuth = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) return;

        setLoading(true);
        setMessage({ text: 'Processando...', type: 'info' });

        let result;
        if (isLogin) {
            result = await supabase.auth.signInWithPassword({ email, password });
        } else {
            result = await supabase.auth.signUp({ email, password });
        }

        setLoading(false);

        if (result.error) {
            setMessage({ text: result.error.message, type: 'error' });
        } else {
            setMessage({ text: 'Sucesso!', type: 'success' });
            setTimeout(() => {
                dialogRef.current?.close();
                window.location.reload();
            }, 1000);
        }
    };

    return (
        <dialog
            ref={dialogRef}
            className="group bg-transparent p-0 backdrop:bg-black/95 backdrop:backdrop-blur-md open:animate-in open:fade-in open:zoom-in-95 backdrop:animate-in backdrop:fade-in fixed inset-0 z-50 m-auto"
            onCancel={(e) => e.preventDefault()}
        >
            <div className="relative p-[2px] rounded-xl overflow-hidden">
                {/* Moving Purple Glow */}
                <div className="absolute inset-0 bg-[conic-gradient(from_var(--angle),#6366f1,#a855f7,#6366f1)] animate-[spin_3s_linear_infinite] opacity-70"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/50 to-purple-600/50 blur-xl opacity-50 animate-pulse"></div>

                <div className="bg-[#0A0A0B] w-full max-w-sm rounded-xl border border-white/10 shadow-2xl overflow-hidden relative p-8">

                    {/* Interior Glints */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none"></div>

                    {/* Header */}
                    <div className="text-center mb-8 relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                            <span className="material-icons-round text-3xl text-white">fitness_center</span>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Pulse<span className="text-primary">Fit</span></h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Faça login para continuar</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="space-y-4 relative z-10">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="seu@email.com"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Senha</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength="6"
                                    placeholder="••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-medium pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-3 rounded-lg text-center text-xs font-bold ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-primary to-purple-600 text-white font-black uppercase tracking-wide rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                        </button>
                    </form>

                    {/* Toggle */}
                    <div className="mt-6 text-center relative z-10">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setMessage({ text: '', type: '' });
                            }}
                            className="text-slate-500 hover:text-white text-xs font-bold transition-colors hover:underline"
                        >
                            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Fazer Login'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Inject Animation Style */}
            <style>{`
                @property --angle {
                    syntax: '<angle>';
                    initial-value: 0deg;
                    inherits: false;
                }
                
                @keyframes spin {
                    from {
                        --angle: 0deg;
                    }
                    to {
                        --angle: 360deg;
                    }
                }
            `}</style>
        </dialog>
    );
}
