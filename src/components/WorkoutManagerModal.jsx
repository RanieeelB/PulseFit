import React, { useState, useEffect, useRef } from 'react';
import { workoutService } from '../services/workoutService';
import WorkoutBuilder from './WorkoutBuilder';
import { Dumbbell, Trash2 } from 'lucide-react';
import { getIcon, emojiToIconMap } from '../utils/iconMap';

export default function WorkoutManagerModal() {
    const dialogRef = useRef(null);
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('list'); // 'list' | 'create'
    const [editingWorkout, setEditingWorkout] = useState(null);

    const loadWorkouts = async () => {
        setLoading(true);
        try {
            const data = await workoutService.getAll();
            setWorkouts(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const open = () => {
            loadWorkouts();
            setView('list');
            dialogRef.current?.showModal();
        };
        const close = () => dialogRef.current?.close();

        window.addEventListener('open-workout-modal', open);
        return () => window.removeEventListener('open-workout-modal', open);
    }, []);

    const handleSaveWorkout = async (workoutData) => {
        try {
            if (editingWorkout) {
                await workoutService.updateWorkout(editingWorkout.id, workoutData);
            } else {
                await workoutService.createWorkout(workoutData);
            }
            await loadWorkouts();
            setView('list');
            setEditingWorkout(null);
            window.dispatchEvent(new CustomEvent('workout-updated'));
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar treino');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Tem certeza que deseja excluir este treino?')) {
            await workoutService.deleteWorkout(id);
            await loadWorkouts();
            window.dispatchEvent(new CustomEvent('workout-updated'));
        }
    };

    return (
        <dialog ref={dialogRef} className="m-auto bg-transparent p-0 backdrop:bg-black/80 backdrop-blur-xl open:animate-in open:fade-in open:zoom-in-95 backdrop:animate-in backdrop:fade-in w-[95%] md:w-[80%] max-w-2xl h-[85vh] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 ring-1 ring-white/10">
            <div className="bg-[#0A0A0B] border border-white/10 w-full h-full flex flex-col relative overflow-hidden text-slate-200">
                {/* Background ambient glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="px-4 py-3 md:px-5 md:py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0 relative z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-gradient-to-br from-primary to-purple-600 rounded-lg shadow-lg shadow-primary/20">
                            <Dumbbell className="text-white" size={18} />
                        </div>
                        <h3 className="text-base md:text-lg font-black text-white uppercase tracking-wide">Gerenciador</h3>
                    </div>
                    <button onClick={() => dialogRef.current?.close()} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                        <span className="material-icons-round text-lg">close</span>
                    </button>
                </div>

                <div className="p-3 md:p-5 flex-1 overflow-hidden flex flex-col relative z-10">
                    {view === 'list' ? (
                        <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
                            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-5 rounded-2xl border border-primary/20 text-center mb-5 relative overflow-hidden group shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <h4 className="font-bold text-white text-xl mb-1 relative z-10">Criar Novo Plano</h4>
                                <p className="text-slate-400 mb-4 text-sm max-w-lg mx-auto relative z-10">Personalize sua rotina com nossa biblioteca.</p>
                                <button onClick={() => { setEditingWorkout(null); setView('create'); }} className="relative z-10 bg-white text-black hover:bg-slate-200 rounded-xl px-6 py-3 font-black tracking-wide shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm">
                                    + MONTAR TREINO
                                </button>
                            </div>

                            <div className="flex items-center justify-between mb-3 shrink-0">
                                <h4 className="font-bold text-white text-xs uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    Seus Treinos
                                </h4>
                                <span className="text-[10px] font-mono text-slate-500">{workouts.length} PLANOS</span>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
                                {loading ? (
                                    <p className="text-center p-10 text-slate-500 animate-pulse text-sm">Sincronizando...</p>
                                ) : workouts.length === 0 ? (
                                    <div className="text-center py-16 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                                        <p className="text-slate-500 text-sm">Nenhum treino encontrado.</p>
                                    </div>
                                ) : (
                                    workouts.map(w => (
                                        <div key={w.id} className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/5 hover:border-primary/50 hover:bg-white/[0.05] transition-all group">
                                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setEditingWorkout(w); setView('create'); }}>
                                                <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform">
                                                    {getIcon(emojiToIconMap[w.icon] || w.icon, { size: 24, className: "text-white" })}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-base text-white group-hover:text-primary transition-colors">{w.title}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-wider">{w.exercises?.length || 0} EXERCÍCIOS</span>
                                                        <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-wider">{w.duration || '0m'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-100 md:opacity-60 md:group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); setEditingWorkout(w); setView('create'); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all border border-transparent hover:border-primary/20" title="Editar">
                                                    <span className="material-icons-round text-lg">edit</span>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(w.id); }} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all border border-transparent hover:border-red-400/20" title="Excluir">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <WorkoutBuilder
                            onSave={handleSaveWorkout}
                            onCancel={() => { setView('list'); setEditingWorkout(null); }}
                            initialData={editingWorkout}
                        />
                    )}
                </div>
            </div>
        </dialog>
    );
}
