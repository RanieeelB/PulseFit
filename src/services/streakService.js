const STREAK_KEY = 'crescefit_streak_v1';
const PREV_STREAK_KEY = 'pulsefit_streak_v1';

// Direct migration on load
if (localStorage.getItem(PREV_STREAK_KEY) && !localStorage.getItem(STREAK_KEY)) {
    localStorage.setItem(STREAK_KEY, localStorage.getItem(PREV_STREAK_KEY));
}

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
