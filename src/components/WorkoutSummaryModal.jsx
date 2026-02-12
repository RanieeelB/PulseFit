import React, { useEffect } from 'react';
import { Home, Award, TrendingUp, Clock, Flame, ArrowUp, Download } from 'lucide-react';
import { getIcon } from '../utils/iconMap';

export default function WorkoutSummaryModal({ summary, onClose, workoutTitle }) {
    // Confetti generation
    const confettiCount = 30;
    const confettiColors = ['#A855F7', '#34D399', '#FBBF24'];

    useEffect(() => {
        // Play sound effect if desired?
    }, []);

    // Sanitize data for display (avoid 0 values)
    const displayDuration = Math.max(1, Math.round(summary.duration || 0));
    const displayCalories = Math.max(1, Math.round(summary.calories || 0));

    if (!summary) return null;

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#0B0B0F]/95 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0B0B0F]/50 to-[#0B0B0F] pointer-events-none"></div>

            {/* Styles for this specific modal */}
            <style>{`
                .confetti-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 60%;
                    overflow: hidden;
                    pointer-events: none;
                    z-index: 0;
                }
                .confetti {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    animation: fall linear forwards;
                    opacity: 0;
                }
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(60vh) rotate(720deg); opacity: 0; }
                }
                .glass-panel {
                    background: linear-gradient(145deg, rgba(28, 28, 38, 0.9) 0%, rgba(19, 19, 26, 0.95) 100%);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .neon-text-glow {
                    text-shadow: 0 0 10px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.3);
                }
                .gold-badge-glow {
                    box-shadow: 0 0 25px rgba(251, 191, 36, 0.2);
                }
                .shadow-glow-gold {
                    box-shadow: 0 0 20px -5px rgba(251, 191, 36, 0.4);
                }
                .shadow-glow-green {
                    box-shadow: 0 0 15px -5px rgba(52, 211, 153, 0.4);
                }
                .shadow-glow-message {
                    box-shadow: 0 0 25px -5px rgba(168, 85, 247, 0.25);
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-pulse-slow {
                    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                /* Futuristic Entrance */
                .modal-enter {
                    animation: modal-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes modal-in {
                    0% {
                        opacity: 0;
                        transform: scale(0.9) translateY(20px);
                        filter: blur(10px);
                    }
                    50% {
                        filter: blur(0px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                .stagger-1 { animation-delay: 100ms; }
                .stagger-2 { animation-delay: 200ms; }
                .stagger-3 { animation-delay: 300ms; }
            `}</style>

            {/* Confetti */}
            <div className="confetti-container">
                {Array.from({ length: confettiCount }).map((_, i) => (
                    <div
                        key={i}
                        className="confetti"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${1.5 + Math.random() * 1.5}s`,
                            animationDelay: `${Math.random() * 0.2}s`,
                            backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)]
                        }}
                    ></div>
                ))}
            </div>

            {/* Ambient Background */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-purple-600/20 blur-[150px] rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full"></div>
            </div>

            <main className="modal-enter w-full max-w-4xl mx-auto flex flex-col gap-6 md:gap-8 relative z-10 p-4 md:pt-12 h-full overflow-y-auto custom-scrollbar">

                <header className="text-center relative shrink-0 pt-4 md:pt-0">
                    <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 text-white mb-4 md:mb-6 shadow-glow-gold animate-float border-2 border-yellow-200 gold-badge-glow">
                        <Award size={48} className="md:w-[3.5rem] md:h-[3.5rem] text-white fill-current" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight neon-text-glow uppercase">
                        Treino Finalizado!
                    </h1>
                    <p className="text-slate-400 text-sm md:text-lg font-medium max-w-lg mx-auto">
                        Você superou seus limites hoje! Ótimo trabalho.
                    </p>
                </header>

                <div className="relative w-full max-w-2xl mx-auto p-[1px] rounded-xl bg-gradient-to-r from-purple-500/20 via-purple-500 to-purple-500/20 shadow-glow-message shrink-0">
                    <div className="relative bg-[#13131A]/90 backdrop-blur-md rounded-xl p-4 md:p-6 text-center border border-white/5">
                        <p className="text-base md:text-xl text-white font-medium leading-relaxed">
                            Parabéns! Você completou <span className="font-extrabold text-[#34D399]">{workoutTitle}</span> e ficou <span className="font-extrabold text-[#34D399]">mais forte</span> hoje! 🔥
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 w-full shrink-0">
                    {/* Time */}
                    <div className="glass-panel p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center hover:border-purple-500/50 transition-all duration-300 group relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                        <div className="text-slate-400 mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <Clock size={16} /> Tempo Total
                        </div>
                        <div className="text-3xl md:text-5xl font-bold text-white group-hover:text-purple-400 transition-colors tracking-tight">
                            {summary.duration}<span className="text-sm md:text-xl text-slate-500 ml-1 font-medium">min</span>
                        </div>
                    </div>

                    {/* Calories */}
                    <div className="glass-panel p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center hover:border-amber-500/50 transition-all duration-300 group relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                        <div className="text-slate-400 mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <Flame size={16} className="text-amber-500" /> Calorias
                        </div>
                        <div className="text-3xl md:text-5xl font-bold text-white group-hover:text-amber-500 transition-colors tracking-tight">
                            {summary.calories}<span className="text-sm md:text-xl text-slate-500 ml-1 font-medium">kcal</span>
                        </div>
                    </div>

                    {/* PRs */}
                    <div className="glass-panel p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center hover:border-emerald-500/50 transition-all duration-300 group relative overflow-hidden shadow-lg shadow-glow-green/20">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
                        <div className="text-slate-400 mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <TrendingUp size={16} className="text-emerald-500" /> Novos Recordes
                        </div>
                        <div className="text-3xl md:text-5xl font-bold text-white group-hover:text-emerald-500 transition-colors tracking-tight">
                            {summary.prs.length}<span className="text-sm md:text-xl text-slate-500 ml-1 font-medium">PRs</span>
                        </div>
                    </div>
                </div>

                {/* Evolution List */}
                <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-xl w-full max-w-4xl mx-auto mb-8 shrink-0">
                    <div className="p-4 md:p-5 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                        <h3 className="font-bold text-base md:text-lg text-white flex items-center gap-2">
                            <Award className="text-purple-500" size={20} /> Destaques do Treino
                        </h3>
                        <span className="text-[10px] md:text-xs font-bold bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full border border-purple-500/20 tracking-wide">RESULTADOS</span>
                    </div>

                    <div className="p-2 space-y-1">
                        {summary.isLoading ? (
                            <div className="p-8 text-center space-y-3">
                                <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                                <p className="text-slate-400 text-xs animate-pulse">Calculando recordes e progressão...</p>
                            </div>
                        ) : (
                            <>
                                {/* PRs First */}
                                {summary.prs.map((pr, i) => (
                                    <div key={`pr-${i}`} className="flex items-center justify-between p-3 md:p-4 hover:bg-white/5 rounded-xl transition-colors group">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#13131A] border border-white/5 flex items-center justify-center text-slate-400 group-hover:border-purple-500/50 group-hover:text-purple-500 transition-all">
                                                <Award size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm md:text-base">{pr.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-bold text-black bg-[#34D399] px-2 py-0.5 rounded flex items-center gap-1 shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                                                        <TrendingUp size={10} /> PR
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">Novo Recorde</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg md:text-xl font-bold text-white">{pr.newWeight}<span className="text-xs text-slate-500 ml-1">kg</span></div>
                                            <div className="text-[10px] text-[#34D399] font-bold flex justify-end items-center gap-1">
                                                +{pr.newWeight - pr.oldWeight}kg
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Then Improvements */}
                                {summary.improvements.filter(imp => !summary.prs.some(pr => pr.name === imp.name)).map((imp, i) => (
                                    <div key={`imp-${i}`} className="flex items-center justify-between p-3 md:p-4 hover:bg-white/5 rounded-xl transition-colors group">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#13131A] border border-white/5 flex items-center justify-center text-slate-400 group-hover:border-purple-500/50 group-hover:text-purple-500 transition-all">
                                                <TrendingUp size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm md:text-base">{imp.name}</h4>
                                                <span className="text-[10px] text-slate-500">Progressão de Carga</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg md:text-xl font-bold text-white">{imp.newWeight}<span className="text-xs text-slate-500 ml-1">kg</span></div>
                                            <div className="text-[10px] text-[#34D399] font-bold flex justify-end items-center gap-1">
                                                <ArrowUp size={10} /> +{imp.diff}kg
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {summary.prs.length === 0 && summary.improvements.length === 0 && (
                                    <div className="p-8 text-center text-slate-500 text-sm">
                                        <p>Treino concluído! Continue focado para bater seus recordes no próximo.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 pb-12 shrink-0 w-full px-4">
                    <button
                        onClick={onClose}
                        className="w-full md:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-colors text-sm uppercase tracking-wide border border-white/5 flex-1 md:flex-none cursor-pointer"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </main>
        </div>
    );
}
