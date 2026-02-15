import React, { useState, useEffect, useMemo } from 'react';
import { X, TrendingDown, Dumbbell, TrendingUp, RotateCcw } from 'lucide-react';
import { dietService } from '../services/dietService';

const GOALS = [
    { id: 'lose_weight', label: 'Perder Peso', icon: TrendingDown },
    { id: 'maintain_weight', label: 'Manter Peso', icon: Dumbbell },
    { id: 'gain_muscle', label: 'Ganhar Massa', icon: TrendingUp }
];

export default function DietSettingsModal({ isOpen, onClose, profile, onSave }) {
    const [goal, setGoal] = useState(profile?.goal || 'maintain_weight');
    const [customCalories, setCustomCalories] = useState('');
    const [protein, setProtein] = useState(25);
    const [carbs, setCarbs] = useState(45);
    const [fat, setFat] = useState(30);

    // Initialize from profile when modal opens
    useEffect(() => {
        if (isOpen && profile) {
            setGoal(profile.goal || 'maintain_weight');

            // Load custom or calculated calories
            if (profile.customCalories) {
                setCustomCalories(profile.customCalories);
            } else {
                const calc = dietService.calculateCalories(profile);
                setCustomCalories(calc.goalCalories);
            }

            // Load custom or default macros
            if (profile.customMacros) {
                setProtein(profile.customMacros.protein);
                setCarbs(profile.customMacros.carbs);
                setFat(profile.customMacros.fat);
            } else {
                const defaults = dietService.getDefaultRatios(profile.goal);
                setProtein(defaults.protein);
                setCarbs(defaults.carbs);
                setFat(defaults.fat);
            }
        }
    }, [isOpen, profile]);

    // When goal changes, update default ratios (only if user hasn't set custom macros)
    const handleGoalChange = (newGoal) => {
        setGoal(newGoal);
        const defaults = dietService.getDefaultRatios(newGoal);
        setProtein(defaults.protein);
        setCarbs(defaults.carbs);
        setFat(defaults.fat);
    };

    // Reset calories to calculated value
    const handleResetCalories = () => {
        if (!profile) return;
        const tempProfile = { ...profile, goal, customCalories: null, customMacros: null };
        const calc = dietService.calculateCalories(tempProfile);
        setCustomCalories(calc.goalCalories);
    };

    // Macro to grams
    const cal = Number(customCalories) || 0;
    const proteinGrams = Math.round((cal * (protein / 100)) / 4);
    const carbsGrams = Math.round((cal * (carbs / 100)) / 4);
    const fatGrams = Math.round((cal * (fat / 100)) / 9);

    const totalPercent = Math.round(protein + carbs + fat);

    // Pie chart calculations  
    const circumference = 2 * Math.PI * 40; // ~251.2
    const proteinDash = (protein / 100) * circumference;
    const carbsDash = (carbs / 100) * circumference;
    const fatDash = (fat / 100) * circumference;
    const proteinOffset = 0;
    const carbsOffset = -proteinDash;
    const fatOffset = -(proteinDash + carbsDash);

    const handleSave = () => {
        const updatedProfile = {
            ...profile,
            goal,
            customCalories: Number(customCalories),
            customMacros: {
                protein: Math.round(protein),
                carbs: Math.round(carbs),
                fat: Math.round(fat)
            }
        };
        dietService.saveDietProfile(updatedProfile);
        onSave(updatedProfile);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#121218] w-full max-w-5xl rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden my-8">
                {/* Top glow line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent blur-sm"></div>

                {/* Close button */}
                <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="p-8 md:p-10 overflow-y-auto max-h-[85vh]">
                    {/* Title */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                            Configurar <span className="bg-gradient-to-r from-purple-500 via-purple-400 to-emerald-400 bg-clip-text text-transparent">Dieta</span>
                        </h1>
                        <p className="text-slate-400 mt-2 text-sm">
                            Ajuste seus objetivos e a distribuição de macronutrientes.
                        </p>
                    </div>

                    {/* Goal Selection */}
                    <div className="mb-10">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 pl-1">
                            <span className="text-purple-500">●</span> Editar Objetivo
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {GOALS.map((g) => {
                                const Icon = g.icon;
                                const isActive = goal === g.id;
                                return (
                                    <button
                                        key={g.id}
                                        type="button"
                                        onClick={() => handleGoalChange(g.id)}
                                        className={`group flex flex-col items-center justify-center p-6 border rounded-2xl transition-all relative overflow-hidden h-28 ${isActive
                                                ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                                                : 'border-white/5 bg-[#1A1A22] hover:border-purple-500/50 hover:bg-[#20202A]'
                                            }`}
                                    >
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-50"></div>
                                        )}
                                        <Icon size={28} className={`relative z-10 mb-2 transition-colors ${isActive ? 'text-purple-500' : 'text-slate-400 group-hover:text-purple-400'}`} />
                                        <span className="relative z-10 font-bold text-white text-base">{g.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Calories + Pie Chart */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        {/* Calorie Input */}
                        <div className="flex flex-col justify-between">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 pl-1">
                                    <span className="text-purple-500">●</span> Meta de Calorias Diárias
                                </label>
                                <div className="relative group mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <span className="text-slate-500 text-lg">🔥</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={customCalories}
                                        onChange={(e) => setCustomCalories(e.target.value)}
                                        className="font-mono w-full bg-[#1A1A22] border border-white/10 rounded-2xl py-5 pl-16 pr-20 text-4xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all tracking-tight"
                                        placeholder="2500"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                                        <span className="text-slate-500 font-medium text-sm tracking-wide">KCAL</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleResetCalories}
                                    className="w-full py-3.5 rounded-xl border border-cyan-400/30 text-cyan-400/80 font-bold text-xs uppercase tracking-widest hover:bg-cyan-400/10 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <RotateCcw size={14} className="group-hover:rotate-[-360deg] transition-transform duration-500" />
                                    Redefinir com base no meu perfil
                                </button>
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-[#15151C] rounded-3xl p-6 border border-white/5 flex flex-col items-center justify-center">
                            <div className="relative w-44 h-44">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#39FF14" strokeWidth="12"
                                        strokeDasharray={`${proteinDash} ${circumference}`}
                                        strokeDashoffset={proteinOffset}
                                        className="transition-all duration-500"
                                    />
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FFFF00" strokeWidth="12"
                                        strokeDasharray={`${carbsDash} ${circumference}`}
                                        strokeDashoffset={carbsOffset}
                                        className="transition-all duration-500"
                                    />
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FF00FF" strokeWidth="12"
                                        strokeDasharray={`${fatDash} ${circumference}`}
                                        strokeDashoffset={fatOffset}
                                        className="transition-all duration-500"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className={`text-2xl font-bold ${totalPercent === 100 ? 'text-white' : 'text-red-400'}`}>{totalPercent}%</span>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Total</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-5 w-full">
                                <div className="text-center">
                                    <div className="w-3 h-3 rounded-full mx-auto mb-1.5" style={{ background: '#39FF14', boxShadow: '0 0 10px #39FF14' }}></div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Prot</p>
                                    <p className="text-white font-mono text-sm">{Math.round(protein)}%</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-3 h-3 rounded-full mx-auto mb-1.5" style={{ background: '#FFFF00', boxShadow: '0 0 10px #FFFF00' }}></div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Carb</p>
                                    <p className="text-white font-mono text-sm">{Math.round(carbs)}%</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-3 h-3 rounded-full mx-auto mb-1.5" style={{ background: '#FF00FF', boxShadow: '0 0 10px #FF00FF' }}></div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Gord</p>
                                    <p className="text-white font-mono text-sm">{Math.round(fat)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Macro Sliders */}
                    <div className="mb-10">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 pl-1">
                            <span className="text-purple-500">●</span> Distribuição de Macronutrientes (%)
                        </label>

                        {totalPercent !== 100 && (
                            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
                                ⚠ A soma dos macros deve ser 100%. Atual: {totalPercent}%
                            </div>
                        )}

                        <div className="space-y-8">
                            {/* Protein */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-white font-bold flex items-center gap-2">
                                        <span className="w-1.5 h-7 rounded-full" style={{ background: '#39FF14', boxShadow: '0 0 10px #39FF14' }}></span>
                                        Proteínas
                                    </label>
                                    <span className="font-mono text-xl font-bold" style={{ color: '#39FF14' }}>{Math.round(protein)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={protein}
                                    onChange={(e) => setProtein(Number(e.target.value))}
                                    className="neon-slider slider-green"
                                />
                                <p className="text-right text-xs text-slate-500 mt-1 font-mono">{proteinGrams}g / dia</p>
                            </div>

                            {/* Carbs */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-white font-bold flex items-center gap-2">
                                        <span className="w-1.5 h-7 rounded-full" style={{ background: '#FFFF00', boxShadow: '0 0 10px #FFFF00' }}></span>
                                        Carboidratos
                                    </label>
                                    <span className="font-mono text-xl font-bold" style={{ color: '#FFFF00' }}>{Math.round(carbs)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={carbs}
                                    onChange={(e) => setCarbs(Number(e.target.value))}
                                    className="neon-slider slider-yellow"
                                />
                                <p className="text-right text-xs text-slate-500 mt-1 font-mono">{carbsGrams}g / dia</p>
                            </div>

                            {/* Fat */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-white font-bold flex items-center gap-2">
                                        <span className="w-1.5 h-7 rounded-full" style={{ background: '#FF00FF', boxShadow: '0 0 10px #FF00FF' }}></span>
                                        Lipídeos
                                    </label>
                                    <span className="font-mono text-xl font-bold" style={{ color: '#FF00FF' }}>{Math.round(fat)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={fat}
                                    onChange={(e) => setFat(Number(e.target.value))}
                                    className="neon-slider slider-pink"
                                />
                                <p className="text-right text-xs text-slate-500 mt-1 font-mono">{fatGrams}g / dia</p>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={totalPercent !== 100}
                        className={`group w-full font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest relative overflow-hidden ${totalPercent === 100
                                ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transform hover:-translate-y-1 active:translate-y-0'
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <span className="relative z-10">Salvar Alterações</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
