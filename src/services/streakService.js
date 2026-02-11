const STREAK_KEY = 'pulsefit_streak_v1';

export const streakService = {
    getStreak() {
        const stored = localStorage.getItem(STREAK_KEY);
        if (!stored) return 12; // Default mock value from design
        return parseInt(stored);
    },

    increment() {
        const current = this.getStreak();
        localStorage.setItem(STREAK_KEY, current + 1);
        return current + 1;
    },

    reset() {
        localStorage.setItem(STREAK_KEY, 0);
        return 0;
    }
};
