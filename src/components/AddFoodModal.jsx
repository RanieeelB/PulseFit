import React, { useState, useEffect } from 'react';
import { X, Search, ScanBarcode, Plus, Minus, ChevronRight, Flame, Heart, ArrowRight, Utensils, Zap, Droplet, Sparkles, Check } from 'lucide-react';
import { foodService } from '../services/foodService';

const AddFoodModal = ({ isOpen, onClose, mealType, onFoodAdded }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedFood, setSelectedFood] = useState(null);
    const [portion, setPortion] = useState(100);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('search'); // 'search', 'recent', 'favorites'
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [newFoodMode, setNewFoodMode] = useState(false);
    const [newFood, setNewFood] = useState({
        name: '', brand: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', serving_size: '100'
    });
    const [savingNew, setSavingNew] = useState(false);

    // Debounce search implementation
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                setError(null);
                try {
                    const foods = await foodService.searchFoods(query);
                    setResults(foods);
                } catch (err) {
                    setError('Erro ao buscar alimentos.');
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [query]);

    // Initial Load & Reset
    useEffect(() => {
        if (isOpen) {
            loadFavorites();
            if (activeTab === 'search') setResults([]);
            else loadTabContent(activeTab);
        } else {
            resetState();
        }
    }, [isOpen]);

    // Handle Tab Changes
    useEffect(() => {
        if (isOpen && !newFoodMode) {
            if (activeTab === 'search') {
                if (query.length === 0) setResults([]);
            } else {
                setQuery('');
                loadTabContent(activeTab);
            }
        }
    }, [activeTab]);

    const resetState = () => {
        setQuery('');
        setResults([]);
        setSelectedFood(null);
        setPortion(100);
        setError(null);
        setActiveTab('search');
        setNewFoodMode(false);
        setNewFood({ name: '', brand: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', serving_size: '100' });
    };

    const loadFavorites = async () => {
        const ids = await foodService.getFavoriteIds();
        setFavoriteIds(new Set(ids));
    };

    const loadSuggestions = async () => {
        if (activeTab !== 'search') return;
        setLoading(true);
        try {
            const foods = await foodService.getRecentFoods();
            setResults(foods);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadTabContent = async (tab) => {
        setLoading(true);
        setError(null);
        setResults([]);
        try {
            let foods = [];
            if (tab === 'recent') foods = await foodService.getRecentFoods();
            else if (tab === 'favorites') foods = await foodService.getFavorites();
            setResults(foods);
        } catch (err) {
            console.error(err);
            setError(`Erro ao carregar ${tab === 'recent' ? 'recentes' : 'favoritos'}.`);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (e, food) => {
        e.stopPropagation();
        const isFav = favoriteIds.has(food.id);
        const newSet = new Set(favoriteIds);
        if (isFav) newSet.delete(food.id);
        else newSet.add(food.id);
        setFavoriteIds(newSet);

        try {
            await foodService.toggleFavorite(food.id, isFav);
            if (activeTab === 'favorites' && isFav) {
                setResults(prev => prev.filter(f => f.id !== food.id));
            }
        } catch (err) {
            setFavoriteIds(favoriteIds);
            console.error('Error toggling favorite:', err);
        }
    };

    const handleSelectFood = (food) => {
        setSelectedFood(food);
        setPortion(food.serving_size || 100);
    };

    const handleAddFood = async () => {
        if (!selectedFood) return;
        try {
            const entry = {
                foodId: selectedFood.id,
                mealType: mealType,
                quantityGrams: portion,
                date: new Date().toISOString().split('T')[0]
            };
            await foodService.addFoodLog(entry);
            onFoodAdded();
            onClose();
        } catch (error) {
            console.error('Failed to add food:', error);
            alert('Erro ao adicionar alimento.');
        }
    };

    const handleSaveNewFood = async () => {
        if (!newFood.name || !newFood.calories || !newFood.serving_size) {
            alert('Preencha nome, calorias e porção.');
            return;
        }
        setSavingNew(true);
        try {
            const foodData = {
                name: newFood.name,
                brand: newFood.brand || null,
                calories: Number(newFood.calories) || 0,
                protein: Number(newFood.protein) || 0,
                carbs: Number(newFood.carbs) || 0,
                fat: Number(newFood.fat) || 0,
                fiber: Number(newFood.fiber) || 0,
                serving_size: Number(newFood.serving_size) || 100,
                category: 'Personalizado'
            };
            const saved = await foodService.addCustomFood(foodData);
            if (saved) {
                setNewFoodMode(false);
                setNewFood({ name: '', brand: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', serving_size: '100' });
                handleSelectFood(saved);
            } else {
                alert('Erro ao salvar alimento.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar alimento.');
        } finally {
            setSavingNew(false);
        }
    };

    const getCalculatedMacros = () => {
        if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        return foodService.scaleNutrition(selectedFood, portion);
    };

    const macros = getCalculatedMacros();

    if (!isOpen) return null;

    const translateMeal = (type) => {
        const map = { breakfast: 'Café da Manhã', lunch: 'Almoço', dinner: 'Jantar', snack: 'Lanche' };
        return map[type] || 'Refeição';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-5xl bg-[#09090b] border border-[#27272a] rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">

                {/* LEFT PANEL: Search & List */}
                <div className={`flex-1 flex flex-col min-w-0 bg-[#09090b] ${selectedFood ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="p-5 border-b border-[#27272a]/50">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                                {newFoodMode ? 'Criar Alimento' : `Adicionar ao ${translateMeal(mealType)}`}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {!newFoodMode && (
                            <>
                                <div className="flex mb-4">
                                    <div className="relative flex-1 group">
                                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                                        <div className="relative flex items-center bg-[#18181b] border border-[#27272a] rounded-2xl focus-within:border-primary/50 focus-within:bg-[#18181b] transition-all overflow-hidden shadow-inner">
                                            <div className="pl-4 text-zinc-500">
                                                <Search size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                placeholder="Buscar alimento..."
                                                className="w-full bg-transparent border-none py-3.5 px-3 text-white placeholder-zinc-500 focus:ring-0 text-sm"
                                                autoFocus
                                            />
                                            {query && (
                                                <button onClick={() => setQuery('')} className="pr-4 text-zinc-500 hover:text-white">
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setNewFoodMode(true)}
                                        className="flex items-center gap-1.5 px-4 rounded-2xl bg-[#18181b] text-primary text-xs font-bold border border-[#27272a] hover:bg-primary/10 hover:border-primary/30 transition-all ml-3 shrink-0 h-[46px]"
                                    >
                                        <Plus size={14} /> Criar
                                    </button>
                                </div>

                                <div className="flex p-1 bg-[#18181b] rounded-xl border border-[#27272a]">
                                    {['search', 'recent', 'favorites'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab
                                                ? 'bg-[#27272a] text-white shadow-sm'
                                                : 'text-zinc-500 hover:text-zinc-300'
                                                }`}
                                        >
                                            {tab === 'search' ? 'Resultados' : tab === 'recent' ? 'Recentes' : 'Favoritos'}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Content List / Form */}
                    <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
                        {newFoodMode ? (
                            <div className="p-4 space-y-6">
                                <div className="space-y-4">
                                    <div className="group">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 block group-focus-within:text-primary transition-colors">Nome do Alimento</label>
                                        <input
                                            value={newFood.name}
                                            onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                                            placeholder="Ex: Whey Protein"
                                            className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 block group-focus-within:text-zinc-300 transition-colors">Marca (Opcional)</label>
                                        <input
                                            value={newFood.brand}
                                            onChange={(e) => setNewFood({ ...newFood, brand: e.target.value })}
                                            placeholder="Ex: Growth"
                                            className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest after:h-px after:flex-1 after:bg-[#27272a]">
                                        <Sparkles size={12} className="text-primary" /> Nutrientes
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { k: 'calories', l: 'Calorias', u: 'kcal', c: 'text-primary' },
                                            { k: 'protein', l: 'Proteína', u: 'g', c: 'text-emerald-400' },
                                            { k: 'carbs', l: 'Carboidratos', u: 'g', c: 'text-amber-400' },
                                            { k: 'fat', l: 'Gorduras', u: 'g', c: 'text-pink-400' },
                                            { k: 'fiber', l: 'Fibras', u: 'g', c: 'text-sky-400' },
                                        ].map(f => (
                                            <div key={f.k} className="relative group">
                                                <label className={`text-[9px] uppercase font-bold mb-1 block ${f.c} opacity-70`}>{f.l}</label>
                                                <input
                                                    type="number"
                                                    value={newFood[f.k]}
                                                    onChange={(e) => setNewFood({ ...newFood, [f.k]: e.target.value })}
                                                    className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-primary/40 focus:bg-[#202025] transition-all text-sm font-medium"
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-3 top-[26px] text-[10px] text-zinc-600 font-bold">{f.u}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 block">Porção Padrão (g)</label>
                                    <input
                                        type="number"
                                        value={newFood.serving_size}
                                        onChange={(e) => setNewFood({ ...newFood, serving_size: e.target.value })}
                                        placeholder="100"
                                        className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4 sticky bottom-0 bg-[#09090b] pb-2 border-t border-[#27272a]">
                                    <button
                                        onClick={() => setNewFoodMode(false)}
                                        className="flex-1 py-3.5 rounded-xl border border-[#27272a] text-zinc-400 font-bold hover:bg-[#18181b] hover:text-white transition-all text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveNewFood}
                                        disabled={savingNew}
                                        className="flex-[2] py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {savingNew ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" /> : <Check size={16} />}
                                        Salvar Alimento
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // LIST VIEW
                            <div className="space-y-1 p-2">
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-700 border-t-primary"></div>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-10 px-4">
                                        <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl border border-red-500/20 text-sm">
                                            {error}
                                        </div>
                                    </div>
                                ) : results.length > 0 ? (
                                    results.map((food) => (
                                        <button
                                            key={food.id}
                                            onClick={() => handleSelectFood(food)}
                                            className={`w-full flex items-center p-3 rounded-xl transition-all group border ${selectedFood?.id === food.id
                                                ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                                                : 'bg-transparent border-transparent hover:bg-[#18181b] hover:border-[#27272a]'
                                                }`}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-[#27272a] flex items-center justify-center text-zinc-400 mr-3 flex-shrink-0 group-hover:text-primary transition-colors">
                                                <Utensils size={16} />
                                            </div>
                                            <div className="text-left flex-1 min-w-0 pr-2">
                                                <div className={`font-medium truncate ${selectedFood?.id === food.id ? 'text-primary' : 'text-zinc-200 group-hover:text-white'}`}>{food.name}</div>
                                                <div className="text-xs text-zinc-500 flex items-center gap-2">
                                                    <span>{food.calories}kcal</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                    <span>{food.serving_size}g</span>
                                                </div>
                                            </div>
                                            <div onClick={(e) => toggleFavorite(e, food)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-red-500 transition-colors">
                                                <Heart size={16} className={favoriteIds.has(food.id) ? "fill-red-500 text-red-500" : ""} />
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-zinc-500 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-[#18181b] rounded-full flex items-center justify-center mb-3">
                                            <Search size={24} className="opacity-30" />
                                        </div>
                                        <p className="text-sm">Digite para buscar alimentos</p>
                                        <button onClick={() => setNewFoodMode(true)} className="mt-4 text-xs font-bold text-primary hover:underline">
                                            Ou crie um novo alimento
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: Details & Add */}
                <div className={`flex-1 flex-col bg-[#0c0c0e] md:border-l border-[#27272a] relative overflow-hidden ${selectedFood ? 'flex' : 'hidden md:flex'}`}>
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                    {selectedFood ? (
                        <>
                            {/* Mobile Header */}
                            <div className="p-4 border-b border-[#27272a] flex items-center gap-3 md:hidden bg-[#0c0c0e]/80 backdrop-blur-md sticky top-0 z-10">
                                <button onClick={() => setSelectedFood(null)} className="p-2 -ml-2 text-zinc-400 hover:text-white">
                                    <ArrowRight size={20} className="rotate-180" />
                                </button>
                                <span className="font-bold text-white">Detalhes</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-0 custom-scrollbar">
                                <div className="flex flex-col items-center mb-8 text-center">
                                    <div className="w-20 h-20 bg-[#18181b] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-black/50 border border-[#27272a] group">
                                        <Utensils size={32} className="text-zinc-500 group-hover:text-primary transition-colors duration-500" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white leading-tight mb-1">{selectedFood.name}</h2>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                        {selectedFood.brand || 'Genérico'}
                                    </div>
                                </div>

                                {/* Macros Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className="col-span-2 bg-[#18181b] p-4 rounded-2xl border border-[#27272a] flex justify-between items-center relative overflow-hidden">
                                        <div className="absolute left-0 top-0 w-1 h-full bg-primary" />
                                        <div>
                                            <div className="text-[10px] uppercase font-bold text-primary mb-0.5">Calorias</div>
                                            <div className="text-2xl font-black text-white tracking-tight">{macros.calories} <span className="text-sm text-zinc-500 font-medium">kcal</span></div>
                                        </div>
                                        <Flame size={24} className="text-primary/20" />
                                    </div>

                                    {[
                                        { l: 'Proteína', v: macros.protein, c: 'text-emerald-400', bg: 'bg-emerald-400', i: Flame },
                                        { l: 'Carboidratos', v: macros.carbs, c: 'text-amber-400', bg: 'bg-amber-400', i: Zap },
                                        { l: 'Gorduras', v: macros.fat, c: 'text-pink-400', bg: 'bg-pink-400', i: Droplet },
                                        { l: 'Fibras', v: macros.fiber, c: 'text-sky-400', bg: 'bg-sky-400', i: Check },
                                    ].map(m => (
                                        <div key={m.l} className="bg-[#18181b] p-3 rounded-2xl border border-[#27272a] relative overflow-hidden group hover:border-[#3f3f46] transition-colors">
                                            <div className={`absolute top-0 left-0 w-full h-0.5 ${m.bg} opacity-20`} />
                                            <div className={`text-[9px] uppercase font-bold ${m.c} mb-1 opacity-80`}>{m.l}</div>
                                            <div className="text-xl font-bold text-white">{m.v}<span className="text-xs text-zinc-600 ml-0.5">g</span></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Portion Control */}
                                <div className="bg-[#18181b] p-5 rounded-3xl border border-[#27272a]">
                                    <div className="flex justify-between items-end mb-4">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Quantidade</label>
                                        <div className="text-2xl font-black text-white">{portion}<span className="text-sm text-zinc-500 font-medium ml-1">g</span></div>
                                    </div>

                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        step="5"
                                        value={portion}
                                        onChange={(e) => setPortion(Number(e.target.value))}
                                        className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-primary mb-6 hover:accent-primary/80 transition-all"
                                    />

                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setPortion(Math.max(0, portion - 10))} className="w-12 h-12 rounded-xl bg-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#3f3f46] transition-all"><Minus size={18} /></button>
                                        <div className="flex-1 h-12 flex items-center justify-center bg-[#0c0c0e] rounded-xl border border-[#27272a] text-zinc-300 font-medium text-sm">
                                            {portion} gramas
                                        </div>
                                        <button onClick={() => setPortion(portion + 10)} className="w-12 h-12 rounded-xl bg-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#3f3f46] transition-all"><Plus size={18} /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-[#27272a] bg-[#0c0c0e] relative z-10">
                                <button
                                    onClick={handleAddFood}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-violet-600 text-white font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2 group"
                                >
                                    Adicionar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
                            <div className="w-32 h-32 bg-[#18181b] rounded-full flex items-center justify-center mb-6 border border-[#27272a]">
                                <Utensils size={48} className="text-zinc-600" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-300 mb-2">Nada selecionado</h3>
                            <p className="text-zinc-500 max-w-xs leading-relaxed">Selecione um alimento da lista ou crie um novo para ver os detalhes aqui.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddFoodModal;
