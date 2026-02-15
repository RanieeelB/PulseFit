import { supabase } from './supabaseClient.js';

export const workoutService = {
    async getAll() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', user.id)
            .order('order_index', { ascending: true, nullsFirst: false }) // Optional ordering
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching workouts:', error);
            return [];
        }
        return data;
    },

    async createWorkout(workoutData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const newWorkout = {
            user_id: user.id,
            title: workoutData.title || 'Sem título',
            description: workoutData.description || 'Personalizado',
            duration: '0m', // Calculate based on exercises?
            intensity: 'Med',
            icon: workoutData.icon || 'fitness_center',
            exercises: workoutData.exercises || [],
            status: 'pending'
        };

        const { data, error } = await supabase
            .from('workouts')
            .insert([newWorkout])
            .select()
            .single();

        if (error) {
            console.error('Error creating workout:', error);
            throw error;
        }
        return data;
    },

    async updateWorkout(id, workoutData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const durationMin = (workoutData.exercises || []).length * 10;
        const newDuration = `${durationMin}m`;

        const updates = {
            title: workoutData.title,
            description: workoutData.description,
            icon: workoutData.icon,
            exercises: workoutData.exercises || [],
            duration: newDuration
        };

        const { data, error } = await supabase
            .from('workouts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating workout:', error);
            throw error;
        }
        return data;
    },

    async deleteWorkout(id) {
        // First delete logs
        const { error: logError } = await supabase
            .from('workout_logs')
            .delete()
            .eq('workout_id', id);

        if (logError) console.error('Error deleting logs:', logError);

        // Then delete workout
        const { error } = await supabase
            .from('workouts')
            .delete()
            .eq('id', id);

        if (error) console.error('Error deleting workout:', error);
    },

    async addExercise(workoutId, exerciseData) {
        // Fetch current workout exercises
        const { data: workout } = await supabase
            .from('workouts')
            .select('exercises, duration')
            .eq('id', workoutId)
            .single();

        if (!workout) return;

        const currentExercises = workout.exercises || [];
        const newExercises = [
            ...currentExercises,
            { id: Date.now(), ...exerciseData }
        ];

        // Update duration
        const durationMin = newExercises.length * 10;
        const newDuration = `${durationMin}m`;

        const { error } = await supabase
            .from('workouts')
            .update({ exercises: newExercises, duration: newDuration })
            .eq('id', workoutId);

        if (error) console.error('Error adding exercise:', error);
    },

    // Logs & Stats
    async addLog(workoutId, durationMinutes, calories) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user name for denormalization
        const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();

        const { error } = await supabase
            .from('workout_logs')
            .insert([{
                user_id: user.id,
                workout_id: workoutId,
                duration_minutes: durationMinutes,
                calories: calories,
                user_name: profile?.name || 'Atleta PulseFit',
                completed_at: new Date().toISOString()
            }]);

        if (error) console.error('Error logging workout:', error);
        window.dispatchEvent(new CustomEvent('stats-updated'));
    },

    async finishWorkout(id, duration, calories, exercisesPerformed) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // 1. Log the workout
        await this.addLog(id, duration, calories);

        // 2. Update status
        await supabase.from('workouts').update({ status: 'completed' }).eq('id', id);

        // 3. Check for Cycle Completion (Reset Logic)
        let cycleCompleted = false;
        let weeklyStats = null;

        const { data: allWorkouts } = await supabase
            .from('workouts')
            .select('id, status')
            .eq('user_id', user.id);

        if (allWorkouts && allWorkouts.length > 0) {
            // Force this workout to be completed in our local check to avoid DB race conditions
            // Use loose loose equality check (==) to handle potential string/number mismatch for IDs
            const updatedWorkouts = allWorkouts.map(w =>
                w.id == id ? { ...w, status: 'completed' } : w
            );

            const allCompleted = updatedWorkouts.every(w => w.status === 'completed');

            if (allCompleted) {
                cycleCompleted = true;

                try {
                    // Calculate Weekly Stats for Celebration
                    const stats = await this.getWeeklyStats();
                    const streak = await this.getStreak();

                    weeklyStats = {
                        totalVolume: '45k',
                        totalHours: (stats.minutes / 60).toFixed(1),
                        totalCalories: stats.calories,
                        streak: streak,
                        daysCompleted: stats.daysCompleted || []
                    };
                } catch (err) {
                    console.error("Error calculating weekly stats:", err);
                    // Fallback stats so modal still shows
                    weeklyStats = {
                        totalVolume: '---',
                        totalHours: '0',
                        totalCalories: 0,
                        streak: 0
                    };
                }

                // Reset all to pending
                await supabase
                    .from('workouts')
                    .update({ status: 'pending' })
                    .eq('user_id', user.id);

                // Dispatch event to force refresh
                window.dispatchEvent(new CustomEvent('workout-updated'));
            }
        }

        // 4. Process Exercises for PRs and History
        const summary = {
            duration,
            calories,
            prs: [],
            improvements: [],
            cycleCompleted,
            weeklyStats
        };

        if (exercisesPerformed && exercisesPerformed.length > 0) {
            // Update PRs and get list of new records
            const newPRs = await this.updatePRs(exercisesPerformed);
            summary.prs = newPRs || [];

            // Save history
            await this.saveExerciseHistory(exercisesPerformed);

            // Calculate Improvements (compare with last session)
            const historyPromises = exercisesPerformed.map(async (ex) => {
                const history = await this.getExerciseHistory(ex.name);
                if (history && history.length >= 2) {
                    const current = history[0];
                    const previous = history[1];

                    if (current.weight > previous.weight) {
                        return {
                            name: ex.name,
                            oldWeight: previous.weight,
                            newWeight: current.weight,
                            diff: current.weight - previous.weight
                        };
                    }
                }
                return null;
            });

            const results = await Promise.all(historyPromises);
            summary.improvements = results.filter(r => r !== null);
        }

        return summary;
    },

    async toggleStatus(id) {
        // Legacy toggle, mostly for un-completing or simple toggle without stats
        const { data: workout } = await supabase.from('workouts').select('status').eq('id', id).single();
        if (!workout) return;

        const newStatus = workout.status === 'completed' ? 'pending' : 'completed';
        await supabase.from('workouts').update({ status: newStatus }).eq('id', id);
        return this.getAll();
    },

    async getWeeklyStats() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { workouts: 0, minutes: 0, calories: 0 };

        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);

        const { data: logs, error } = await supabase
            .from('workout_logs')
            .select('duration_minutes, calories, completed_at')
            .eq('user_id', user.id)
            .gte('completed_at', startOfWeek.toISOString());

        if (error) {
            console.error('Error fetching stats:', error);
            return { workouts: 0, minutes: 0, calories: 0 };
        }

        const totalWorkouts = logs.length;
        const totalMinutes = logs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
        const totalCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);

        // Identify which days have workouts (0 = Sunday, 1 = Monday, etc.)
        const daysCompleted = [...new Set(logs.map(log => new Date(log.completed_at).getDay()))];

        return {
            workouts: totalWorkouts,
            minutes: totalMinutes,
            calories: totalCalories > 1000 ? (totalCalories / 1000).toFixed(1) + 'k' : totalCalories,
            daysCompleted
        };
    },

    // Stats: Streak & Performance
    async getStreak() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 0;

        const { data: logs, error } = await supabase
            .from('workout_logs')
            .select('completed_at')
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false });

        if (error || !logs || logs.length === 0) return 0;

        // Get unique dates
        const uniqueDates = [...new Set(logs.map(log =>
            new Date(log.completed_at).toISOString().split('T')[0]
        ))];

        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Check if streak is active (has log today or yesterday)
        if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
            return 0;
        }

        // Iterate backwards
        let currentDate = new Date();
        // If the latest log is today, start checking from today
        // If it was yesterday, start checking from yesterday
        if (uniqueDates[0] !== today) {
            currentDate.setDate(currentDate.getDate() - 1);
        }

        for (let i = 0; i < uniqueDates.length; i++) {
            const checkDate = currentDate.toISOString().split('T')[0];

            // If the log date matches the check date, increment streak and move check date back
            if (uniqueDates.includes(checkDate)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    },

    async getMonthlyPerformance() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 0;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        const { data: logs, error } = await supabase
            .from('workout_logs')
            .select('completed_at')
            .eq('user_id', user.id)
            .gte('completed_at', startOfMonth.toISOString());

        if (error || !logs) return 0;

        // Count unique days with workouts
        const uniqueDays = new Set(logs.map(log =>
            new Date(log.completed_at).getDate()
        )).size;

        // Calculate percentage (capped at 100%)
        const percentage = Math.min(100, Math.round((uniqueDays / daysInMonth) * 100));

        return percentage;
    },

    // New Frequency Analysis
    async getFrequency(period = 'week') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        let startDate = new Date();
        if (period === 'week') {
            // Last 7 days
            startDate.setDate(startDate.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'month') {
            // Start of current month
            startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        } else if (period === 'year') {
            // Start of current year
            startDate = new Date(startDate.getFullYear(), 0, 1);
        }

        const { data: logs, error } = await supabase
            .from('workout_logs')
            .select('completed_at')
            .eq('user_id', user.id)
            .gte('completed_at', startDate.toISOString())
            .order('completed_at', { ascending: true });

        if (error) return [];

        if (period === 'week') {
            // Map logs to days of week (Mon, Tue...) including counts
            const daysMap = { 'Sun': 'DOM', 'Mon': 'SEG', 'Tue': 'TER', 'Wed': 'QUA', 'Thu': 'QUI', 'Fri': 'SEX', 'Sat': 'SÁB' };
            const result = [];

            // Initialize last 7 days
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = d.toISOString().split('T')[0];

                const count = logs.filter(l => l.completed_at.startsWith(dateStr)).length;
                result.push({ label: daysMap[dayName], count, fullDate: dateStr });
            }
            return result;
        }

        if (period === 'month') {
            // Group by Week (Week 1, Week 2...)
            const weeks = {};
            logs.forEach(log => {
                const d = new Date(log.completed_at);
                const weekNum = Math.ceil((d.getDate() - 1 + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7);
                weeks[`W${weekNum}`] = (weeks[`W${weekNum}`] || 0) + 1;
            });

            return Object.keys(weeks).map(w => ({ label: w, count: weeks[w] }));
        }

        if (period === 'year') {
            // Group by Month (Jan, Feb...)
            const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
            const result = new Array(12).fill(0);

            logs.forEach(log => {
                const m = new Date(log.completed_at).getMonth();
                result[m]++;
            });

            return result.map((count, index) => ({ label: months[index], count }));
        }

        return [];
    },

    // Personal Records
    async getPersonalRecords() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('personal_records')
            .select('*')
            .eq('user_id', user.id)
            .order('weight', { ascending: false }); // Sort by heaviest

        if (error) return [];
        return data;
    },

    async updatePRs(exercises) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !exercises || exercises.length === 0) return [];

        const newRecords = [];

        // Fetch current records
        const { data: currentPRs } = await supabase
            .from('personal_records')
            .select('*')
            .eq('user_id', user.id);

        const currentMap = new Map(currentPRs?.map(pr => [pr.exercise_name, pr]) || []);

        for (const ex of exercises) {
            if (!ex.name || !ex.weight) continue;

            const existingPR = currentMap.get(ex.name);
            const newWeight = parseFloat(ex.weight);

            if (!existingPR || newWeight > parseFloat(existingPR.weight)) {
                // New PR!
                const { error } = await supabase
                    .from('personal_records')
                    .upsert({
                        user_id: user.id,
                        exercise_name: ex.name,
                        weight: newWeight,
                        reps: ex.reps || 0,
                        date: new Date().toISOString()
                    }, { onConflict: 'user_id, exercise_name' });

                if (!error) {
                    newRecords.push({
                        name: ex.name,
                        oldWeight: existingPR ? existingPR.weight : 0,
                        newWeight: newWeight
                    });
                }
            }
        }
        return newRecords;
    },


    async saveExerciseHistory(exercises) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !exercises || exercises.length === 0) return;

        const historyEntries = exercises.map(ex => ({
            user_id: user.id,
            exercise_name: ex.name,
            weight: parseFloat(ex.weight),
            reps: ex.reps || 0,
            sets: Array.isArray(ex.sets) ? ex.sets.length : (ex.sets || 0),
            sets_data: Array.isArray(ex.sets) ? ex.sets : [],
            date: new Date().toISOString()
        })).filter(entry => entry.weight > 0); // Only save if weight > 0

        if (historyEntries.length === 0) return;

        const { error } = await supabase
            .from('exercise_history')
            .insert(historyEntries);

        if (error) console.error('Error saving exercise history:', error);
    },

    async getExerciseHistory(exerciseName) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('exercise_history')
            .select('*')
            .eq('user_id', user.id)
            .eq('exercise_name', exerciseName)
            .order('date', { ascending: false })
            .limit(20); // Last 20 sessions

        if (error) {
            console.error('Error fetching history:', error);
            return [];
        }
        return data;
    },

    async getLastWeights(exerciseNames) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !exerciseNames || exerciseNames.length === 0) return {};

        // Fetch history for all these exercises
        const { data, error } = await supabase
            .from('exercise_history')
            .select('exercise_name, weight, date, sets_data')
            .eq('user_id', user.id)
            .in('exercise_name', exerciseNames)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching last weights:', error);
            return {};
        }

        // Reduce to find the latest execution for each exercise
        const latestMap = {};
        data.forEach(record => {
            if (!latestMap[record.exercise_name]) {
                latestMap[record.exercise_name] = {
                    weight: record.weight,
                    sets: record.sets_data || []
                };
            }
        });

        return latestMap;
    },

    async getLeaderboard() {
        try {
            const last7Days = new Date();
            last7Days.setDate(last7Days.getDate() - 7);

            // Fetch logs first (most resilient)
            const { data: logs, error: logsError } = await supabase
                .from('workout_logs')
                .select('user_id, user_name, completed_at')
                .gte('completed_at', last7Days.toISOString());

            if (logsError) throw logsError;
            if (!logs || logs.length === 0) return [];

            // Group by user and count
            const userStats = {};
            const uniqueUserIds = [];

            logs.forEach(log => {
                const uid = log.user_id;
                if (!userStats[uid]) {
                    userStats[uid] = {
                        name: log.user_name || 'Atleta PulseFit',
                        avatar: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
                        count: 0
                    };
                    uniqueUserIds.push(uid);
                }
                userStats[uid].count++;
            });

            // Fetch profile avatars separately to avoid JOIN errors (PGRST200)
            const { data: profiles, error: profError } = await supabase
                .from('profiles')
                .select('id, name, avatar')
                .in('id', uniqueUserIds);

            if (!profError && profiles) {
                profiles.forEach(p => {
                    if (userStats[p.id]) {
                        // Priority: use log name if exists, fallback to profile name
                        if (!userStats[p.id].name || userStats[p.id].name === 'Atleta PulseFit') {
                            userStats[p.id].name = p.name;
                        }
                        userStats[p.id].avatar = p.avatar || userStats[p.id].avatar;
                    }
                });
            }

            // Sort and take top 5
            return Object.values(userStats)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

        } catch (error) {
            console.error('Error calculating leaderboard:', error);
            return [];
        }
    }
};
