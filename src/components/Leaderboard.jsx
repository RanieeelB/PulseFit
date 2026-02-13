import React, { useEffect, useState } from 'react';
import { Trophy, Crown, Medal, Flame, Zap, User } from 'lucide-react';
import { workoutService } from '../services/workoutService';

export default function Leaderboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async () => {
        try {
            const result = await workoutService.getLeaderboard();
            setData(result || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();

        const handleUpdate = () => fetchLeaderboard();
        window.addEventListener('stats-updated', handleUpdate);
        return () => window.removeEventListener('stats-updated', handleUpdate);
    }, []);

    if (loading) return (
        <div className="bg-[#0A0A0B] rounded-3xl p-6 border border-white/5 animate-pulse h-full">
            <div className="h-6 w-32 bg-white/5 rounded-full mb-8"></div>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-white/5 rounded-lg"></div>
                        <div className="w-10 h-10 bg-white/5 rounded-xl"></div>
                        <div className="h-4 flex-1 bg-white/5 rounded-full"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Crown className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" size={20} />;
            case 1: return <Medal className="text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" size={20} />;
            case 2: return <Medal className="text-amber-600 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]" size={20} />;
            default: return <span className="text-slate-500 font-black italic ml-1">{index + 1}</span>;
        }
    };

    return (
        <div className="bg-[#0A0A0B] rounded-3xl p-6 border border-white/5 relative overflow-hidden group h-full flex flex-col">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-yellow-400/10 transition-colors duration-700"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-400/10 rounded-xl border border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.1)] group-hover:rotate-12 transition-transform">
                        <Trophy className="text-yellow-400" size={18} />
                    </div>
                    <h3 className="text-lg font-black text-white italic tracking-wider uppercase drop-shadow-md">Elite da Semana</h3>
                </div>
                <div className="text-[10px] font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">
                    TOP 5
                </div>
            </div>

            <div className="space-y-2.5 relative z-10 flex-1">
                {data.length > 0 ? (
                    data.map((user, index) => (
                        <div
                            key={index}
                            className={`
                            flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 group/item
                            ${index === 0
                                    ? 'bg-gradient-to-r from-yellow-400/10 to-transparent border-yellow-400/30 shadow-[0_0_20px_rgba(250,204,21,0.05)] scale-[1.01] sm:scale-[1.02]'
                                    : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]'}
                        `}
                        >
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 mr-2">
                                <div className="w-6 sm:w-8 flex justify-center shrink-0">
                                    {getRankIcon(index)}
                                </div>

                                <div className="relative shrink-0">
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border shadow-lg transition-transform group-hover/item:scale-105
                                            ${index === 0 ? 'border-yellow-400/40 shadow-yellow-400/10' : 'border-white/10'}
                                        `}
                                    />
                                    {index === 0 && (
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-[#0A0A0B] shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse"></div>
                                    )}
                                </div>

                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className={`text-xs sm:text-sm font-bold uppercase tracking-wide truncate ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                                        {user.name}
                                    </span>
                                    <div className="flex items-center gap-1.5 opacity-60">
                                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                                            {user.count} {user.count === 1 ? 'treino' : 'treinos'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border transition-all shrink-0
                            ${index === 0
                                    ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400'
                                    : 'bg-white/5 border-white/5 text-slate-400 group-hover/item:border-white/20 group-hover/item:text-white'}
                        `}>
                                <span className="text-xs sm:text-sm font-black italic leading-none">{user.count}</span>
                                <Flame className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${user.count >= 3 ? 'text-orange-500' : 'text-slate-600'} group-hover/item:animate-bounce-slow`} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                        <Zap size={32} className="text-slate-600 mb-2" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aguardando treinos...</p>
                        <span className="text-[10px] text-slate-600 mt-1">Seja o primeiro a treinar esta semana!</span>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center relative z-10">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                    Frequência é a chave da evolução
                </p>
            </div>
        </div>
    );
}
