import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, Clock, CheckCircle, Dumbbell } from 'lucide-react';
import { workoutService } from '../services/workoutService';
import { getIcon, emojiToIconMap } from '../utils/iconMap';

export default function WorkoutDetailsModal({ workout, onClose }) {
    const [active, setActive] = useState(false);
    const [timer, setTimer] = useState(0);
    const [exercises, setExercises] = useState(workout.exercises || []);
    const startTimeRef = useRef(null);

    // Persistence Key
    const STORAGE_KEY = `active_workout_${workout.id}`;

    // Load state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.startTime) {
                    startTimeRef.current = parsed.startTime;
                    setExercises(parsed.exercises || workout.exercises || []);
                    setActive(true);

                    // Specific logic for recovering the timer immediately
                    const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
                    setTimer(elapsed > 0 ? elapsed : 0);
                }
            } catch (e) {
                console.error("Error parsing saved workout state", e);
            }
        }
    }, [workout.id, workout.exercises]);

    // Timer logic (Timestamp based)
    useEffect(() => {
        let interval;
        if (active && startTimeRef.current) {
            // Update immediately
            setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000));

            interval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setTimer(elapsed);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [active]);

    // Save state whenever exercises change (if active)
    useEffect(() => {
        if (active && startTimeRef.current) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                startTime: startTimeRef.current,
                exercises: exercises
            }));
        }
    }, [exercises, active, STORAGE_KEY]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleStart = () => {
        const now = Date.now();
        startTimeRef.current = now;
        setActive(true);

        // Save initial state
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            startTime: now,
            exercises: exercises
        }));
    };

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
                reps: 0 // We could calculate max reps too if needed
            };
        });

        // Clear local storage for this workout
        localStorage.removeItem(STORAGE_KEY);
        setActive(false);

        const durationMin = Math.ceil(timer / 60);
        // Estimate: 6 kcal per minute (moderate intensity weight lifting)
        const calories = durationMin * 6;

        await workoutService.toggleStatus(workout.id, durationMin, calories, exercisesPerformed);
        onClose();
    };

    // Controlled Inputs Handler
    const handleSetChange = (exerciseIndex, setIndex, field, value) => {
        if (!active) return; // Prevent editing if not active

        const newExercises = [...exercises];
        const newSets = [...newExercises[exerciseIndex].sets];

        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        newExercises[exerciseIndex] = { ...newExercises[exerciseIndex], sets: newSets };

        setExercises(newExercises);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-[#0A0A0B] w-full max-w-md rounded-3xl shadow-2xl shadow-primary/20 flex flex-col max-h-[85vh] overflow-hidden border border-white/10 relative">

                {/* Ambient Background */}
                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02] relative z-10 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-primary/20">
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
                            <div className="text-lg font-mono font-bold text-primary animate-pulse shadow-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                                {formatTime(timer)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Exercises List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar relative z-10">
                    {exercises.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                            <p className="text-slate-500 text-xs">Este treino não tem exercícios detalhados.</p>
                        </div>
                    ) : (
                        exercises.map((ex, i) => (
                            <div key={i} className="bg-[#121214] rounded-xl p-3 border border-white/5 hover:border-primary/30 transition-colors group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                                    <Dumbbell className="text-white" size={24} />
                                </div>

                                <h3 className="font-bold text-white text-sm mb-2.5 flex items-center gap-2">
                                    <span className="w-1 h-3 bg-primary rounded-full"></span>
                                    {ex.name}
                                </h3>

                                <div className="space-y-1.5">
                                    <div className="grid grid-cols-5 gap-1 text-[8px] font-black text-slate-500 uppercase text-center tracking-wider">
                                        <span>Set</span>
                                        <span>Kg</span>
                                        <span>Reps</span>
                                        <span className="col-span-2">Status</span>
                                    </div>
                                    {ex.sets?.map((set, j) => (
                                        <div key={j} className="grid grid-cols-5 gap-1 items-center">
                                            <div className="text-center font-bold text-slate-400 bg-white/5 py-1 rounded-md border border-white/5 text-[10px]">
                                                {j + 1}
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="-"
                                                value={set.weight || ''}
                                                onChange={(e) => handleSetChange(i, j, 'weight', e.target.value)}
                                                disabled={!active}
                                                className="text-center bg-black/30 border border-white/10 rounded-md py-1 text-[10px] text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-mono p-0 w-full"
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
                                                    <div className="w-6 h-6 bg-white/5 border border-white/10 rounded-md flex items-center justify-center text-transparent peer-checked:bg-primary peer-checked:text-white peer-checked:shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all">
                                                        <CheckCircle size={14} fill="currentColor" className="opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
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
                            <button onClick={handleStart} className="flex-[2] py-3 bg-gradient-to-r from-primary to-purple-600 hover:scale-[1.02] text-white font-black rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wide group">
                                <PlayCircle size={18} className="group-hover:animate-pulse" /> Iniciar
                            </button>
                        </>
                    ) : (
                        <button onClick={handleEnd} className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:scale-[1.02] text-white font-black rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wide group">
                            <Clock size={18} className="group-hover:spin-slow" /> Encerrar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
