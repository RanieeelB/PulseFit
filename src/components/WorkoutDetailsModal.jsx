import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, Clock, CheckCircle, Dumbbell, PauseCircle, XCircle, Play, Check } from 'lucide-react';
import { workoutService } from '../services/workoutService';
import { getIcon, emojiToIconMap } from '../utils/iconMap';
import WorkoutSummaryModal from './WorkoutSummaryModal';
import WeeklyCompletedModal from './WeeklyCompletedModal';

export default function WorkoutDetailsModal({ workout, onClose, theme }) {
    const activeTheme = theme || {
        name: 'violet',
        solidGradient: 'from-violet-600 to-indigo-600',
        modal: {
            hoverBorder: 'hover:border-violet-500/30',
            buttonShadow: 'shadow-violet-500/25 hover:shadow-violet-500/40',
            checkbox: 'peer-checked:bg-violet-500 peer-checked:shadow-violet-500/50'
        }
    };
    const [active, setActive] = useState(false);
    const [paused, setPaused] = useState(false);
    const [timer, setTimer] = useState(0);
    const [accumulatedTime, setAccumulatedTime] = useState(0);
    const [exercises, setExercises] = useState(workout.exercises || []);
    const [lastWeights, setLastWeights] = useState({});
    const startTimeRef = useRef(null);

    // Persistence Key
    const STORAGE_KEY = `active_workout_${workout.id}`;

    useEffect(() => {
        // Fetch last weights
        const loadLastWeights = async () => {
            const names = workout.exercises?.map(e => e.name) || [];
            if (names.length > 0) {
                const weights = await workoutService.getLastWeights(names);
                setLastWeights(weights);
            }
        };
        loadLastWeights();
    }, [workout.exercises]);

    // Create a separate effect for localStorage to avoid dependency cycles
    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.active) {
                    setActive(true);
                    setExercises(parsed.exercises || workout.exercises || []);
                    setAccumulatedTime(parsed.accumulatedTime || 0);

                    if (parsed.paused) {
                        setPaused(true);
                        setTimer(parsed.accumulatedTime || 0);
                        startTimeRef.current = null;
                    } else if (parsed.startTime) {
                        setPaused(false);
                        startTimeRef.current = parsed.startTime;
                        // Calculate elapsed time correctly
                        const currentSegment = Math.floor((Date.now() - parsed.startTime) / 1000);
                        setTimer((parsed.accumulatedTime || 0) + currentSegment);
                    }
                }
            } catch (e) {
                console.error("Error parsing saved workout state", e);
            }
        }
    }, [workout.id, STORAGE_KEY]); // Removed workout.exercises from dependency to prevent loop

    // Timer logic (Timestamp based)
    useEffect(() => {
        let interval;
        if (active && !paused && startTimeRef.current) {
            // Update immediately
            const updateTimer = () => {
                const currentSegment = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setTimer(accumulatedTime + currentSegment);
            };

            updateTimer();
            interval = setInterval(updateTimer, 1000);
        }
        return () => clearInterval(interval);
    }, [active, paused, accumulatedTime]);

    // Save state whenever relevant data changes
    useEffect(() => {
        if (active) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                active: true,
                startTime: startTimeRef.current,
                accumulatedTime: accumulatedTime,
                paused: paused,
                exercises: exercises
            }));
        }
    }, [exercises, active, paused, accumulatedTime, STORAGE_KEY]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleStart = () => {
        const now = Date.now();
        startTimeRef.current = now;
        setActive(true);
        setPaused(false);
        setAccumulatedTime(0);
    };

    const handlePause = () => {
        if (!startTimeRef.current) return;

        const now = Date.now();
        const currentSegment = Math.floor((now - startTimeRef.current) / 1000);
        const newAccumulated = accumulatedTime + currentSegment;

        setAccumulatedTime(newAccumulated);
        setTimer(newAccumulated); // Fix timer display to show exact paused time
        setPaused(true);
        startTimeRef.current = null;
    };

    const handleResume = () => {
        startTimeRef.current = Date.now();
        setPaused(false);
    };

    const handleCancel = () => {
        if (!confirm('Tem certeza que deseja cancelar o treino? Todo o progresso será perdido.')) return;

        localStorage.removeItem(STORAGE_KEY);
        setActive(false);
        setPaused(false);
        setTimer(0);
        setAccumulatedTime(0);
        setExercises(workout.exercises || []); // Reset exercises
        onClose();
    };

    const [summaryData, setSummaryData] = useState(null);

    const handleEnd = async () => {
        if (!confirm('Finalizar treino?')) return;

        // Calculate max weights for PRs
        const exercisesPerformed = exercises.map(ex => {
            let maxWeight = 0;
            // Check sets for max weight
            if (ex.sets) {
                ex.sets.forEach(set => {
                    const weight = parseFloat(set.weight || 0);
                    if (weight > maxWeight) maxWeight = weight;
                });
            }
            return {
                name: ex.name,
                weight: maxWeight,
                reps: 0,
                sets: ex.sets || [] // Pass full sets data
            };
        });

        // Clear local storage for this workout
        localStorage.removeItem(STORAGE_KEY);
        setActive(false);

        const durationMin = Math.ceil(timer / 60);
        // Estimate: 6 kcal per minute (moderate intensity weight lifting)
        const calories = durationMin * 6;

        // Optimistic UI: Show summary immediately
        setSummaryData({
            duration: durationMin,
            calories: calories,
            prs: [],
            improvements: [],
            isLoading: true
        });

        // Process in background
        workoutService.finishWorkout(workout.id, durationMin, calories, exercisesPerformed)
            .then(summary => {
                setSummaryData(prev => ({ ...summary, isLoading: false }));
            })
            .catch(err => {
                console.error("Error finishing workout:", err);
                // Keep the basic summary but remove loading state
                setSummaryData(prev => ({ ...prev, isLoading: false }));
            });
    };

    // Controlled Inputs Handler
    const handleSetChange = (exerciseIndex, setIndex, field, value) => {
        if (!active) return; // Prevent editing if not active

        const newExercises = [...exercises];
        const newSets = [...newExercises[exerciseIndex].sets];

        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        newExercises[exerciseIndex] = { ...newExercises[exerciseIndex], sets: newSets };

        if (field === 'completed' && value === true) {
            if (navigator.vibrate) navigator.vibrate(50);
        }

        setExercises(newExercises);
    };

    const [showCelebration, setShowCelebration] = useState(false);

    if (showCelebration && summaryData?.cycleCompleted) {
        return (
            <WeeklyCompletedModal
                stats={summaryData.weeklyStats}
                onClose={() => {
                    onClose();
                    window.location.reload(); // Refresh to show reset state cleanly
                }}
            />
        );
    }

    if (summaryData) {
        return (
            <WorkoutSummaryModal
                summary={summaryData}
                onClose={() => {
                    if (summaryData.cycleCompleted) {
                        setShowCelebration(true);
                    } else {
                        onClose();
                    }
                }}
                workoutTitle={workout.title}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
            <div className={`bg-[#0A0A0B] w-full max-w-md rounded-3xl shadow-2xl shadow-${activeTheme.name}-500/20 flex flex-col max-h-[85vh] overflow-hidden border border-white/10 relative`}>

                {/* Ambient Background */}
                <div className={`absolute top-0 right-0 w-[150px] h-[150px] bg-${activeTheme.name}-500/20 blur-[80px] rounded-full pointer-events-none`}></div>
                <div className={`absolute bottom-0 left-0 w-[150px] h-[150px] bg-${activeTheme.name}-500/10 blur-[80px] rounded-full pointer-events-none`}></div>

                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02] relative z-10 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${activeTheme.solidGradient} rounded-xl flex items-center justify-center text-xl shadow-lg shadow-${activeTheme.name}-500/20`}>
                            {getIcon(emojiToIconMap[workout.icon] || workout.icon, { size: 20, className: "text-white" })}
                        </div>
                        <div>
                            <h2 className="text-base font-black text-white uppercase tracking-wider line-clamp-1">
                                {workout.title}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{workout.exercises?.length || 0} Exercícios</p>
                        </div>
                    </div>
                    {active && (
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tempo</span>
                            <div className={`text-lg font-mono font-bold text-${activeTheme.name}-400 animate-pulse shadow-${activeTheme.name}-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]`}>
                                {formatTime(timer)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Exercises List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar relative z-10">
                    {exercises.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                            <p className="text-slate-500 text-xs">Este treino não tem exercícios detalhados.</p>
                        </div>
                    ) : (
                        Object.entries(
                            exercises.reduce((acc, ex, i) => {
                                const group = ex.muscle_group || 'Outros';
                                if (!acc[group]) acc[group] = [];
                                acc[group].push({ ...ex, originalIndex: i });
                                return acc;
                            }, {})
                        ).map(([group, groupExercises]) => (
                            <div key={group} className="space-y-2">
                                <h3 className={`text-xs font-black text-${activeTheme.name}-400 uppercase tracking-widest pl-1 flex items-center gap-2`}>
                                    <span className={`w-1.5 h-1.5 bg-${activeTheme.name}-500 rounded-full`}></span>
                                    {group}
                                    <span className="text-[10px] text-slate-500 font-bold ml-auto">{groupExercises.length} EXERCÍCIOS</span>
                                </h3>
                                <div className="space-y-3">
                                    {groupExercises.map((ex) => {
                                        const i = ex.originalIndex;
                                        return (
                                            <div key={i} className={`bg-[#121214] rounded-xl p-3 border border-white/5 ${activeTheme.modal?.hoverBorder || `hover:border-${activeTheme.name}-500/30`} transition-colors group relative overflow-hidden`}>
                                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                                                    <Dumbbell className="text-white" size={24} />
                                                </div>

                                                <h3 className="font-bold text-white text-sm mb-2.5 flex items-center gap-2">
                                                    {ex.name}
                                                </h3>

                                                <div className="space-y-1.5">
                                                    <div className="grid grid-cols-6 gap-2 text-[8px] font-black text-slate-500 uppercase text-center tracking-wider">
                                                        <span>Set</span>
                                                        <span>Último</span>
                                                        <span>Kg</span>
                                                        <span>Reps</span>
                                                        <span className="col-span-2">Status</span>
                                                    </div>
                                                    {ex.sets?.map((set, j) => (
                                                        <div key={j} className="grid grid-cols-6 gap-2 items-center">
                                                            <div className="text-center font-bold text-slate-400 bg-white/5 py-1 rounded-md border border-white/5 text-[10px]">
                                                                {j + 1}
                                                            </div>
                                                            <div className="text-center font-bold text-slate-500 py-1 text-[10px] flex items-center justify-center gap-0.5">
                                                                {lastWeights[ex.name]?.sets && lastWeights[ex.name].sets[j] ? (
                                                                    <>
                                                                        <span>{lastWeights[ex.name].sets[j].weight || '-'}</span>
                                                                        <span className="text-[8px] opacity-70">kg</span>
                                                                    </>
                                                                ) : (
                                                                    <span>{lastWeights[ex.name]?.weight || '-'}</span>
                                                                )}
                                                            </div>
                                                            <input
                                                                type="number"
                                                                placeholder="-"
                                                                value={set.weight || ''}
                                                                onChange={(e) => handleSetChange(i, j, 'weight', e.target.value)}
                                                                disabled={!active}
                                                                className={`text-center bg-black/30 border border-white/10 rounded-md py-1 text-[10px] text-white focus:border-${activeTheme.name}-500 focus:ring-1 focus:ring-${activeTheme.name}-500 focus:outline-none transition-all font-mono p-0 w-full`}
                                                            />
                                                            <div className="text-center bg-white/5 py-1 rounded-md border border-white/5 text-[10px] text-slate-300 font-mono truncate px-0.5">
                                                                {set.reps}
                                                            </div>
                                                            <div className="col-span-2 flex justify-center">
                                                                <label className="cursor-pointer relative flex items-center justify-center w-full">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={set.completed || false}
                                                                        onChange={(e) => handleSetChange(i, j, 'completed', e.target.checked)}
                                                                        disabled={!active}
                                                                        className="peer sr-only"
                                                                    />
                                                                    <div className={`w-6 h-6 bg-white/5 border border-white/10 rounded-md flex items-center justify-center text-transparent ${activeTheme.modal?.checkbox || `peer-checked:bg-${activeTheme.name}-500 peer-checked:shadow-${activeTheme.name}-500/50`} transition-all transform peer-checked:scale-110 active:scale-95 [&_svg]:opacity-0 peer-checked:[&_svg]:opacity-100`}>
                                                                        <Check size={16} strokeWidth={4} className="text-white transition-opacity duration-300" />
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 bg-[#0A0A0B]/90 backdrop-blur-lg flex gap-3 relative z-20 shrink-0">
                    {!active ? (
                        <>
                            <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl transition-colors text-xs uppercase tracking-wide border border-white/5">
                                Fechar
                            </button>
                            <button onClick={handleStart} className={`flex-[2] py-3 bg-gradient-to-r ${activeTheme.solidGradient} hover:scale-[1.02] text-white font-black rounded-xl shadow-lg ${activeTheme.modal?.buttonShadow || `shadow-${activeTheme.name}-500/25`} flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wide group`}>
                                <PlayCircle size={18} className="group-hover:animate-pulse" /> Iniciar
                            </button>
                        </>
                    ) : (
                        <div className="w-full grid grid-cols-4 gap-2">
                            {/* Cancel Button */}
                            <button
                                onClick={handleCancel}
                                className="col-span-1 py-3 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 font-bold rounded-xl border border-white/10 hover:border-red-500/50 flex items-center justify-center gap-2 transition-all group"
                                title="Cancelar Treino"
                            >
                                <XCircle size={20} className="group-hover:scale-110 transition-transform" />
                            </button>

                            {/* Pause/Resume Button */}
                            {paused ? (
                                <button
                                    onClick={handleResume}
                                    className="col-span-1 py-3 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 font-bold rounded-xl border border-yellow-500/20 hover:border-yellow-500/50 flex items-center justify-center gap-2 transition-all group"
                                    title="Retomar"
                                >
                                    <Play size={20} className="fill-current" />
                                </button>
                            ) : (
                                <button
                                    onClick={handlePause}
                                    className="col-span-1 py-3 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 font-bold rounded-xl border border-yellow-500/20 hover:border-yellow-500/50 flex items-center justify-center gap-2 transition-all group"
                                    title="Pausar"
                                >
                                    <PauseCircle size={20} />
                                </button>
                            )}

                            {/* Finish Button */}
                            <button
                                onClick={handleEnd}
                                className="col-span-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-[1.02] text-white font-black rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wide group"
                            >
                                <CheckCircle size={18} className="group-hover:scale-110 transition-transform" /> Finalizar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
