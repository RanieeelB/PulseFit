import { supabase } from './supabaseClient';
import { isDemoMode } from '../utils/demoMode';

export const getActiveNotifications = async () => {
    if (isDemoMode()) return [
        { id: 1, title: 'Pronto para o Treino?', message: 'Seu treino de pernas está agendado para hoje. Não se esqueça da água!', created_at: new Date().toISOString() },
        { id: 2, title: 'Dica Nutricional', message: 'Tente consumir pelo menos 20g de proteína em sua próxima refeição.', created_at: new Date().toISOString() }
    ];
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
