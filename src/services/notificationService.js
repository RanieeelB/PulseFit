import { supabase } from './supabaseClient';

export const getActiveNotifications = async () => {
    try {
        const { data, error } = await supabase
            .from('app_notifications')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching notifications (Supabase):", error.message);
            return [];
        }
        return data || [];
    } catch (error) {
        console.error("Error fetching notifications (Exception):", error);
        return [];
    }
};
