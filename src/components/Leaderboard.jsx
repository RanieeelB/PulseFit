import React, { useEffect, useState } from 'react';
import { Trophy, Crown, Medal, Flame, Zap, TrendingUp, Star } from 'lucide-react';
import { workoutService } from '../services/workoutService';

export default function Leaderboard() {
    const [data, setData] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async () => {
        try {
            const result = await workoutService.getLeaderboard();
            setData(result.ranked || []);
            setCurrentUserId(result.currentUserId);
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
        <div className="bg-[#0A0A0B] rounded-3xl p-6 border border-white/5 animate-pulse">
            <div className="h-6 w-40 bg-white/5 rounded-full mb-6"></div>
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-white/5 rounded-2xl"></div>
                ))}
            </div>
        </div>
    );

    const podiumConfig = [
        { gradient: 'from-yellow-400 via-amber-300 to-yellow-500', glow: 'shadow-yellow-400/30', border: 'border-yellow-400/40', text: 'text-yellow-400', bg: 'bg-yellow-400', label: '1º', size: 'w-14 h-14' },
        { gradient: 'from-slate-300 via-gray-200 to-slate-400', glow: 'shadow-slate-300/20', border: 'border-slate-300/30', text: 'text-slate-300', bg: 'bg-slate-300', label: '2º', size: 'w-12 h-12' },
        { gradient: 'from-amber-600 via-orange-500 to-amber-700', glow: 'shadow-amber-600/20', border: 'border-amber-600/30', text: 'text-amber-500', bg: 'bg-amber-600', label: '3º', size: 'w-12 h-12' },
    ];

    return (
        <div className="relative overflow-hidden rounded-3xl">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0c0a1a] via-[#0A0A0B] to-[#0a0c14]"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-yellow-400/5 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-purple-500/5 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative p-6 border border-white/5 rounded-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-400/20 blur-lg rounded-xl"></div>
                            <div className="relative p-2.5 bg-gradient-to-br from-yellow-400/20 to-amber-500/10 rounded-xl border border-yellow-400/20">
                                <Trophy className="text-yellow-400" size={18} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base font-black text-white uppercase tracking-wider">Ranking Semanal</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quem treina mais</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 rounded-full border border-yellow-400/20">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-black text-yellow-400 uppercase tracking-wider">Top 5</span>
                    </div>
                </div>

                {data.length > 0 ? (
                    <>
                        {/* Podium - Top 3 */}
                        <div className="flex items-end justify-center gap-3 mb-6 px-2">
                            {/* 2nd Place */}
                            {data[1] && (
                                <div className="flex flex-col items-center flex-1 max-w-[120px]">
                                    <div className="relative mb-2">
                                        <div className={`absolute inset-0 rounded-full blur-md ${podiumConfig[1].bg} opacity-20`}></div>
                                        <img src={data[1].avatar} alt={data[1].name}
                                            className={`${podiumConfig[1].size} rounded-full object-cover border-2 ${podiumConfig[1].border} shadow-lg ${podiumConfig[1].glow} relative`}
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full flex items-center justify-center text-[8px] font-black text-slate-800 border border-white/20 shadow-md">
                                            2
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-300 truncate max-w-full text-center">{data[1].name?.split(' ')[0]}</span>
                                    <span className="text-[10px] font-black text-slate-500">{data[1].count} treinos</span>
                                </div>
                            )}

                            {/* 1st Place */}
                            {data[0] && (
                                <div className="flex flex-col items-center flex-1 max-w-[140px] -mt-4">
                                    <div className="mb-1">
                                        <Crown size={20} className="text-yellow-400 mx-auto drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-pulse" />
                                    </div>
                                    <div className="relative mb-2">
                                        <div className={`absolute inset-[-4px] rounded-full bg-gradient-to-br ${podiumConfig[0].gradient} opacity-40 blur-sm animate-pulse`}></div>
                                        <img src={data[0].avatar} alt={data[0].name}
                                            className={`${podiumConfig[0].size} rounded-full object-cover border-2 ${podiumConfig[0].border} shadow-xl ${podiumConfig[0].glow} relative`}
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-[9px] font-black text-yellow-900 border border-yellow-200/50 shadow-lg shadow-yellow-400/30">
                                            1
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-yellow-400 truncate max-w-full text-center">{data[0].name?.split(' ')[0]}</span>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Flame size={10} className="text-orange-500" />
                                        <span className="text-[10px] font-black text-yellow-400/80">{data[0].count} treinos</span>
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {data[2] && (
                                <div className="flex flex-col items-center flex-1 max-w-[120px]">
                                    <div className="relative mb-2">
                                        <div className={`absolute inset-0 rounded-full blur-md ${podiumConfig[2].bg} opacity-15`}></div>
                                        <img src={data[2].avatar} alt={data[2].name}
                                            className={`${podiumConfig[2].size} rounded-full object-cover border-2 ${podiumConfig[2].border} shadow-lg ${podiumConfig[2].glow} relative`}
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-[8px] font-black text-amber-100 border border-amber-400/30 shadow-md">
                                            3
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-bold text-amber-400/80 truncate max-w-full text-center">{data[2].name?.split(' ')[0]}</span>
                                    <span className="text-[10px] font-black text-slate-500">{data[2].count} treinos</span>
                                </div>
                            )}
                        </div>

                        {/* Separator */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        </div>

                        {/* 4th & 5th Compact List */}
                        <div className="space-y-1.5">
                            {data.slice(3).map((user, i) => {
                                const rank = i + 4;
                                const isMe = user.user_id === currentUserId;
                                return (
                                    <div
                                        key={rank}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300
                                            ${isMe
                                                ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-slate-500 w-6 text-center italic">{rank}</span>
                                            <img src={user.avatar} alt={user.name}
                                                className={`w-8 h-8 rounded-lg object-cover border ${isMe ? 'border-primary/40' : 'border-white/10'}`}
                                            />
                                            <div>
                                                <span className={`text-xs font-bold ${isMe ? 'text-primary' : 'text-white'}`}>{user.name}</span>
                                                {isMe && <span className="ml-1.5 text-[9px] font-bold text-primary/60 uppercase">(Você)</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/5">
                                            <span className="text-xs font-black text-slate-400">{user.count}</span>
                                            <Flame size={11} className="text-slate-600" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Current user highlight if in top 3 */}
                        {data.slice(0, 3).some(u => u.user_id === currentUserId) && (
                            <div className="mt-4 text-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider">
                                    <TrendingUp size={10} /> Você está no Top 3! Continue assim!
                                </span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3">
                            <Zap size={28} className="text-slate-600" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aguardando treinos...</p>
                        <span className="text-[10px] text-slate-600 mt-1">Seja o primeiro a treinar esta semana!</span>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-white/5 text-center">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                        Treine mais para subir no ranking 🔥
                    </p>
                </div>
            </div>
        </div>
    );
}
