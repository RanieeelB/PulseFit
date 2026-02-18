import { supabase } from './supabaseClient';
import { getLocalDate } from '../utils/dateUtils';

export const foodService = {
    // -------------------------------------------------------------------------
    // FOODS (Search & Create)
    // -------------------------------------------------------------------------

    async searchFoods(query) {
        if (!query || query.length < 2) return [];

        try {
            const { data, error } = await supabase
                .from('foods')
                .select('*')
                .ilike('name', `%${query}%`)
                .order('name')
                .limit(20);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error searching foods:', error);
            throw error; // Throw to let UI know
        }
    },

    async getRecentFoods() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Fetch last 50 logs to get recent food IDs
            const { data: logs, error: logError } = await supabase
                .from('food_log')
                .select('food_id, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (logError) throw logError;

            if (!logs || logs.length === 0) return [];

            // Extract unique IDs, preserving order (most recent first)
            const uniqueFoodIds = [...new Set(logs.map(log => log.food_id))];

            // Fetch food details for these IDs
            const { data: foods, error: foodError } = await supabase
                .from('foods')
                .select('*')
                .in('id', uniqueFoodIds);

            if (foodError) throw foodError;

            // Sort foods back to match the recent order
            return uniqueFoodIds
                .map(id => foods.find(f => f.id === id))
                .filter(Boolean); // Remove any nulls if food was deleted

        } catch (error) {
            console.error('Error fetching recent foods:', error);
            throw error;
        }
    },

    async getFavorites() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('favorite_foods')
                .select('food:foods(*)')
                .eq('user_id', user.id);

            if (error) throw error;
            return data.map(item => item.food);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            return [];
        }
    },

    async toggleFavorite(foodId, isFavorite) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            if (isFavorite) {
                // Remove
                const { error } = await supabase
                    .from('favorite_foods')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('food_id', foodId);
                if (error) throw error;
            } else {
                // Add
                const { error } = await supabase
                    .from('favorite_foods')
                    .insert([{ user_id: user.id, food_id: foodId }]);
                if (error) throw error;
            }
            return true;
        } catch (error) {
            console.error('Error toggling favorite:', error);
            throw error;
        }
    },

    async getFavoriteIds() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('favorite_foods')
                .select('food_id')
                .eq('user_id', user.id);

            if (error) throw error;
            return data.map(item => item.food_id);
        } catch (error) {
            console.error('Error fetching favorite IDs:', error);
            return [];
        }
    },

    async getFoodsByCategory(category) {
        try {
            const { data, error } = await supabase
                .from('foods')
                .select('*')
                .eq('category', category)
                .order('name');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching foods by category:', error);
            return [];
        }
    },

    async addCustomFood(foodData) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('foods')
                .insert([{ ...foodData, created_by: user.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding custom food:', error);
            return null;
        }
    },

    // -------------------------------------------------------------------------
    // FOOD LOG (Diary)
    // -------------------------------------------------------------------------

    async getDailyLog(date) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Format date as YYYY-MM-DD if it's a Date object
            const queryDate = date instanceof Date
                ? date.toISOString().split('T')[0]
                : date;

            const { data, error } = await supabase
                .from('food_log')
                .select(`
                    id,
                    meal_type,
                    quantity_grams,
                    date,
                    food:foods (
                        id,
                        name,
                        category,
                        calories,
                        protein,
                        carbs,
                        fat,
                        fiber,
                        serving_size
                    )
                `)
                .eq('user_id', user.id)
                .eq('date', queryDate);

            if (error) throw error;

            // Transform data to group by meal_type or return flat list
            // Returning flat list with calculated totals is usually easier for frontend mapping
            return data.map(log => {
                const ratio = log.quantity_grams / log.food.serving_size;
                return {
                    ...log,
                    calculated: {
                        calories: Math.round(log.food.calories * ratio),
                        protein: Math.round(log.food.protein * ratio),
                        carbs: Math.round(log.food.carbs * ratio),
                        fat: Math.round(log.food.fat * ratio),
                        fiber: Math.round(log.food.fiber * ratio)
                    }
                };
            });

        } catch (error) {
            console.error('Error fetching daily log:', error);
            return [];
        }
    },

    async addFoodLog(logEntry) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('food_log')
                .insert([{
                    user_id: user.id,
                    food_id: logEntry.foodId,
                    meal_type: logEntry.mealType,
                    quantity_grams: logEntry.quantityGrams,
                    date: logEntry.date || getLocalDate()
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding food log:', error);
            return null;
        }
    },

    async deleteFoodLog(logId) {
        try {
            const { error } = await supabase
                .from('food_log')
                .delete()
                .eq('id', logId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting food log:', error);
            return false;
        }
    },

    async updateFoodLog(logId, quantityGrams) {
        try {
            const { error } = await supabase
                .from('food_log')
                .update({ quantity_grams: quantityGrams })
                .eq('id', logId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating food log:', error);
            return false;
        }
    },

    // -------------------------------------------------------------------------
    // UTILS
    // -------------------------------------------------------------------------

    scaleNutrition(food, grams) {
        if (!food) return null;
        const ratio = grams / food.serving_size;
        return {
            calories: Math.round(food.calories * ratio),
            protein: Math.round(food.protein * ratio),
            carbs: Math.round(food.carbs * ratio),
            fat: Math.round(food.fat * ratio),
            fiber: Math.round(food.fiber * ratio)
        };
    },

    /**
     * Deletes food_log entries older than 7 days for the current user.
     * Called as background cleanup when the diet page loads.
     */
    async cleanupOldLogs() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            const cutoff = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, '0')}-${String(cutoffDate.getDate()).padStart(2, '0')}`;

            const { error } = await supabase
                .from('food_log')
                .delete()
                .eq('user_id', user.id)
                .lt('date', cutoff);

            if (error) {
                console.error('Error cleaning up old food logs:', error);
            }
        } catch (error) {
            console.error('Error in cleanupOldLogs:', error);
        }
    }
};
