import React, { useEffect, useState } from 'react';
import { Award, Clock, Flame, Rocket, Calendar, Check, TrendingUp, Zap } from 'lucide-react';

const WeeklyCompletedModal = ({ stats, onClose }) => {
    const [confetti, setConfetti] = useState([]);

    useEffect(() => {
        // Generate confetti positions
        const newConfetti = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            animationDuration: 1.5 + Math.random() * 1.5,
            animationDelay: Math.random() * 0.2,
            color: ['#A855F7', '#34D399', '#FBBF24'][Math.floor(Math.random() * 3)]
        }));
        setConfetti(newConfetti);
    }, []);

    // Helper to format days for streak
    const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
    // Assuming stats.streakDays is an array of day indices (0=Sun, 1=Mon...) or ISO dates
    // For this mock/version, let's assume we highlight all for the "Perfect Week" effect
    // or use the actual data if provided.

    return (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-start p-4 md:p-8 font-sans antialiased overflow-x-hidden bg-[#0B0B0F] overflow-y-auto custom-scrollbar animate-in fade-in duration-500">

            {/* Styles for animation */}
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
                .gold-trophy-glow {
                    filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.5));
                }
                .glass-message {
                    background: linear-gradient(145deg, rgba(168, 85, 247, 0.05) 0%, rgba(168, 85, 247, 0.1) 100%);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(168, 85, 247, 0.3);
                    box-shadow: 0 0 20px rgba(168, 85, 247, 0.15), inset 0 0 10px rgba(168, 85, 247, 0.05);
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
                .shadow-neon-card { box-shadow: 0 0 15px -3px rgba(168, 85, 247, 0.15); }
                .shadow-glow-green { box-shadow: 0 0 15px -5px rgba(52, 211, 153, 0.4); }
                .shadow-glow-gold { box-shadow: 0 0 20px -5px rgba(251, 191, 36, 0.4); }
            `}</style>

            <div className="confetti-container">
                {confetti.map((c) => (
                    <div
                        key={c.id}
                        className="confetti"
                        style={{
                            left: `${c.left}%`,
                            animationDuration: `${c.animationDuration}s`,
                            animationDelay: `${c.animationDelay}s`,
                            backgroundColor: c.color
                        }}
                    ></div>
                ))}
            </div>

            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-purple-600/20 blur-[150px] rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full"></div>
            </div>

            <main className="w-full max-w-4xl mx-auto flex flex-col gap-8 relative z-10 pt-8">
                <header className="text-center relative flex flex-col items-center">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-b from-yellow-300/20 to-yellow-600/20 text-yellow-400 mb-6 animate-float border border-yellow-500/30 gold-trophy-glow relative">
                        <div className="absolute inset-0 rounded-full blur-xl bg-yellow-500/20"></div>
                        <Award size={80} strokeWidth={1} className="relative z-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] fill-yellow-400/20" />

                        <div className="absolute top-2 right-4 text-yellow-200 animate-pulse delay-75">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                        </div>
                        <div className="absolute bottom-4 left-4 text-yellow-200 animate-pulse delay-100 scale-75">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 tracking-tight neon-text-glow uppercase text-center">
                        Ciclo Semanal<br /><span className="text-purple-400">Concluído!</span>
                    </h1>

                    <p className="text-slate-400 text-lg font-medium max-w-lg mx-auto mb-8">
                        Você completou todos os treinos planejados. Consistência é a chave!
                    </p>

                    <div className="w-full max-w-3xl mx-auto glass-message rounded-xl p-6 relative group overflow-hidden border border-purple-500/40 animate-float" style={{ animationDelay: '1.5s', animationDuration: '5s' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-purple-500/10 opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <p className="text-lg md:text-xl text-white font-medium leading-relaxed">
                                Incrível! Você manteve <span className="font-extrabold text-[#34D399] tracking-wide">100% de foco</span>. Sua disciplina está te levando ao próximo nível! 🚀
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
                    {/* Volume */}
                    {/* Streak */}
                    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center hover:border-yellow-400/50 transition-all duration-300 group relative overflow-hidden shadow-lg shadow-yellow-500/20">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
                        <div className="text-slate-400 mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <Zap size={20} className="text-yellow-400 fill-yellow-400" /> Dias de Streak
                        </div>
                        <div className="text-4xl lg:text-5xl font-bold text-white group-hover:text-yellow-400 transition-colors tracking-tight mt-1">
                            {stats.streak || 0}<span className="text-lg text-slate-500 ml-1 font-medium">dias</span>
                        </div>
                    </div>

                    {/* Hours */}
                    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center hover:border-green-500/50 transition-all duration-300 group relative overflow-hidden shadow-lg shadow-glow-green">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
                        <div className="text-slate-400 mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <Clock size={20} className="text-green-500" /> Total de Horas
                        </div>
                        <div className="text-4xl lg:text-5xl font-bold text-white group-hover:text-green-400 transition-colors tracking-tight mt-1">
                            {stats.totalHours || 0}<span className="text-lg text-slate-500 ml-1 font-medium">h</span>
                        </div>
                    </div>

                    {/* Calories */}
                    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center hover:border-amber-500/50 transition-all duration-300 group relative overflow-hidden shadow-lg shadow-glow-gold">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                        <div className="text-slate-400 mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <Flame size={20} className="text-amber-500 fill-amber-500" /> Calorias Semanais
                        </div>
                        <div className="text-4xl lg:text-5xl font-bold text-white group-hover:text-amber-500 transition-colors tracking-tight mt-1">
                            {stats.totalCalories || 0}<span className="text-lg text-slate-500 ml-1 font-medium">kcal</span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl w-full p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="font-bold text-xl text-white flex items-center gap-3">
                            <span className="bg-green-500/20 p-2 rounded-lg text-green-500">
                                <Calendar size={20} />
                            </span>
                            Weekly Streak
                        </h3>
                        <div className="flex items-center gap-2 bg-[#13131A] px-4 py-2 rounded-full border border-white/5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-green-500 uppercase tracking-wide">Semana Perfeita</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 md:gap-4">
                        {days.map((day, index) => {
                            // Map day index (0=Sun, 1=Mon...) to our days array
                            // Our days array is ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']
                            // So SEG (Monday) is index 0 in our array, but index 1 in JS Date.getDay()
                            // JS getDay(): 0=Sun, 1=Mon, 2=Tue...

                            // Map index of our array to JS Day
                            // 0 (SEG) -> 1
                            // 1 (TER) -> 2
                            // ...
                            // 5 (SAB) -> 6
                            // 6 (DOM) -> 0

                            const jsDayIndex = index === 6 ? 0 : index + 1;

                            const isChecked = stats.daysCompleted && stats.daysCompleted.includes(jsDayIndex);

                            return (
                                <div key={day} className="flex flex-col items-center gap-3 group">
                                    <span className="text-xs font-medium text-slate-500 group-hover:text-white transition-colors">{day}</span>
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center transition-all transform group-hover:scale-110 ${isChecked ? 'bg-[#13131A] border-green-500/30 shadow-[0_0_10px_rgba(52,211,153,0.15)]' : 'bg-[#13131A] border-white/5 opacity-50'}`}>
                                        {isChecked ? (
                                            <Check size={20} className="text-green-500 font-bold" strokeWidth={3} />
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-700">-</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col items-center pb-12 pt-4">
                    <button
                        onClick={onClose}
                        className="group relative px-12 py-5 bg-[#0A0A0B] rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 border border-purple-500/20 w-full md:w-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>
                        <div className="relative flex items-center justify-center gap-4">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-purple-500/30">
                                <Rocket className="text-white" size={24} />
                            </div>
                            <span className="font-black text-white tracking-wide uppercase text-lg">Continuar Evoluindo</span>
                        </div>
                    </button>
                    <p className="mt-6 text-xs text-slate-500/50 font-mono">PulseFit v2.4.0 • Stats updated just now</p>
                </div>
            </main>
        </div>
    );
};

export default WeeklyCompletedModal;
