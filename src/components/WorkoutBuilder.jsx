import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Plus, Search, Trash2, Save, Dumbbell } from 'lucide-react';

export default function WorkoutBuilder({ onSave, onCancel }) {
    const [step, setStep] = useState(1); // 1: Details, 2: Add Exercises
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('💪');

    const [catalog, setCatalog] = useState([]);
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [search, setSearch] = useState('');
    const [muscleFilter, setMuscleFilter] = useState('Todos');

    // Mobile Tab State
    const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'workout'

    useEffect(() => {
        loadCatalog();
    }, []);

    const loadCatalog = async () => {
        const { data } = await supabase.from('exercise_catalog').select('*').order('name');
        setCatalog(data || []);
    };

    const addExercise = (exercise) => {
        setSelectedExercises([...selectedExercises, {
            ...exercise,
            catalog_id: exercise.id,
            id: Date.now(), // Temp ID for UI
            sets: [{ reps: 10, weight: 0 }]
        }]);
        // Optional: switch to workout tab on add? maybe not, user might want to add multiple.
        // toast.success("Exercício adicionado!"); 
    };

    const removeExercise = (index) => {
        setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
    };

    const updateSet = (exIndex, setIndex, field, value) => {
        setSelectedExercises(selectedExercises.map((ex, i) => {
            if (i === exIndex) {
                const newSets = [...ex.sets];
                newSets[setIndex] = { ...newSets[setIndex], [field]: value };
                return { ...ex, sets: newSets };
            }
            return ex;
        }));
    };

    const addSet = (exIndex) => {
        setSelectedExercises(selectedExercises.map((ex, i) => {
            if (i === exIndex) {
                const previousSet = ex.sets[ex.sets.length - 1];
                return { ...ex, sets: [...ex.sets, { ...previousSet }] };
            }
            return ex;
        }));
    };

    const removeSet = (exIndex, setIndex) => {
        setSelectedExercises(selectedExercises.map((ex, i) => {
            if (i === exIndex) {
                return { ...ex, sets: ex.sets.filter((_, j) => j !== setIndex) };
            }
            return ex;
        }));
    };

    const handleSave = () => {
        if (!title) return alert('Dê um nome ao treino!');
        if (selectedExercises.length === 0) return alert('Adicione pelo menos um exercício!');

        const workoutData = {
            title,
            description,
            icon,
            exercises: selectedExercises.map(ex => ({
                id: ex.catalog_id,
                name: ex.name,
                muscle_group: ex.muscle_group,
                sets: ex.sets.map(s => ({ reps: s.reps })) // Only save reps target
            }))
        };
        onSave(workoutData);
    };

    const filteredCatalog = catalog.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
        const matchesMuscle = muscleFilter === 'Todos' || ex.muscle_group === muscleFilter;
        return matchesSearch && matchesMuscle;
    });

    const muscleGroups = ['Todos', ...new Set(catalog.map(c => c.muscle_group))];

    if (step === 1) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl animate-bounce-slow">
                        {icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Criar Novo Treino</h3>
                    <p className="text-sm text-slate-500">Defina o nome e o ícone do seu treino</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nome do Treino</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="ex: Treino A - Peito e Tríceps"
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Descrição (Opcional)</label>
                        <input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="ex: Foco em hipertrofia"
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ícone</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {['💪', '🦵', '🔥', '🧘', '🏃', '🏋️', '🤸', '🚴', '🏊', '🥊'].map(i => (
                                <button
                                    key={i}
                                    onClick={() => setIcon(i)}
                                    className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-2xl border transition-all ${icon === i ? 'bg-primary/20 border-primary shadow-lg scale-110' : 'bg-slate-50 dark:bg-white/5 border-transparent hover:bg-slate-100 dark:hover:bg-white/10'}`}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                    <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/20 transition-all">Continuar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[85vh] md:h-[80vh]">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <button onClick={() => setStep(1)} className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
                    <span className="material-icons-round text-lg">arrow_back</span> Voltar
                </button>
                <h3 className="font-bold text-slate-900 dark:text-white hidden md:block">Montar Treino</h3>

                {/* Mobile Tabs */}
                <div className="md:hidden flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeTab === 'catalog' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'}`}
                    >
                        Exercícios
                    </button>
                    <button
                        onClick={() => setActiveTab('workout')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'workout' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500'}`}
                    >
                        Meu Treino
                        <span className="bg-primary text-white text-[9px] px-1.5 rounded-full">{selectedExercises.length}</span>
                    </button>
                </div>

                <button onClick={handleSave} className="text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                    <Save size={16} /> Salvar
                </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6 relative">
                {/* Catalog Sidebar */}
                <div className={`w-full md:w-1/3 flex flex-col md:border-r border-slate-100 dark:border-white/5 md:pr-4 h-full ${activeTab === 'catalog' ? 'flex' : 'hidden md:flex'}`}>
                    <div className="mb-4 space-y-3 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar exercício..."
                                className="w-full bg-slate-100 dark:bg-white/5 pl-10 pr-3 py-3 rounded-xl text-sm text-slate-900 dark:text-white border-none focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {muscleGroups.map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMuscleFilter(m)}
                                    className={`text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-all border ${muscleFilter === m ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 pb-20 md:pb-0">
                        {filteredCatalog.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">
                                <p className="text-sm">Nenhum exercício encontrado</p>
                            </div>
                        ) : (
                            filteredCatalog.map(ex => {
                                const isAdded = selectedExercises.some(s => s.catalog_id === ex.id);
                                return (
                                    <div key={ex.id} className={`p-4 bg-white dark:bg-surface-dark border rounded-xl transition-all cursor-pointer group relative overflow-hidden ${isAdded ? 'border-primary/50 bg-primary/5' : 'border-slate-100 dark:border-white/5 hover:border-primary/30'}`} onClick={() => addExercise(ex)}>
                                        <div className="flex justify-between items-center relative z-10">
                                            <span className={`text-sm font-bold ${isAdded ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>{ex.name}</span>
                                            {isAdded ? (
                                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-xs">+1</span>
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-white/20 flex items-center justify-center group-hover:border-primary transition-colors">
                                                    <Plus size={14} className="text-slate-400 group-hover:text-primary" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1 block">{ex.muscle_group}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Workout Preview */}
                <div className={`flex-1 flex flex-col overflow-hidden h-full ${activeTab === 'workout' ? 'flex' : 'hidden md:flex'}`}>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 pb-20 md:pb-0">
                        {selectedExercises.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 p-8 text-center">
                                <Dumbbell size={64} className="mb-4 text-slate-600 dark:text-slate-700" />
                                <h4 className="text-lg font-bold mb-2">Comece seu Treino</h4>
                                <p className="text-sm max-w-[200px]">Selecione exercícios da lista {window.innerWidth < 768 ? 'na aba "Exercícios"' : 'ao lado'} para montar sua rotina.</p>
                            </div>
                        ) : (
                            selectedExercises.map((ex, exIndex) => (
                                <div key={ex.id} className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="flex justify-between items-start mb-4 border-b border-slate-200 dark:border-white/5 pb-3">
                                        <div>
                                            <h4 className="font-black text-slate-900 dark:text-white text-base">{ex.name}</h4>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{ex.muscle_group}</span>
                                        </div>
                                        <button onClick={() => removeExercise(exIndex)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="grid grid-cols-5 gap-2 text-[9px] uppercase font-black text-slate-400 text-center tracking-widest">
                                            <span className="col-span-1">Série</span>
                                            <span className="col-span-3">Reps (Meta)</span>
                                            <span className="col-span-1">Ação</span>
                                        </div>
                                        {ex.sets.map((set, setIndex) => (
                                            <div key={setIndex} className="grid grid-cols-5 gap-2 items-center bg-white dark:bg-black/20 rounded-lg p-2 border border-slate-100 dark:border-white/5">
                                                <span className="text-center text-sm font-black text-primary bg-primary/10 rounded w-6 h-6 flex items-center justify-center mx-auto">{setIndex + 1}</span>
                                                <input
                                                    type="number"
                                                    value={set.reps}
                                                    onChange={e => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                                                    className="col-span-3 bg-transparent border-b border-slate-200 dark:border-white/20 rounded-none px-2 py-1 text-sm font-bold text-center focus:border-primary focus:outline-none text-slate-900 dark:text-white"
                                                    placeholder="0"
                                                />
                                                <div className="flex justify-center">
                                                    <button onClick={() => removeSet(exIndex, setIndex)} className="text-slate-400 hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => addSet(exIndex)} className="w-full py-2 mt-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01]">
                                            <Plus size={14} /> Adicionar Série
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Fab for Tab Switch (Optional, but tabs are enough) */}
            {activeTab === 'catalog' && selectedExercises.length > 0 && (
                <div className="md:hidden absolute bottom-6 right-6 animate-bounce-slow z-50">
                    <button onClick={() => setActiveTab('workout')} className="bg-primary text-white w-14 h-14 rounded-full shadow-xl shadow-primary/30 flex items-center justify-center">
                        <div className="relative">
                            <Dumbbell size={24} />
                            <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-primary">{selectedExercises.length}</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}
