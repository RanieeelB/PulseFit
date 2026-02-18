import React, { useState, useEffect } from 'react';
import { dietService } from '../services/dietService';
import { foodService } from '../services/foodService';
import AddFoodModal from '../components/AddFoodModal';
import DietSettingsModal from '../components/DietSettingsModal';
import WaterTracker from '../components/WaterTracker';
import {
    Activity,
    TrendingUp,
    Flame,
    User,
    RefreshCw,
    Utensils,
    Droplet,
    Zap,
    ChevronRight,
    Plus,
    Trash2,
    Settings,
    Pencil
} from 'lucide-react';

export default function Diet() {
    const [profile, setProfile] = useState(null);
    const [calories, setCalories] = useState(null);
    const [loading, setLoading] = useState(true);
    const [foodLogs, setFoodLogs] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        gender: 'male',
        age: '',
        weight: '',
        height: '',
        activityLevel: 'sedentary',
        goal: 'maintain_weight'
    });

    useEffect(() => {
        loadDietData();
    }, []);

    const loadDietData = async () => {
        const savedProfile = await dietService.getDietProfile();
        if (savedProfile) {
            const calculated = dietService.calculateCalories(savedProfile);
            setProfile(savedProfile);
            setCalories(calculated);
            await fetchFoodLogs();
        }
        setLoading(false);
    };

    const fetchFoodLogs = async () => {
        const logs = await foodService.getDailyLog(new Date());
        setFoodLogs(logs);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectOption = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.age || !formData.weight || !formData.height) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        await dietService.saveDietProfile({
            ...formData,
            age: Number(formData.age),
            weight: Number(formData.weight),
            height: Number(formData.height)
        });

        loadDietData();
    };

    const handleRecalculate = async () => {
        if (window.confirm('Tem certeza que deseja recalcular? Seus dados atuais serão substituídos.')) {
            await dietService.clearDietProfile();
            setProfile(null);
            setCalories(null);
            setFoodLogs([]);
            if (profile) {
                setFormData({
                    gender: profile.gender || 'male',
                    age: profile.age || '',
                    weight: profile.weight || '',
                    height: profile.height || '',
                    activityLevel: profile.activityLevel || 'sedentary',
                    goal: profile.goal || 'maintain_weight'
                });
            }
        }
    };

    const openAddFoodModal = (mealType) => {
        setSelectedMeal(mealType);
        setModalOpen(true);
    };

    const handleRemoveLog = async (id) => {
        if (window.confirm('Remover este alimento?')) {
            await foodService.deleteFoodLog(id);
            fetchFoodLogs();
        }
    };

    const handleEditLog = async (log) => {
        const newQty = prompt(`Editar quantidade de ${log.food.name} (gramas):`, log.quantity_grams);
        if (newQty && !isNaN(newQty) && Number(newQty) > 0) {
            await foodService.updateFoodLog(log.id, Number(newQty));
            fetchFoodLogs();
        }
    };

    const calculateTotals = () => {
        return foodLogs.reduce((acc, log) => {
            acc.calories += log.calculated.calories;
            acc.protein += log.calculated.protein;
            acc.carbs += log.calculated.carbs;
            acc.fat += log.calculated.fat;
            acc.fiber += (log.calculated.fiber || 0);
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
    };

    const getMealLogs = (type) => foodLogs.filter(log => log.meal_type === type);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary">Carregando...</div>;

    // -------------------------------------------------------------------------
    // RENDER: DASHBOARD (If profile exists)
    // -------------------------------------------------------------------------
    if (profile && calories) {
        const totals = calculateTotals();
        const goalCalories = Math.round(calories.goalCalories);
        const remainingCalories = goalCalories - totals.calories;
        const progress = Math.min(100, (totals.calories / goalCalories) * 100);

        const mealAccentColors = {
            breakfast: 'from-amber-500/20 to-orange-500/20',
            lunch: 'from-emerald-500/20 to-teal-500/20',
            dinner: 'from-blue-500/20 to-indigo-500/20',
            snack: 'from-pink-500/20 to-rose-500/20'
        };
        const mealBorderColors = {
            breakfast: 'border-l-amber-500',
            lunch: 'border-l-emerald-500',
            dinner: 'border-l-blue-500',
            snack: 'border-l-pink-500'
        };

        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-6 pb-24 md:pb-10 relative">
                {/* Background Effects */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen"></div>
                    <div className="absolute bottom-[-5%] right-[10%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] mix-blend-screen"></div>
                </div>

                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Dieta</h1>
                            <p className="text-slate-500 text-sm flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                Hoje
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setSettingsOpen(true)} className="p-2.5 bg-[#121218] border border-white/5 rounded-xl hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all">
                                <Settings size={18} className="text-slate-400" />
                            </button>
                            <button onClick={handleRecalculate} className="p-2.5 bg-[#121218] border border-white/5 rounded-xl hover:bg-white/10 transition-all">
                                <RefreshCw size={18} className="text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Macro Summary Card */}
                    <div className="bg-[#121218] rounded-3xl p-6 relative overflow-hidden border border-[#27272a] shadow-2xl relative group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-400 to-blue-500 opacity-70" />
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-colors duration-700" />

                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 relative z-10">
                            {/* Calorie Header */}
                            <div className="flex-shrink-0">
                                <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Resumo Diário</h2>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white tracking-tight">{Math.round(totals.calories)}</span>
                                    <span className="text-sm font-bold text-zinc-500">/ {goalCalories} kcal</span>
                                </div>
                            </div>

                            {/* Simple Ring Chart */}
                            <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="8" />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="8"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={251.2 - (Math.min(totals.calories / goalCalories, 1) * 251.2)}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <Activity className="absolute text-zinc-600" size={24} />
                            </div>

                            {/* Macro Stats Grid */}
                            <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                                {/* Protein */}
                                <div className="bg-[#1A1A22] border border-white/5 rounded-2xl p-4 relative overflow-hidden group hover:border-emerald-500/20 transition-colors">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Proteína</span>
                                        <Flame size={14} className="text-emerald-500/40" />
                                    </div>
                                    <div className="text-xl font-black text-white">{totals.protein}<span className="text-xs text-slate-500 font-medium ml-0.5">/{Math.round(calories.macros.protein)}g</span></div>
                                    <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (totals.protein / calories.macros.protein) * 100)}%` }}></div>
                                    </div>
                                </div>

                                {/* Carbs */}
                                <div className="bg-[#1A1A22] border border-white/5 rounded-2xl p-4 relative overflow-hidden group hover:border-amber-500/20 transition-colors">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50"></div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Carboidrato</span>
                                        <Zap size={14} className="text-amber-500/40" />
                                    </div>
                                    <div className="text-xl font-black text-white">{totals.carbs}<span className="text-xs text-slate-500 font-medium ml-0.5">/{Math.round(calories.macros.carbs)}g</span></div>
                                    <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (totals.carbs / calories.macros.carbs) * 100)}%` }}></div>
                                    </div>
                                </div>

                                {/* Fat */}
                                <div className="bg-[#1A1A22] border border-white/5 rounded-2xl p-4 relative overflow-hidden group hover:border-pink-500/20 transition-colors">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-pink-500/50"></div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Gorduras</span>
                                        <Droplet size={14} className="text-pink-500/40" />
                                    </div>
                                    <div className="text-xl font-black text-white">{totals.fat}<span className="text-xs text-slate-500 font-medium ml-0.5">/{Math.round(calories.macros.fats)}g</span></div>
                                    <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (totals.fat / calories.macros.fats) * 100)}%` }}></div>
                                    </div>
                                </div>

                                {/* Fiber */}
                                <div className="bg-[#1A1A22] border border-white/5 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-400/20 transition-colors">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-400/50"></div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Fibras</span>
                                        <Utensils size={14} className="text-slate-500/40" />
                                    </div>
                                    <div className="text-xl font-black text-white">{totals.fiber}<span className="text-xs text-slate-500 font-medium ml-0.5">/{calories.macros.fiber}g</span></div>
                                    <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-slate-400 to-slate-300 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (totals.fiber / calories.macros.fiber) * 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Meals */}
                    <div className="space-y-5">
                        {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => {
                            const mealLogs = getMealLogs(meal);
                            const mealTotal = mealLogs.reduce((acc, log) => acc + log.calculated.calories, 0);
                            const mealTarget = Math.round(calories.meals[meal]);
                            const mealPercent = Math.min(100, (mealTotal / mealTarget) * 100);
                            const mealName = {
                                breakfast: 'Café da Manhã',
                                lunch: 'Almoço',
                                dinner: 'Jantar',
                                snack: 'Lanche'
                            }[meal];

                            return (
                                <div key={meal} className={`bg-[#121218] border border-white/5 rounded-2xl overflow-hidden border-l-4 ${mealBorderColors[meal]}`}>
                                    <div className="p-4 md:p-5">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="text-base font-bold text-white">{mealName}</h3>
                                            <button
                                                onClick={() => openAddFoodModal(meal)}
                                                className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors hover:shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full bg-gradient-to-r ${mealAccentColors[meal]} transition-all duration-700`} style={{ width: `${mealPercent}%` }}></div>
                                            </div>
                                            <span className="text-xs text-slate-500 font-bold tabular-nums whitespace-nowrap">{mealTotal} / {mealTarget} kcal</span>
                                        </div>

                                        {mealLogs.length > 0 ? (
                                            <div className="space-y-1">
                                                {mealLogs.map((log) => (
                                                    <div key={log.id} className="flex justify-between items-center py-2.5 px-3 -mx-1 rounded-xl hover:bg-white/[0.03] transition-colors group">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-sm text-white truncate">{log.food.name}</div>
                                                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 flex-wrap">
                                                                <span>{log.quantity_grams}g</span>
                                                                <span className="text-slate-700">•</span>
                                                                <span>{log.calculated.calories} kcal</span>
                                                                <span className="text-slate-700">|</span>
                                                                <span className="text-emerald-500/70">P:{log.calculated.protein}g</span>
                                                                <span className="text-amber-500/70">C:{log.calculated.carbs}g</span>
                                                                <span className="text-pink-500/70">G:{log.calculated.fat}g</span>
                                                                <span className="text-slate-400/70">F:{log.calculated.fiber || 0}g</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                                            <button
                                                                onClick={() => handleEditLog(log)}
                                                                className="p-1.5 text-slate-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                                title="Editar quantidade"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRemoveLog(log.id)}
                                                                className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                                title="Remover"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-slate-600 text-sm border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                                                Nenhum alimento registrado
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Water Tracker */}
                    <div className="mt-8">
                        <WaterTracker />
                    </div>
                </div>

                <AddFoodModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    mealType={selectedMeal}
                    onFoodAdded={fetchFoodLogs}
                />

                <DietSettingsModal
                    isOpen={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                    profile={profile}
                    onSave={(updatedProfile) => {
                        setProfile(updatedProfile);
                        const calc = dietService.calculateCalories(updatedProfile);
                        setCalories(calc);
                    }}
                />
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // RENDER: ONBOARDING FORM (If no profile)
    // -------------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col relative overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
            </div>

            <main className="flex-grow max-w-4xl mx-auto px-6 py-12 relative z-10 w-full animate-in fade-in zoom-in-95 duration-700">
                <div className="text-center mb-12 relative">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">
                        Perfil <span className="bg-gradient-to-r from-primary via-purple-400 to-emerald-400 bg-clip-text text-transparent">Nutricional</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
                        Vamos configurar sua dieta personalizada. Sua evolução começa agora. <span className="text-primary font-bold">Supere-se.</span>
                    </p>
                </div>

                <div className="bg-white dark:bg-[#121218] border border-slate-200 dark:border-white/5 rounded-[32px] p-8 md:p-14 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                    {/* Top Glow Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm"></div>

                    <form onSubmit={handleSubmit}>
                        {/* Gender */}
                        <div className="mb-12 flex flex-col items-center">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Gênero</label>
                            <div className="bg-slate-100 dark:bg-[#1A1A22] p-1 rounded-full border border-slate-200 dark:border-white/5 flex w-full max-w-xs">
                                <button
                                    type="button"
                                    onClick={() => handleSelectOption('gender', 'male')}
                                    className={`flex-1 py-3 px-6 rounded-full font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 border border-transparent ${formData.gender === 'male'
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    <User size={18} /> Homem
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSelectOption('gender', 'female')}
                                    className={`flex-1 py-3 px-6 rounded-full font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 border border-transparent ${formData.gender === 'female'
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    <User size={18} /> Mulher
                                </button>
                            </div>
                        </div>

                        {/* Stats Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Idade</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-100 dark:bg-[#1A1A22] border border-slate-200 dark:border-white/5 rounded-2xl p-5 text-2xl font-bold text-slate-900 dark:text-white placeholder-slate-400/50 dark:placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm tracking-wide pointer-events-none">ANOS</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Peso</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        step="0.1"
                                        className="w-full bg-slate-100 dark:bg-[#1A1A22] border border-slate-200 dark:border-white/5 rounded-2xl p-5 text-2xl font-bold text-slate-900 dark:text-white placeholder-slate-400/50 dark:placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                                        placeholder="0.0"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm tracking-wide pointer-events-none">KG</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Altura</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-100 dark:bg-[#1A1A22] border border-slate-200 dark:border-white/5 rounded-2xl p-5 text-2xl font-bold text-slate-900 dark:text-white placeholder-slate-400/50 dark:placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm tracking-wide pointer-events-none">CM</span>
                                </div>
                            </div>
                        </div>

                        {/* Activity Level */}
                        <div className="mb-14">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 pl-1">Nível de Atividade Física</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {[
                                    { id: 'sedentary', icon: <Activity />, label: 'Sedentário', sub: '< 60 min/sem' },
                                    { id: 'lightly_active', icon: <TrendingUp />, label: 'Levemente Ativo', sub: '60-149 min/sem' },
                                    { id: 'active', icon: <Flame />, label: 'Ativo', sub: '150-300 min/sem' },
                                    { id: 'very_active', icon: <Zap />, label: 'Muito Ativo', sub: '> 300 min/sem' }
                                ].map((level) => (
                                    <button
                                        key={level.id}
                                        type="button"
                                        onClick={() => handleSelectOption('activityLevel', level.id)}
                                        className={`group flex flex-col p-6 border rounded-2xl transition-all text-left relative overflow-hidden ${formData.activityLevel === level.id
                                            ? 'border-primary bg-primary/10 active-card-shadow'
                                            : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1A1A22] hover:border-primary/50'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${formData.activityLevel === level.id
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-white dark:bg-black/20 text-slate-400'
                                            }`}>
                                            {React.cloneElement(level.icon, { size: 24 })}
                                        </div>
                                        <span className={`font-bold text-base mb-1 ${formData.activityLevel === level.id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-white'
                                            }`}>{level.label}</span>
                                        <span className={`text-xs font-medium ${formData.activityLevel === level.id ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500'
                                            }`}>{level.sub}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Goal Selection */}
                        <div className="mb-14">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Qual seu objetivo principal?</label>
                            <div className="flex flex-col sm:flex-row gap-5">
                                {[
                                    { id: 'lose_weight', label: 'Perder Peso' },
                                    { id: 'maintain_weight', label: 'Manter Peso' },
                                    { id: 'gain_muscle', label: 'Ganhar Massa' }
                                ].map((goal) => (
                                    <button
                                        key={goal.id}
                                        type="button"
                                        onClick={() => handleSelectOption('goal', goal.id)}
                                        className={`flex-1 py-5 px-6 rounded-2xl border font-bold transition-all relative overflow-hidden group ${formData.goal === goal.id
                                            ? 'border-primary text-white bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/25'
                                            : 'border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-[#1A1A22] hover:border-primary hover:text-primary'
                                            }`}
                                    >
                                        <span className="relative z-10">{goal.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>



                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="group w-full bg-gradient-to-r from-primary to-[#7C3AED] hover:to-primary text-white font-black py-6 rounded-2xl transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 text-lg uppercase tracking-widest relative overflow-hidden"
                            >
                                <span className="relative z-10">Calcular Dieta</span>
                                <ChevronRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            </button>

                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
}
