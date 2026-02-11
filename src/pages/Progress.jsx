import React, { useState, useEffect, useRef } from 'react';
import { Flame, TrendingDown, TrendingUp, Plus, Calendar, Trophy, Activity, ArrowUp, ArrowDown, Edit2, Trash2, X } from 'lucide-react';
import { workoutService } from '../services/workoutService';
import { userService } from '../services/userService';

// Improved Chart with Bezier Curves and Interaction
const EnhancedLineChart = ({ data, color, onPointClick }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const containerRef = useRef(null);

    if (!data || data.length < 2) return null;

    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const padding = range * 0.2; // Increase padding for glow effects
    const domainMin = min - padding;
    const domainMax = max + padding;
    const domainRange = domainMax - domainMin || 1;

    // Helper to get coordinates
    const getCoord = (index, value) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - domainMin) / domainRange) * 100;
        return { x, y };
    };

    // Generate Path Data (Cubic Bezier for smoother curves)
    const generatePath = () => {
        if (data.length === 0) return "";

        let d = `M ${getCoord(0, values[0]).x} ${getCoord(0, values[0]).y}`;

        for (let i = 1; i < data.length; i++) {
            const p0 = getCoord(i - 1, values[i - 1]);
            const p1 = getCoord(i, values[i]);

            // Adjust smoothing factor based on distance
            const smoothing = 0.2;
            const dist = p1.x - p0.x;
            const cp1 = { x: p0.x + dist * smoothing, y: p0.y };
            const cp2 = { x: p1.x - dist * smoothing, y: p1.y };

            d += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p1.x} ${p1.y}`;
        }
        return d;
    };

    const pathData = generatePath();
    const areaPath = `${pathData} L 100 100 L 0 100 Z`;

    return (
        <div className="w-full h-full relative groupSelect-none" ref={containerRef}>
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    {/* Vibrant Gradient Fill */}
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                        <stop offset="50%" stopColor={color} stopOpacity="0.1" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>

                    {/* Neon Glow Filter */}
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Grid Background */}
                <g className="opacity-10">
                    {[0, 25, 50, 75, 100].map(y => (
                        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="white" strokeWidth="0.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                    ))}
                </g>

                {/* Area Fill */}
                <path d={areaPath} fill="url(#chartGradient)" className="transition-all duration-300" />

                {/* Main Line with Glow */}
                <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                    vectorEffect="non-scaling-stroke"
                    className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-300"
                />

                {/* Points */}
                {data.map((d, i) => {
                    const { x, y } = getCoord(i, d.value);
                    const isHovered = hoveredIndex === i;

                    return (
                        <g key={i}>
                            {/* Hit Area */}
                            <circle
                                cx={x}
                                cy={y}
                                r="8"
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => onPointClick(d)}
                            />

                            {/* Glowing Dot Effect */}
                            <circle
                                cx={x}
                                cy={y}
                                r={isHovered ? "4" : "3"}
                                fill={color}
                                className="pointer-events-none transition-all duration-300"
                                style={{
                                    filter: `drop-shadow(0 0 ${isHovered ? '10px' : '5px'} ${color})`
                                }}
                            />

                            {/* Inner Light Core (for extra pop) */}
                            <circle
                                cx={x}
                                cy={y}
                                r={isHovered ? "2" : "1"}
                                fill="white"
                                className="pointer-events-none transition-all duration-300 opacity-80"
                            />

                            {/* Vertical Line on Hover */}
                            {isHovered && (
                                <line
                                    x1={x} y1={y} x2={x} y2="100"
                                    stroke={color}
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                    className="opacity-50 pointer-events-none"
                                    vectorEffect="non-scaling-stroke"
                                />
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Futuristic Tooltip */}
            {hoveredIndex !== null && data[hoveredIndex] && (
                <div
                    className="absolute pointer-events-none z-20 flex flex-col items-center transition-all duration-75 ease-out"
                    style={{
                        left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
                        top: `${100 - ((data[hoveredIndex].value - domainMin) / domainRange) * 100}%`,
                        transform: 'translate(-50%, -100%) translateY(-15px)'
                    }}
                >
                    <div className="bg-[#0A0A0B]/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center gap-1 min-w-[100px]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {new Date(data[hoveredIndex].date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                {data[hoveredIndex].value}
                            </span>
                            <span className="text-xs font-bold text-primary">kg</span>
                        </div>
                    </div>
                    {/* Neon Triangle Arrow */}
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/10 translate-y-[-1px]"></div>
                </div>
            )}
        </div>
    );
};

export default function Progress() {
    const [stats, setStats] = useState({ streak: 0, performance: 0, maxStreak: 0 });
    const [frequency, setFrequency] = useState([]);
    const [freqPeriod, setFreqPeriod] = useState('week');
    const [weightHistory, setWeightHistory] = useState([]);
    const [prs, setPrs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Weight Modal State
    const [showWeightModal, setShowWeightModal] = useState(false);
    const [weightForm, setWeightForm] = useState({ id: null, weight: '', date: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadData();
    }, [freqPeriod]);

    const loadData = async () => {
        try {
            const [streakData, perfData, freqData, weightData, prData] = await Promise.all([
                workoutService.getStreak(),
                workoutService.getMonthlyPerformance(),
                workoutService.getFrequency(freqPeriod),
                userService.getWeightHistory('all'),
                workoutService.getPersonalRecords()
            ]);

            setStats({
                streak: streakData,
                performance: perfData,
                maxStreak: streakData
            });
            setFrequency(freqData);
            setWeightHistory(weightData.map(d => ({
                id: d.id,
                value: d.weight,
                date: d.date
            })));
            setPrs(prData);
        } catch (error) {
            console.error("Failed to load progress data", error);
        } finally {
            setLoading(false);
        }
    };

    const openAddWeight = () => {
        setWeightForm({ id: null, weight: '', date: new Date().toISOString().split('T')[0] });
        setIsEditing(false);
        setShowWeightModal(true);
    };

    const openEditWeight = (dataPoint) => {
        setWeightForm({
            id: dataPoint.id,
            weight: dataPoint.value,
            date: new Date(dataPoint.date).toISOString().split('T')[0]
        });
        setIsEditing(true);
        setShowWeightModal(true);
    };

    // History Modal State
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [exerciseHistory, setExerciseHistory] = useState([]);
    const [selectedMuscle, setSelectedMuscle] = useState('Todos');

    // Muscle Group Mapping (Simple manual map for now, ideally from DB)
    const muscleGroups = {
        'Peito': ['Supino', 'Crucifixo', 'Peitoral', 'Push Up', 'Flexão'],
        'Costas': ['Puxada', 'Remada', 'Pull Down', 'Barra Fixa', 'Levantamento Terra'],
        'Pernas': ['Agachamento', 'Leg Press', 'Extensora', 'Flexora', 'Panturrilha', 'Stiff', 'Afundo'],
        'Ombros': ['Desenvolvimento', 'Elevação', 'Face Pull', 'Militar'],
        'Braços': ['Rosca', 'Tríceps', 'Mergulho', 'Martelo'],
        'Abdômen': ['Abdominal', 'Prancha', 'Infra', 'Obliquo']
    };

    const getMuscleGroup = (name) => {
        const lowerName = name.toLowerCase();
        for (const [group, keywords] of Object.entries(muscleGroups)) {
            if (keywords.some(k => lowerName.includes(k.toLowerCase()))) return group;
        }
        return 'Outros';
    };

    const filteredPrs = selectedMuscle === 'Todos'
        ? prs
        : prs.filter(pr => getMuscleGroup(pr.exercise_name) === selectedMuscle);

    const openExerciseHistory = async (pr) => {
        setSelectedExercise(pr);
        setShowHistoryModal(true);
        setExerciseHistory([]); // Reset while loading
        try {
            const history = await workoutService.getExerciseHistory(pr.exercise_name);
            setExerciseHistory(history.map(h => ({
                value: h.weight,
                date: h.date,
                reps: h.reps || 0
            })));
        } catch (error) {
            console.error("Failed to load history", error);
        }
    };

    const handleSaveWeight = async () => {
        if (!weightForm.weight) return;
        try {
            if (isEditing) {
                await userService.updateWeightEntry(weightForm.id, weightForm.weight, weightForm.date);
            } else {
                await userService.addWeightEntry(weightForm.weight);
            }
            setShowWeightModal(false);
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteWeight = async () => {
        if (!isEditing || !weightForm.id) return;
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;

        try {
            await userService.deleteWeightEntry(weightForm.id);
            setShowWeightModal(false);
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    // Calculate weight change
    const getWeightChange = () => {
        if (weightHistory.length < 2) return { value: 0, direction: 'neutral' };
        const current = weightHistory[weightHistory.length - 1].value;
        const initial = weightHistory[0].value;
        const diff = current - initial;
        return {
            value: Math.abs(diff).toFixed(1),
            direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral'
        };
    };

    const weightChange = getWeightChange();

    if (loading) return <div className="text-center py-20 text-slate-500">Carregando progresso...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-24 space-y-8 px-4 w-full">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Streak Card */}
                <div className="bg-[#0A0A0B] rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Flame className="text-orange-500" size={24} />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Sequência</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white">{stats.streak}</span>
                            <span className="text-sm font-bold text-slate-500 uppercase">Dias</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-bold">Recorde Pessoal</span>
                            <span className="text-sm font-black text-orange-400">{stats.maxStreak} Dias</span>
                        </div>
                    </div>
                </div>

                {/* Performance Card */}
                <div className="bg-[#0A0A0B] rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="text-primary" size={24} />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Performance</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white">{stats.performance}%</span>
                            <span className="text-sm font-bold text-slate-500 uppercase">Mensal</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: `${stats.performance}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weight Summary (Mini) */}
                <div className="bg-[#0A0A0B] rounded-3xl p-6 border border-white/5 relative overflow-hidden group flex flex-col justify-between">
                    <button
                        onClick={openAddWeight}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-primary hover:text-white flex items-center justify-center transition-all text-slate-400"
                    >
                        <Plus size={16} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="text-emerald-500" size={24} />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Peso Atual</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white">
                                {weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].value : '--'}
                            </span>
                            <span className="text-sm font-bold text-slate-500">kg</span>
                        </div>
                    </div>
                    {weightHistory.length > 1 && (
                        <div className={`mt-2 flex items-center gap-2 text-sm font-bold ${weightChange.direction === 'down' ? 'text-emerald-400' : weightChange.direction === 'up' ? 'text-red-400' : 'text-slate-500'}`}>
                            {weightChange.direction === 'down' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                            {weightChange.value}kg no período
                        </div>
                    )}
                </div>
            </div>

            {/* Frequency Chart */}
            <div className="bg-[#0A0A0B] rounded-3xl p-8 border border-white/5 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                        <Calendar className="text-primary" size={24} />
                        Frequência de Treinos
                    </h2>
                    <div className="flex bg-white/5 p-1 rounded-xl">
                        {['week', 'month', 'year'].map(p => (
                            <button
                                key={p}
                                onClick={() => setFreqPeriod(p)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${freqPeriod === p ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {p === 'week' ? 'Semanal' : p === 'month' ? 'Mensal' : 'Anual'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                        {[0, 1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-white"></div>)}
                    </div>

                    {frequency.map((item, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            <div className="w-full max-w-[40px] bg-white/5 rounded-t-lg relative flex items-end transition-all hover:bg-white/10 overflow-hidden" style={{ height: '100%' }}>
                                <div
                                    className="w-full bg-gradient-to-t from-primary/80 to-purple-500/80 hover:from-primary hover:to-purple-500 transition-all duration-500 rounded-t-lg relative"
                                    style={{ height: `${Math.min(100, (item.count / (freqPeriod === 'year' ? 15 : 7)) * 100)}%` }} // Approximate scaling
                                >
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        {item.count} Treinos
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase mt-3">{item.label}</span>
                        </div>
                    ))}
                    {frequency.length === 0 && <div className="w-full text-center text-slate-500 text-sm">Sem dados para este período.</div>}
                </div>
            </div>

            {/* Weight Chart & Tracker */}
            <div className="bg-[#0A0A0B] rounded-3xl p-8 border border-white/5 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                        <TrendingUp className="text-emerald-500" size={24} />
                        Evolução de Peso
                    </h2>
                    <button
                        onClick={openAddWeight}
                        className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 border border-white/10"
                    >
                        <Plus size={14} /> Registrar Peso
                    </button>
                </div>

                <div className="h-80 w-full bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl border border-white/5 p-4 relative">
                    {weightHistory.length > 1 ? (
                        <EnhancedLineChart data={weightHistory} color="#10b981" onPointClick={openEditWeight} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm flex-col gap-2">
                            <TrendingUp size={32} className="opacity-20" />
                            Adicione pelo menos 2 entradas para ver o gráfico.
                        </div>
                    )}
                </div>
                <p className="text-center text-xs text-slate-600 mt-4">Clique nos pontos para editar ou excluir.</p>
            </div>

            {/* Personal Records */}
            <div className="bg-[#0A0A0B] rounded-3xl p-8 border border-white/5 shadow-xl relative overflow-hidden text-left">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-3">
                        <Trophy className="text-yellow-500" size={24} />
                        <h2 className="text-xl font-black text-white">Recordes Pessoais (PRs)</h2>
                    </div>
                    {/* Muscle Group Filters */}
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={() => setSelectedMuscle('Todos')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${selectedMuscle === 'Todos' ? 'bg-primary text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                        >
                            Todos
                        </button>
                        {Object.keys(muscleGroups).map(group => (
                            <button
                                key={group}
                                onClick={() => setSelectedMuscle(group)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${selectedMuscle === group ? 'bg-primary text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                            >
                                {group}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredPrs.length > 0 ? (
                        filteredPrs.map(pr => (
                            <button
                                key={pr.id}
                                onClick={() => openExerciseHistory(pr)}
                                className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-yellow-500/30 transition-all group text-left relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 truncate">{pr.exercise_name}</h3>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-black text-white group-hover:text-yellow-400 transition-colors">{pr.weight}</span>
                                    <span className="text-xs font-bold text-slate-500 mb-1.5">kg</span>
                                </div>
                                <div className="text-[10px] text-slate-600 font-mono mt-2 flex justify-between">
                                    <span>{new Date(pr.date).toLocaleDateString()}</span>
                                    {pr.reps && <span>{pr.reps} reps</span>}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center text-slate-500">
                            Nenhum recorde encontrado para este filtro.
                        </div>
                    )}
                </div>
            </div>

            {/* Exercise History Modal */}
            {showHistoryModal && selectedExercise && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-[#0A0A0B] w-full max-w-2xl rounded-[2rem] border border-white/10 p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex justify-between items-center mb-8 relative z-10 shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-white">{selectedExercise.exercise_name}</h3>
                                <p className="text-slate-500 text-sm font-medium">Evolução de carga (últimos treinos)</p>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors"><X size={24} /></button>
                        </div>

                        <div className="relative z-10 grow overflow-y-auto">
                            {/* Graph Area */}
                            <div className="h-64 w-full bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl border border-white/5 p-4 relative mb-6">
                                {exerciseHistory.length > 1 ? (
                                    <EnhancedLineChart data={exerciseHistory} color="#facc15" onPointClick={() => { }} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-500 text-sm flex-col gap-2 text-center px-4">
                                        <Activity size={32} className="opacity-20" />
                                        <p>Dados insuficientes para o gráfico.</p>
                                        <p className="text-xs opacity-60">Realize mais treinos com este exercício para ver sua evolução.</p>
                                    </div>
                                )}
                            </div>

                            {/* List of History */}
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Histórico Recente</h4>
                            <div className="space-y-2">
                                {exerciseHistory.length > 0 ? (
                                    [...exerciseHistory].reverse().map((entry, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                                            <span className="text-slate-400 text-xs font-mono">{new Date(entry.date).toLocaleDateString()}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-bold text-slate-500">{entry.reps} reps</span>
                                                <span className="text-white font-black">{entry.value} <span className="text-xs text-primary">kg</span></span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-slate-500 py-4">Carregando histórico...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Add Weight Modal */}
            {showWeightModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-[#0A0A0B] w-full max-w-sm rounded-[2rem] border border-white/10 p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-xl font-black text-white">{isEditing ? 'Editar Peso' : 'Registrar Peso'}</h3>
                            <button onClick={() => setShowWeightModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Data</label>
                                <input
                                    type="date"
                                    value={weightForm.date}
                                    onChange={e => setWeightForm({ ...weightForm, date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Peso (kg)</label>
                                <input
                                    type="number"
                                    value={weightForm.weight}
                                    onChange={e => setWeightForm({ ...weightForm, weight: e.target.value })}
                                    placeholder="Ex: 75.5"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                {isEditing && (
                                    <button
                                        onClick={handleDeleteWeight}
                                        className="px-4 py-3 rounded-xl font-bold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all flex items-center justify-center"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={handleSaveWeight}
                                    className="flex-1 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isEditing ? <Edit2 size={16} /> : <Plus size={16} />}
                                    {isEditing ? 'Atualizar' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
