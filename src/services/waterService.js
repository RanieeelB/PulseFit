import { supabase } from './supabaseClient';
import { getLocalDate } from '../utils/dateUtils';

export const waterService = {
    async getTodayWater() {
        const today = getLocalDate();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('water_logs')
            .select('amount_ml')
            .eq('user_id', user.id)
            .eq('date', today);

        if (error) throw error;

        // Sum up all entries for today
        const total = data.reduce((sum, log) => sum + log.amount_ml, 0);
        return total;
    },

    async addWater(amountMl) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const today = getLocalDate();

        const { data, error } = await supabase
            .from('water_logs')
            .insert([
                {
                    user_id: user.id,
                    date: today,
                    amount_ml: amountMl
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
