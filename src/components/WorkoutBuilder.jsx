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
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
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
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {['💪', '🦵', '🔥', '🧘', '🏃', '🏋️', '🤸', '🚴'].map(i => (
                                <button
                                    key={i}
                                    onClick={() => setIcon(i)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl border transition-all ${icon === i ? 'bg-primary/20 border-primary shadow-lg scale-110' : 'bg-slate-50 dark:bg-white/5 border-transparent hover:bg-slate-100 dark:hover:bg-white/10'}`}
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
        <div className="flex flex-col h-[80vh]">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <button onClick={() => setStep(1)} className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white">← Voltar</button>
                <h3 className="font-bold text-slate-900 dark:text-white">Montar Treino</h3>
                <button onClick={handleSave} className="text-sm font-bold text-primary hover:text-primary-hover">Salvar</button>
            </div>

            <div className="flex-1 overflow-hidden flex gap-6">
                {/* Catalog Sidebar */}
                <div className="w-1/3 flex flex-col border-r border-slate-100 dark:border-white/5 pr-4">
                    <div className="mb-4 space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar exercício..."
                                className="w-full bg-slate-50 dark:bg-white/5 pl-9 pr-3 py-2 rounded-lg text-sm text-slate-900 dark:text-white border-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {muscleGroups.map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMuscleFilter(m)}
                                    className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap transition-colors ${muscleFilter === m ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                        {filteredCatalog.map(ex => (
                            <div key={ex.id} className="p-3 bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 rounded-lg hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => addExercise(ex)}>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{ex.name}</span>
                                    <Plus size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-[10px] text-slate-400 uppercase">{ex.muscle_group}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Workout Preview */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                        {selectedExercises.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                                <Dumbbell size={48} className="mb-2" />
                                <p className="text-sm">Selecione exercícios ao lado para começar</p>
                            </div>
                        ) : (
                            selectedExercises.map((ex, exIndex) => (
                                <div key={ex.id} className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ex.name}</h4>
                                            <span className="text-[10px] text-slate-500 uppercase">{ex.muscle_group}</span>
                                        </div>
                                        <button onClick={() => removeExercise(exIndex)} className="text-red-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="grid grid-cols-4 gap-2 text-[10px] uppercase font-bold text-slate-400 text-center mb-1">
                                            <span className="col-span-1">Série</span>
                                            <span className="col-span-2">Reps (Meta)</span>
                                            <span className="col-span-1"></span>
                                        </div>
                                        {ex.sets.map((set, setIndex) => (
                                            <div key={setIndex} className="grid grid-cols-4 gap-2 items-center">
                                                <span className="text-center text-xs font-bold text-slate-500">{setIndex + 1}</span>
                                                <input
                                                    type="number"
                                                    value={set.reps}
                                                    onChange={e => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                                                    className="col-span-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-xs text-center focus:border-primary focus:outline-none"
                                                />
                                                <div className="flex justify-center">
                                                    <button onClick={() => removeSet(exIndex, setIndex)} className="text-slate-400 hover:text-red-400">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => addSet(exIndex)} className="w-full py-1.5 mt-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center justify-center gap-1">
                                            <Plus size={12} /> Adicionar Série
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
