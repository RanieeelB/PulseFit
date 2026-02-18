import React from 'react';
import { getLast7Days } from '../utils/dateUtils';
import { Calendar } from 'lucide-react';

export default function DaySelector({ selectedDate, onSelectDate }) {
    // Reverse so oldest is first (left) and today is last (right)
    const days = getLast7Days().reverse();

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} className="text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Histórico</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
                {days.map((day) => {
                    const isSelected = day.date === selectedDate;
                    const isToday = day.label === 'Hoje';

                    return (
                        <button
                            key={day.date}
                            onClick={() => onSelectDate(day.date)}
                            className={`
                                flex flex-col items-center py-2 px-1 rounded-xl border transition-all duration-200
                                relative overflow-hidden
                                ${isSelected && isToday
                                    ? 'bg-gradient-to-br from-primary/25 to-purple-600/15 border-primary/60 shadow-[0_0_18px_rgba(139,92,246,0.3)] ring-1 ring-primary/30'
                                    : isSelected
                                        ? 'bg-primary/15 border-primary/40 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                                        : 'bg-[#121218] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'
                                }
                            `}
                        >
                            {/* Today glow effect */}
                            {isToday && isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />
                            )}

                            <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 relative z-10 ${isSelected && isToday ? 'text-primary' : isSelected ? 'text-primary' : 'text-slate-600'
                                }`}>
                                {day.dayOfWeek}
                            </span>

                            <span className={`text-xs font-black tracking-tight relative z-10 ${isSelected && isToday
                                    ? 'text-white'
                                    : isSelected
                                        ? 'text-white'
                                        : isToday
                                            ? 'text-slate-300'
                                            : 'text-slate-400'
                                }`}>
                                {day.label}
                            </span>

                            {/* Pulsing dot for today */}
                            {isToday && (
                                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse z-10" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
