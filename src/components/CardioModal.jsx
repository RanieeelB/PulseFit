import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, CheckCircle, PauseCircle, XCircle, Play, Flame, Route, Activity, Footprints, Timer, HeartPulse } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { workoutService } from '../services/workoutService';
import WorkoutSummaryModal from './WorkoutSummaryModal';

const cardioTypes = [
    { id: 'caminhada', name: 'Caminhada', icon: Footprints, color: 'emerald' },
    { id: 'corrida_esteira', name: 'Corrida na Esteira', icon: Activity, color: 'orange' },
    { id: 'corrida_rua', name: 'Corrida Rua', icon: Route, color: 'blue' },
    { id: 'eliptico', name: 'Elíptico', icon: HeartPulse, color: 'violet' },
    { id: 'bicicleta', name: 'Bicicleta', icon: Activity, color: 'cyan' },
    { id: 'escada', name: 'Escada', icon: Activity, color: 'rose' },
    { id: 'natacao', name: 'Natação', icon: Activity, color: 'sky' },
    { id: 'pular_corda', name: 'Pular Corda', icon: Activity, color: 'amber' },
    { id: 'hiit', name: 'HIIT', icon: Flame, color: 'red' },
];

const themeColors = {
    emerald: {
        solidGradient: 'from-emerald-600 to-teal-600',
        bg: 'bg-emerald-500/10 text-emerald-400',
        text: 'text-emerald-400',
        shadow: 'shadow-emerald-500/20 hover:shadow-emerald-500/40'
    },
    orange: {
        solidGradient: 'from-orange-500 to-amber-600',
        bg: 'bg-orange-500/10 text-orange-400',
        text: 'text-orange-400',
        shadow: 'shadow-orange-500/20 hover:shadow-orange-500/40'
    },
    blue: {
        solidGradient: 'from-blue-600 to-cyan-600',
        bg: 'bg-blue-500/10 text-blue-400',
        text: 'text-blue-400',
        shadow: 'shadow-blue-500/20 hover:shadow-blue-500/40'
    },
    violet: {
        solidGradient: 'from-violet-600 to-indigo-600',
        bg: 'bg-violet-500/10 text-violet-400',
        text: 'text-violet-400',
        shadow: 'shadow-violet-500/20 hover:shadow-violet-500/40'
    },
    cyan: {
        solidGradient: 'from-cyan-500 to-blue-500',
        bg: 'bg-cyan-500/10 text-cyan-400',
        text: 'text-cyan-400',
        shadow: 'shadow-cyan-500/20 hover:shadow-cyan-500/40'
    },
    rose: {
        solidGradient: 'from-rose-500 to-pink-600',
        bg: 'bg-rose-500/10 text-rose-400',
        text: 'text-rose-400',
        shadow: 'shadow-rose-500/20 hover:shadow-rose-500/40'
    },
    sky: {
        solidGradient: 'from-sky-500 to-blue-500',
        bg: 'bg-sky-500/10 text-sky-400',
        text: 'text-sky-400',
        shadow: 'shadow-sky-500/20 hover:shadow-sky-500/40'
    },
    amber: {
        solidGradient: 'from-amber-500 to-yellow-600',
        bg: 'bg-amber-500/10 text-amber-400',
        text: 'text-amber-400',
        shadow: 'shadow-amber-500/20 hover:shadow-amber-500/40'
    },
    red: {
        solidGradient: 'from-red-600 to-orange-600',
        bg: 'bg-red-500/10 text-red-400',
        text: 'text-red-400',
        shadow: 'shadow-red-500/20 hover:shadow-red-500/40'
    }
};

