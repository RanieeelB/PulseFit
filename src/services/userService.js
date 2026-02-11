import { supabase } from './supabaseClient.js';

const defaultProfile = {
    name: 'Novo Usuário',
    level: 1, // Changed from 'Iniciante' to match DB integer type
    avatar: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
    notifications: 0,
    weight: 70,
    height: 170
};

export const userService = {
    async getProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        let { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error && error.code === 'PGRST116') {
            // Profile does not exist, create it
            // Exclude 'notifications' from insert payload to be safe if column is missing
            const { notifications, ...profileData } = defaultProfile;
            const newProfile = {
                id: user.id,
                email: user.email, // Add email definition
                ...profileData
            };

            const { data, error: insertError } = await supabase
                .from('profiles')
                .insert([newProfile])
                .select()
                .single();

            if (insertError) {
                // If conflict (profile created by another request in the meantime), just fetch it
                if (insertError.code === '23505') {
                    return this.getProfile();
                }
                console.error('Error creating profile:', insertError);
                return defaultProfile; // Fallback
            }
            return data;
        } else if (error) {
            console.error('Error fetching profile:', error);
            return defaultProfile;
        }

        // Sync email if missing in profile but present in auth
        if (user.email && profile && !profile.email) {
            await this.saveProfile({ email: user.email });
            profile.email = user.email;
        }

        return profile;
    },

    async saveProfile(data) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Remove updates that shouldn't be here if any
        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', user.id);

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }

        // Fetch fresh to ensure we have specific fields if needed, or just return merged
        const updated = await this.getProfile();

        // Dispatch event
        window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: updated }));
        return updated;
    },

    async uploadAvatar(file) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    async updateAvatar(url) {
        return this.saveProfile({ avatar: url });
    },

    async reset() {
        // Reset to default values
        const { id, created_at, ...defaults } = defaultProfile; // Keep ID and legacy fields
        return this.saveProfile(defaults);
    },

    async getWeightHistory(period = 'all') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        let query = supabase
            .from('weight_history')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: true }); // Chronological order

        if (period === 'month') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            query = query.gte('date', oneMonthAgo.toISOString());
        } else if (period === 'year') {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            query = query.gte('date', oneYearAgo.toISOString());
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching weight history:', error);
            return [];
        }
        return data;
    },

    async addWeightEntry(weight, date) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user');

        const { data, error } = await supabase
            .from('weight_history')
            .insert([{
                user_id: user.id,
                weight: parseFloat(weight),
                date: date ? new Date(date).toISOString() : new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding weight entry:', error);
            throw error;
        }

        // Also update current profile weight
        await this.saveProfile({ weight: parseFloat(weight) });

        return data;
    },

    async deleteWeightEntry(id) {
        const { error } = await supabase
            .from('weight_history')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting weight entry:', error);
            throw error;
        }
    },

    async updateWeightEntry(id, newWeight, newDate) {
        const updates = { weight: parseFloat(newWeight) };
        if (newDate) updates.date = newDate;

        const { error } = await supabase
            .from('weight_history')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating weight entry:', error);
            throw error;
        }

        // We might want to update profile weight if this was the latest entry, 
        // but for simplicity we'll skip that check for now or handle it in UI/Progress.jsx re-fetch
    }
};
