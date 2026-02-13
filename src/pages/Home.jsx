import React, { useState, useEffect } from 'react';
import WorkoutDetailsModal from '../components/WorkoutDetailsModal';
import { workoutService } from '../services/workoutService';
import { getRandomTip } from '../utils/tips';
import { Plus, CheckCircle, PlayCircle, Clock, Moon, Flame, Zap, Activity, TrendingUp, Calendar } from 'lucide-react';
import { getIcon, emojiToIconMap } from '../utils/iconMap';
import Leaderboard from '../components/Leaderboard';

export default function Home() {
    const [workouts, setWorkouts] = useState([]);
    const [stats, setStats] = useState({ workouts: 0, minutes: 0, calories: 0 });
    const [streak, setStreak] = useState(0);
    const [performance, setPerformance] = useState(0);
    const [tip, setTip] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    const loadData = async () => {
        try {
            const [wData, sData, streakData, perfData] = await Promise.all([
                workoutService.getAll(),
                workoutService.getWeeklyStats(),
                workoutService.getStreak(),
                workoutService.getMonthlyPerformance()
            ]);
            setWorkouts(wData || []);
            setStats(sData || { workouts: 0, minutes: 0, calories: 0 });
            setStreak(streakData);
            setPerformance(perfData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        setTip(getRandomTip());

        const handleUpdate = () => loadData();
        window.addEventListener('workout-updated', handleUpdate);
        window.addEventListener('stats-updated', handleUpdate);
        return () => {
            window.removeEventListener('workout-updated', handleUpdate);
            window.removeEventListener('stats-updated', handleUpdate);
        };
    }, []);

    const openWorkoutManager = () => window.dispatchEvent(new CustomEvent('open-workout-modal'));

    if (loading) return <div className="text-center py-20 text-slate-500">Carregando dashboard...</div>;

    return (
        <div className="max-w-3xl mx-auto pb-24 md:pb-8 space-y-6 md:space-y-12 px-4 py-4 md:py-8 w-full">

            {/* Header */}
            <div className="flex flex-col items-center justify-center text-center gap-6 py-8 relative w-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="space-y-2 relative z-10">
                    <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        Meus Treinos
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                        Sua evolução começa agora. <span className="text-primary font-bold">Supere-se.</span>
                    </p>
                </div>

                <button
                    onClick={openWorkoutManager}
                    className="group relative px-8 py-4 bg-[#0A0A0B] rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20 hover:shadow-primary/40 border border-white/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-20 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                    <div className="relative flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-primary/30">
                            <Plus className="text-white" size={20} />
                        </div>
                        <span className="font-black text-white tracking-wide uppercase text-sm">Gerenciar Treinos</span>
                    </div>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                <StatCard value={stats.workouts} label="Treinos/Semana" icon={<Activity size={16} />} delay={0} />
                <StatCard value={stats.minutes} label="Min Totais" icon={<Clock size={16} />} delay={100} />
                <StatCard value={stats.calories} label="Kcal Queimadas" color="text-orange-400" icon={<Flame size={16} />} delay={200} />

                <div className="bg-[#0A0A0B] p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-primary/30 transition-all shine-effect delay-300">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute top-0 right-0 p-2 opacity-20">
                        <Zap className="text-yellow-400" size={20} />
                    </div>
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 relative z-10 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                        {streak}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 relative z-10">Dias Streak</span>
                </div>
            </div>

            {/* Leaderboard */}
            <Leaderboard />

            {/* Workout Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Sua Rotina</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 gap-4 w-full">
                    {workouts.length > 0 ? (
                        workouts.map((workout, index) => (
                            <WorkoutCard
                                key={workout.id}
                                workout={workout}
                                index={index}
                                onClick={() => setSelectedWorkout(workout)}
                            />
                        ))
                    ) : (
                        <div className="py-12 px-6 rounded-3xl border border-dashed border-white/10 bg-[#0A0A0B] text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-600 mb-2">
                                <Plus size={32} />
                            </div>
                            <h3 className="text-white font-bold text-lg">Comece sua jornada</h3>
                            <p className="text-slate-500 max-w-sm">Você ainda não tem treinos criados. Use o botão acima para criar sua primeira rotina.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Weekly Progress & Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WeeklyProgressCard stats={stats} />
                <PerformanceChart percentage={performance} />
            </div>

            {/* Tip of the Day */}
            <TipCard tip={tip} />

            {/* Details Modal */}
            {selectedWorkout && (
                <WorkoutDetailsModal
                    workout={selectedWorkout}
                    onClose={() => {
                        setSelectedWorkout(null);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}

function StatCard({ value, label, color = "text-white", icon, delay }) {
    return (
        <div className={`bg-[#0A0A0B] p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-white/20 transition-all animate-in fade-in zoom-in duration-500`} style={{ animationDelay: `${delay}ms` }}>
            <div className="absolute top-3 right-3 text-slate-700 dark:text-white/10">
                {icon}
            </div>
            <span className={`text-3xl font-black ${color} tracking-tight`}>{value}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</span>
        </div>
    );
}

// Theme Colors Configuration
const themeColors = [
    {
        name: 'purple',
        border: 'border-purple-500/50',
        borderHover: 'group-hover:border-purple-500',
        iconBg: 'bg-purple-500/20 text-purple-400',
        iconBorder: 'border-purple-500/20',
        glow: 'bg-purple-500',
        text: 'group-hover:text-purple-400',
        shadow: 'shadow-purple-500/20',
        gradient: 'from-purple-500 to-indigo-600'
    },
    {
        name: 'red',
        border: 'border-red-500/50',
        borderHover: 'group-hover:border-red-500',
        iconBg: 'bg-red-500/20 text-red-400',
        iconBorder: 'border-red-500/20',
        glow: 'bg-red-500',
        text: 'group-hover:text-red-400',
        shadow: 'shadow-red-500/20',
        gradient: 'from-red-500 to-orange-600'
    },
    {
        name: 'yellow',
        border: 'border-yellow-500/50',
        borderHover: 'group-hover:border-yellow-500',
        iconBg: 'bg-yellow-500/20 text-yellow-400',
        iconBorder: 'border-yellow-500/20',
        glow: 'bg-yellow-500',
        text: 'group-hover:text-yellow-400',
        shadow: 'shadow-yellow-500/20',
        gradient: 'from-yellow-400 to-amber-600'
    },
    {
        name: 'orange',
        border: 'border-orange-500/50',
        borderHover: 'group-hover:border-orange-500',
        iconBg: 'bg-orange-500/20 text-orange-400',
        iconBorder: 'border-orange-500/20',
        glow: 'bg-orange-500',
        text: 'group-hover:text-orange-400',
        shadow: 'shadow-orange-500/20',
        gradient: 'from-orange-500 to-red-600'
    },
    {
        name: 'blue',
        border: 'border-blue-500/50',
        borderHover: 'group-hover:border-blue-500',
        iconBg: 'bg-blue-500/20 text-blue-400',
        iconBorder: 'border-blue-500/20',
        glow: 'bg-blue-500',
        text: 'group-hover:text-blue-400',
        shadow: 'shadow-blue-500/20',
        gradient: 'from-blue-500 to-cyan-600'
    },
    {
        name: 'pink',
        border: 'border-pink-500/50',
        borderHover: 'group-hover:border-pink-500',
        iconBg: 'bg-pink-500/20 text-pink-400',
        iconBorder: 'border-pink-500/20',
        glow: 'bg-pink-500',
        text: 'group-hover:text-pink-400',
        shadow: 'shadow-pink-500/20',
        gradient: 'from-pink-500 to-rose-600'
    },
    {
        name: 'cyan',
        border: 'border-cyan-500/50',
        borderHover: 'group-hover:border-cyan-500',
        iconBg: 'bg-cyan-500/20 text-cyan-400',
        iconBorder: 'border-cyan-500/20',
        glow: 'bg-cyan-500',
        text: 'group-hover:text-cyan-400',
        shadow: 'shadow-cyan-500/20',
        gradient: 'from-cyan-500 to-blue-600'
    }
];

function WorkoutCard({ workout, index, onClick }) {
    // Determine theme based on index provided
    const theme = themeColors[index % themeColors.length];

    const isCompleted = workout.status === 'completed';
    const isNext = workout.status === 'next';

    return (
        <div
            onClick={onClick}
            className={`group relative rounded-3xl p-4 md:p-6 border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 overflow-hidden 
                ${isCompleted ? 'bg-emerald-950/10 border-emerald-500/30' : 'bg-[#121214]'}
                ${isNext ? `ring-1 ring-${theme.name}-500/50 scale-[1.02] shadow-[0_0_30px_rgba(0,0,0,0.3)]` : 'hover:shadow-xl'}
                ${!isCompleted ? `${theme.border} ${theme.borderHover}` : 'hover:border-emerald-500/50'}
            `}
        >
            {/* Background Glow for "Next" or Generic Hover */}
            {isNext && (
                <div className={`absolute -top-20 -right-20 w-64 h-64 ${theme.glow} opacity-10 blur-[80px] rounded-full pointer-events-none animate-pulse`}></div>
            )}
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}></div>

            {/* Badges */}
            {isCompleted ? (
                <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <CheckCircle size={10} /> Concluído
                </div>
            ) : isNext ? (
                <div className={`absolute top-4 right-4 ${theme.glow} text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-${theme.name}-500/40 animate-pulse`}>
                    <Zap size={10} fill="currentColor" /> Próximo
                </div>
            ) : (
                <div className="absolute top-4 right-4 bg-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/5">
                    Pendente
                </div>
            )}

            <div className="flex items-center gap-4 md:gap-5 mb-6 relative z-10">
                {/* Icon Container */}
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-all duration-300 shadow-inner border border-white/5 
                    ${isCompleted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : `${theme.iconBg} ${theme.iconBorder}`}
                `}>
                    <span className={`${isNext ? 'animate-bounce-slow' : ''}`}>
                        {getIcon(emojiToIconMap[workout.icon] || workout.icon, { size: 28 })}
                    </span>
                </div>

                {/* Text Content */}
                <div>
                    <h3 className={`text-lg md:text-xl font-black text-white transition-colors uppercase tracking-wide drop-shadow-md ${!isCompleted ? theme.text : 'group-hover:text-emerald-400'}`}>
                        {workout.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 group-hover:text-slate-400 transition-colors">
                        {workout.description}
                    </p>
                </div>
            </div>

            {/* Footer / Stats */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4 group-hover:border-white/10 transition-colors">
                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-400 transition-colors">Exercícios</span>
                        <span className="text-sm font-black text-slate-200 font-mono">{workout.exercises?.length || 0}</span>
                    </div>
                    <div className="w-px h-8 bg-white/5 group-hover:bg-white/10 transition-colors"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-400 transition-colors">Duração</span>
                        <span className="text-sm font-black text-slate-200 font-mono">{workout.duration || '0m'}</span>
                    </div>
                </div>

                {/* Action Button */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isNext
                            ? `${theme.glow} text-white shadow-lg shadow-${theme.name}-500/30`
                            : `bg-white/5 text-slate-500 group-hover:${theme.glow} group-hover:text-white`
                    }
                `}>
                    {isCompleted ? <CheckCircle size={18} /> : <PlayCircle size={18} className="ml-0.5" />}
                </div>
            </div>
        </div>
    );
}

function WeeklyProgressCard({ stats }) {
    return (
        <div className="relative rounded-3xl overflow-hidden min-h-[200px] flex flex-col md:flex-row items-center bg-[#0A0A0B] border border-white/10 shadow-2xl group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-700 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0B]/80 to-[#0A0A0B]"></div>

            <div className="relative z-10 p-8 w-full">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-wider">Progresso<br /><span className="text-primary not-italic">Semanal</span></h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <TrendingUp className="text-primary" size={20} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <span className="text-4xl font-black text-white block leading-none">{stats.workouts}</span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-2 block">Treinos</span>
                    </div>
                    <div>
                        <span className="text-4xl font-black text-white block leading-none">{stats.minutes}</span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-2 block">Minutos</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PerformanceChart({ percentage }) {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-[#0A0A0B] rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-colors duration-500"></div>

            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                Performance (Mês)
            </h2>

            <div className="flex flex-col items-center justify-center relative">
                <div className="relative w-48 h-48">
                    {/* Background Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            className="text-white/5"
                            cx="96" cy="96"
                            fill="transparent"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="16"
                            strokeLinecap="round"
                        ></circle>
                        {/* Progress Circle (Glow) */}
                        <circle
                            className="text-primary/30 blur-md"
                            cx="96" cy="96"
                            fill="transparent"
                            r={radius}
                            stroke="currentColor"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            strokeWidth="16"
                        ></circle>
                        {/* Progress Circle (Main) */}
                        <circle
                            className="text-primary transition-all duration-1000 ease-out"
                            cx="96" cy="96"
                            fill="transparent"
                            r={radius}
                            stroke="currentColor"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            strokeWidth="16"
                        ></circle>
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                            {percentage}%
                        </span>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                            Foco
                        </span>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-500 mt-6 max-w-[200px]">
                    {percentage >= 80 ? "Nível Elite! Mantenha o ritmo." :
                        percentage >= 50 ? "Bom progresso. Continue assim!" :
                            "Aumente a frequência para evoluir."}
                </p>
            </div>
        </div>
    );
}

function TipCard({ tip }) {
    if (!tip) return null;

    return (
        <div className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/20">
            <div className="bg-[#0A0A0B] rounded-[22px] p-6 relative z-10 h-full">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20">
                        <span className="material-icons-round text-white font-bold">lightbulb</span>
                    </div>
                    <div>
                        <h4 className="font-black text-white text-sm uppercase tracking-wider mb-2">Dica do Pro</h4>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">"{tip}"</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