export default function CardioModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [active, setActive] = useState(false);
    const [paused, setPaused] = useState(false);
    const [timer, setTimer] = useState(0);
    const [accumulatedTime, setAccumulatedTime] = useState(0);
    const [summaryData, setSummaryData] = useState(null);
    const [isInputtingCalories, setIsInputtingCalories] = useState(false);
    const [manualCalories, setManualCalories] = useState('');
    const startTimeRef = useRef(null);

    const STORAGE_KEY = `active_cardio_session`;

    useEffect(() => {
        const open = () => setIsOpen(true);
        const close = () => setIsOpen(false);

        window.addEventListener('open-cardio-modal', open);
        return () => window.removeEventListener('open-cardio-modal', open);
    }, []);

    // Load persisted state
    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.active && parsed.type) {
                    const type = cardioTypes.find(c => c.id === parsed.type.id);
                    if (type) {
                        setSelectedType(type);
                        setActive(true);
                        setAccumulatedTime(parsed.accumulatedTime || 0);

                        if (parsed.paused) {
                            setPaused(true);
                            setTimer(parsed.accumulatedTime || 0);
                            startTimeRef.current = null;
                        } else if (parsed.startTime) {
                            setPaused(false);
                            startTimeRef.current = parsed.startTime;
                            const currentSegment = Math.floor((Date.now() - parsed.startTime) / 1000);
                            setTimer((parsed.accumulatedTime || 0) + currentSegment);
                        }
                    }
                }
            } catch (e) {
                console.error("Error parsing saved cardio state", e);
            }
        }
    }, [STORAGE_KEY]);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (active && !paused && startTimeRef.current) {
            const updateTimer = () => {
                const currentSegment = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setTimer(accumulatedTime + currentSegment);
            };

            updateTimer();
            interval = setInterval(updateTimer, 1000);
        }
        return () => clearInterval(interval);
    }, [active, paused, accumulatedTime, timer]);

    // Save State
    useEffect(() => {
        if (active && selectedType) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                active: true,
                type: selectedType,
                startTime: startTimeRef.current,
                accumulatedTime: accumulatedTime,
                paused: paused
            }));
        } else if (!active && !selectedType) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [active, paused, accumulatedTime, selectedType, STORAGE_KEY]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleStart = () => {
        const now = Date.now();
        startTimeRef.current = now;
        setActive(true);
        setPaused(false);
        setAccumulatedTime(0);
        try { Haptics.impact({ style: ImpactStyle.Heavy }); } catch (e) { }
    };

    const handlePause = () => {
        if (!startTimeRef.current) return;
        const now = Date.now();
        const currentSegment = Math.floor((now - startTimeRef.current) / 1000);
        const newAccumulated = accumulatedTime + currentSegment;
        setAccumulatedTime(newAccumulated);
        setTimer(newAccumulated);
        setPaused(true);
        startTimeRef.current = null;
        try { Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
    };

    const handleResume = () => {
        startTimeRef.current = Date.now();
        setPaused(false);
        try { Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
    };

    const handleCancel = () => {
        if (!window.__playwright) {
            if (!window.confirm('Tem certeza que deseja cancelar o cardio? Todo o progresso será perdido.')) return;
        }
        localStorage.removeItem(STORAGE_KEY);
        setActive(false);
        setPaused(false);
        setTimer(0);
        setAccumulatedTime(0);
        setSelectedType(null);
    };

    const handleEnd = () => {
        if (!window.__playwright) {
            if (!window.confirm('Finalizar cardio?')) return;
        }

        // Pause timer if running
        if (!paused && startTimeRef.current) {
            const now = Date.now();
            const currentSegment = Math.floor((now - startTimeRef.current) / 1000);
            setAccumulatedTime(accumulatedTime + currentSegment);
            setTimer(accumulatedTime + currentSegment);
        }
        setPaused(true);
        startTimeRef.current = null;

        setIsInputtingCalories(true);
    };

    const submitCardio = async () => {
        localStorage.removeItem(STORAGE_KEY);
        setActive(false);
        setIsInputtingCalories(false);

        const durationMin = Math.max(1, Math.ceil(timer / 60));
        const calories = Number(manualCalories) || 0;

        setSummaryData({
            duration: durationMin,
            calories: calories,
            prs: [],
            improvements: [],
            isLoading: true
        });

        try {
            const summary = await workoutService.addCardioLog(selectedType.name, durationMin, calories);
            if (summary) {
                setSummaryData(prev => ({ ...prev, ...summary, isLoading: false }));
            } else {
                setSummaryData(prev => ({ ...prev, isLoading: false }));
            }
        } catch (err) {
            console.error("Error logging cardio:", err);
            setSummaryData(prev => ({ ...prev, isLoading: false }));
        }
        setManualCalories('');
    };

    const onClose = () => {
        if (active) {
            alert('Você tem um cardio em andamento. Feche ou cancele para sair.');
            return;
        }
        setIsOpen(false);
        setSelectedType(null);
        setTimer(0);
        setAccumulatedTime(0);
        setPaused(false);
        setIsInputtingCalories(false);
        setManualCalories('');
    };

    if (!isOpen && !active && !summaryData) return null;

    if (summaryData) {
        return (
            <WorkoutSummaryModal
                summary={summaryData}
                onClose={() => {
                    setSummaryData(null);
                    setSelectedType(null);
                    setIsOpen(false);
                }}
                workoutTitle={`Cardio: ${selectedType?.name || ''}`}
            />
        );
    }

    const theme = selectedType ? themeColors[selectedType.color] : themeColors.blue;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 transition-opacity duration-300 ${isOpen || active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-[#0A0A0B] w-full max-w-lg h-[90vh] md:h-auto md:max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col border border-white/10 text-slate-200 transform transition-transform duration-300 ${isOpen || active ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* Ambient glow */}
                <div className={`absolute top-0 right-0 w-[400px] h-[400px] bg-${selectedType ? selectedType.color : 'blue'}-500/10 blur-[100px] rounded-full pointer-events-none transition-colors duration-1000`}></div>

                {/* Header */}
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02] relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${theme.solidGradient} rounded-xl flex items-center justify-center shadow-lg`}>
                            {selectedType ? <selectedType.icon className="text-white" size={20} /> : <Timer className="text-white" size={20} />}
                        </div>
                        <div>
                            <h2 className="text-base font-black text-white uppercase tracking-wider">
                                {selectedType ? selectedType.name : 'Selecionar Cardio'}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {active ? 'Em andamento' : 'Novo Treino'}
                            </p>
                        </div>
                    </div>
                    {!active && (
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                            <span className="material-icons-round text-lg">close</span>
                        </button>
                    )}
                </div>

                <div className="p-4 flex flex-col relative z-10 flex-1 overflow-y-auto custom-scrollbar">
                    {!selectedType ? (
                        <div className="grid grid-cols-3 gap-3">
                            {cardioTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type)}
                                    className={`flex flex-col items-center justify-center p-4 bg-white/[0.03] border border-white/5 hover:border-${type.color}-500/50 hover:bg-white/[0.06] rounded-2xl transition-all group`}
                                >
                                    <div className={`w-12 h-12 rounded-full ${themeColors[type.color].bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                        <type.icon size={24} />
                                    </div>
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider text-center leading-tight">
                                        {type.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">

                            {/* Timer Display or Calorie Input */}
                            <div className="relative flex items-center justify-center w-full">
                                <div className={`absolute inset-0 bg-${selectedType.color}-500/20 blur-[50px] rounded-full animate-pulse`} style={{ animationDuration: '3s' }}></div>
                                <div className={`w-64 h-64 rounded-full border border-white/10 flex items-center justify-center bg-[#121214] shadow-2xl relative z-10 ${active && !paused ? `ring-2 ring-${selectedType.color}-500/50` : ''}`}>
                                    {isInputtingCalories ? (
                                        <div className="flex flex-col items-center p-6 text-center w-full h-full justify-center space-y-4 animate-in fade-in zoom-in">
                                            <Flame size={40} className={`text-${selectedType.color}-500 mb-2 drop-shadow-[0_0_15px_rgba(var(--color-${selectedType.color}-500),0.8)]`} />
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quantas calorias?</h3>
                                            <div className="relative w-3/4">
                                                <input
                                                    type="number"
                                                    value={manualCalories}
                                                    onChange={(e) => setManualCalories(e.target.value)}
                                                    placeholder="0"
                                                    className="w-full bg-[#0A0A0B] border-b-2 border-white/10 px-4 py-3 text-3xl font-black text-center text-white focus:outline-none focus:border-white/30 rounded-lg no-spinners"
                                                    autoFocus
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 uppercase">kcal</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <span className={`text-6xl font-mono font-black tracking-tighter tabular-nums ${active ? `text-${selectedType.color}-400 drop-shadow-[0_0_15px_rgba(var(--color-${selectedType.color}-500),0.5)]` : 'text-slate-300'}`}>
                                                {formatTime(timer)}
                                            </span>
                                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-2">
                                                {active ? (paused ? 'Pausado' : 'Decorrido') : 'Pronto'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="w-full flex justify-center mt-8">
                                {isInputtingCalories ? (
                                    <button
                                        onClick={submitCardio}
                                        disabled={!manualCalories}
                                        className={`w-full py-4 bg-gradient-to-r ${theme.solidGradient} hover:scale-[1.02] text-white font-black rounded-2xl shadow-lg ${theme.shadow} flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wide disabled:opacity-50 disabled:hover:scale-100`}
                                    >
                                        <CheckCircle size={20} /> Salvar Treino
                                    </button>
                                ) : !active ? (
                                    <button onClick={handleStart} className={`w-full py-4 bg-gradient-to-r ${theme.solidGradient} hover:scale-[1.02] text-white font-black rounded-2xl shadow-lg ${theme.shadow} flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wide`}>
                                        <PlayCircle size={20} /> Iniciar Treino
                                    </button>
                                ) : (
                                    <div className="w-full grid grid-cols-4 gap-3">
                                        <button
                                            onClick={handleCancel}
                                            className="col-span-1 py-4 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 font-bold rounded-2xl border border-white/10 hover:border-red-500/50 flex items-center justify-center transition-all"
                                        >
                                            <XCircle size={24} />
                                        </button>

                                        {paused ? (
                                            <button
                                                onClick={handleResume}
                                                className="col-span-1 py-4 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 font-bold rounded-2xl border border-yellow-500/20 hover:border-yellow-500/50 flex items-center justify-center transition-all"
                                            >
                                                <Play size={24} className="fill-current" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handlePause}
                                                className="col-span-1 py-4 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 font-bold rounded-2xl border border-yellow-500/20 hover:border-yellow-500/50 flex items-center justify-center transition-all"
                                            >
                                                <PauseCircle size={24} />
                                            </button>
                                        )}

                                        <button
                                            onClick={handleEnd}
                                            className={`col-span-2 py-4 bg-gradient-to-r ${theme.solidGradient} hover:scale-[1.02] text-white font-black rounded-2xl shadow-lg ${theme.shadow} flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wide`}
                                        >
                                            <CheckCircle size={20} /> Finalizar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
