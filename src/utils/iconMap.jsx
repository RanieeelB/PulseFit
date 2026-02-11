import { Dumbbell, Activity, Flame, Zap, Trophy, Timer, Calendar, Bike, Footprints, Waves, User, Heart } from 'lucide-react';
import React from 'react';

export const iconMap = {
    'dumbbell': <Dumbbell size={24} />,
    'activity': <Activity size={24} />,
    'flame': <Flame size={24} />,
    'zap': <Zap size={24} />,
    'trophy': <Trophy size={24} />,
    'timer': <Timer size={24} />,
    'calendar': <Calendar size={24} />,
    'bike': <Bike size={24} />,
    'run': <Footprints size={24} />,
    'wave': <Waves size={24} />,
    'yoga': <User size={24} />,
    'heart': <Heart size={24} />
};

export const getIcon = (key, props = {}) => {
    // Return icon with cloned props if exists, else default to Dumbbell
    const icon = iconMap[key] || iconMap['dumbbell'];
    return React.cloneElement(icon, { ...props, size: props.size || 24 });
};

// Original emoji to icon key mapping (for backward compatibility)
export const emojiToIconMap = {
    '💪': 'dumbbell',
    '🦵': 'run',
    '🔥': 'flame',
    '🧘': 'yoga',
    '🏃': 'run',
    '🏋️': 'dumbbell',
    '🤸': 'yoga',
    '🚴': 'bike',
    '🏊': 'wave',
    '🥊': 'activity'
};
