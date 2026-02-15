import React, { useState, useEffect } from 'react';
import { Plus, Droplet, Minus } from 'lucide-react';
import { waterService } from '../services/waterService';

const WaterTracker = () => {
    const [water, setWater] = useState(0);
    const [loading, setLoading] = useState(false);
    const [goal] = useState(2500); // 2.5L goal

    useEffect(() => {
        loadWater();
    }, []);

    const loadWater = async () => {
        try {
            const total = await waterService.getTodayWater();
            setWater(total);
        } catch (error) {
            console.error('Error loading water:', error);
        }
    };

    const addWater = async (amount) => {
        setLoading(true);
        try {
            // Optimistic update
            const newTotal = water + amount;
            setWater(newTotal);

            await waterService.addWater(amount);
        } catch (error) {
            console.error('Error adding water:', error);
            // Revert on error
            setWater(water);
        } finally {
            setLoading(false);
        }
    };

    const percentage = Math.min(100, Math.round((water / goal) * 100));

    // Calculate stroke dash array for circle progress
    const radius = 30; // Reduced radius for cleaner look
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-[#0c0c0e] rounded-3xl border border-[#27272a] p-5 relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-700" />

            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                {/* Progress Circle (Left/Top) */}
                <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                    {/* SVG Progress */}
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
                        {/* Background Circle */}
                        <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            className="text-[#27272a]"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="text-cyan-400 transition-all duration-1000 ease-out"
                        />
                    </svg>

                    {/* Inner Icon/Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Droplet size={20} className={`text-cyan-400 ${percentage >= 100 ? 'fill-cyan-400' : ''} transition-all duration-500`} />
                    </div>
                </div>

                {/* Text & Controls (Right/Bottom) */}
                <div className="flex-1 w-full text-center sm:text-left">
                    <div className="flex justify-between items-start mb-1">
                        <div className="mx-auto sm:mx-0">
                            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Hidratação</h3>
                            <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                                <span className="text-2xl font-black text-white tracking-tight">{water}</span>
                                <span className="text-xs font-bold text-zinc-500">/ {goal}ml</span>
                            </div>
                        </div>
                        {percentage >= 100 && (
                            <div className="hidden sm:block px-2 py-1 rounded-md bg-cyan-500/20 text-cyan-400 text-[10px] font-bold border border-cyan-500/30 animate-pulse">
                                META BATIDA!
                            </div>
                        )}
                    </div>
                    {/* Mobile celebration badge */}
                    {percentage >= 100 && (
                        <div className="sm:hidden mb-3 px-2 py-1 inline-block rounded-md bg-cyan-500/20 text-cyan-400 text-[10px] font-bold border border-cyan-500/30 animate-pulse">
                            META BATIDA!
                        </div>
                    )}

                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => addWater(250)}
                            disabled={loading}
                            className="flex-1 py-2 px-3 bg-[#18181b] hover:bg-cyan-500/10 border border-[#27272a] hover:border-cyan-500/30 rounded-xl text-xs font-bold text-zinc-300 hover:text-cyan-400 transition-all active:scale-95 flex items-center justify-center gap-1 group/btn"
                        >
                            <Plus size={12} className="group-hover/btn:rotate-90 transition-transform" /> 250ml
                        </button>
                        <button
                            onClick={() => addWater(500)}
                            disabled={loading}
                            className="flex-1 py-2 px-3 bg-[#18181b] hover:bg-cyan-500/10 border border-[#27272a] hover:border-cyan-500/30 rounded-xl text-xs font-bold text-zinc-300 hover:text-cyan-400 transition-all active:scale-95 flex items-center justify-center gap-1 group/btn"
                        >
                            <Plus size={12} className="group-hover/btn:rotate-90 transition-transform" /> 500ml
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaterTracker;
