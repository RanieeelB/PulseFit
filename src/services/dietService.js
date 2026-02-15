
const DIET_PROFILE_KEY = 'pulsefit_diet_profile';

export const MEAL_DISTRIBUTION = {
    breakfast: { label: 'Café da Manhã', percent: 0.25, icon: 'wb_twilight' },
    lunch: { label: 'Almoço', percent: 0.35, icon: 'wb_sunny' },
    dinner: { label: 'Jantar', percent: 0.25, icon: 'nights_stay' },
    snack: { label: 'Lanche', percent: 0.15, icon: 'bakery_dining' }
};

export const dietService = {
    // Save profile to localStorage
    saveDietProfile(profile) {
        try {
            localStorage.setItem(DIET_PROFILE_KEY, JSON.stringify(profile));
            return profile;
        } catch (error) {
            console.error('Error saving diet profile:', error);
            return null;
        }
    },

    // Get default macro ratios for a given goal
    getDefaultRatios(goal) {
        switch (goal) {
            case 'lose_weight':
                return { protein: 32.5, carbs: 42.5, fat: 25 };
            case 'gain_muscle':
                return { protein: 27.5, carbs: 47.5, fat: 25 };
            case 'maintain_weight':
            default:
                return { protein: 25, carbs: 45, fat: 30 };
        }
    },

    // Get profile from localStorage
    getDietProfile() {
        try {
            const profile = localStorage.getItem(DIET_PROFILE_KEY);
            return profile ? JSON.parse(profile) : null;
        } catch (error) {
            console.error('Error loading diet profile:', error);
            return null;
        }
    },

    // Clear profile (e.g., to reset onboarding)
    clearDietProfile() {
        try {
            localStorage.removeItem(DIET_PROFILE_KEY);
        } catch (error) {
            console.error('Error clearing diet profile:', error);
        }
    },

    // Calculate TMB (Taxa Metabólica Basal) - Mifflin-St Jeor
    calculateTMB(gender, weight, height, age) {
        // Weight in kg, Height in cm, Age in years
        if (gender === 'male') {
            return (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            return (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
    },

    // Calculate TDEE and Goal Calories
    calculateCalories(profile) {
        const { gender, weight, height, age, activityLevel, goal } = profile;

        const tmb = this.calculateTMB(gender, weight, height, age);

        let activityMultiplier = 1.2; // Sedentário defaults
        switch (activityLevel) {
            case 'sedentary':
                activityMultiplier = 1.2;
                break;
            case 'lightly_active':
                activityMultiplier = 1.375;
                break;
            case 'active':
                activityMultiplier = 1.55;
                break;
            case 'very_active':
                activityMultiplier = 1.725;
                break;
            default:
                activityMultiplier = 1.2;
        }

        const tdee = tmb * activityMultiplier;

        let goalMultiplier = 1.0;
        let proteinRatio = 0.25;
        let carbsRatio = 0.45;
        let fatRatio = 0.30;

        switch (goal) {
            case 'lose_weight':
                goalMultiplier = 0.85; // 15% deficit
                // Perder peso: Proteína: 30–35% (usaremos 32.5%), Gordura: 25%, Carbo: 40–45% (usaremos 42.5%)
                proteinRatio = 0.325;
                carbsRatio = 0.425;
                fatRatio = 0.25;
                break;
            case 'gain_muscle':
                goalMultiplier = 1.15; // 15% surplus
                // Ganho de massa: Proteína: 25–30% (usaremos 27.5%), Gordura: 25%, Carbo: 45–55% (usaremos 47.5%)
                proteinRatio = 0.275;
                carbsRatio = 0.475;
                fatRatio = 0.25;
                break;
            case 'maintain_weight':
            default:
                goalMultiplier = 1.0;
                // Manter peso: Proteína: 25%, Gordura: 30%, Carbo: 45%
                proteinRatio = 0.25;
                carbsRatio = 0.45;
                fatRatio = 0.30;
        }

        let goalCalories = tdee * goalMultiplier;

        // Apply custom overrides if present
        if (profile.customCalories && profile.customCalories > 0) {
            goalCalories = profile.customCalories;
        }

        if (profile.customMacros) {
            proteinRatio = profile.customMacros.protein / 100;
            carbsRatio = profile.customMacros.carbs / 100;
            fatRatio = profile.customMacros.fat / 100;
        }

        return {
            tmb: Math.round(tmb),
            tdee: Math.round(tdee),
            goalCalories: Math.round(goalCalories),
            macros: {
                protein: Math.round((goalCalories * proteinRatio) / 4), // 4 kcal/g
                carbs: Math.round((goalCalories * carbsRatio) / 4),   // 4 kcal/g
                fats: Math.round((goalCalories * fatRatio) / 9),     // 9 kcal/g
                fiber: 25 // Default fiber goal
            },
            ratios: {
                protein: Math.round(proteinRatio * 100),
                carbs: Math.round(carbsRatio * 100),
                fat: Math.round(fatRatio * 100)
            },
            meals: this.getMealDistribution(goalCalories)
        };
    },

    getMealDistribution(totalCalories) {
        return {
            breakfast: Math.round(totalCalories * MEAL_DISTRIBUTION.breakfast.percent),
            lunch: Math.round(totalCalories * MEAL_DISTRIBUTION.lunch.percent),
            dinner: Math.round(totalCalories * MEAL_DISTRIBUTION.dinner.percent),
            snack: Math.round(totalCalories * MEAL_DISTRIBUTION.snack.percent)
        };
    }
};
