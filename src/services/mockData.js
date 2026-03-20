
export const MOCK_WORKOUTS = [
    {
        id: 'w1',
        title: 'Peito e Tríceps',
        description: 'Foco em hipertrofia',
        duration: '60m',
        intensity: 'Alta',
        icon: 'fitness_center',
        status: 'pending',
        exercises: [
            { id: 1, name: 'Supino Reto', reps: '12', sets: 4, weight: '60' },
            { id: 2, name: 'Supino Inclinado', reps: '10', sets: 3, weight: '50' },
            { id: 3, name: 'Tríceps Corda', reps: '15', sets: 4, weight: '25' }
        ]
    },
    {
        id: 'w2',
        title: 'Costas e Biceps',
        description: 'Largura e espessura',
        duration: '55m',
        intensity: 'Alta',
        icon: 'fitness_center',
        status: 'completed',
        exercises: [
            { id: 4, name: 'Puxada Frente', reps: '12', sets: 4, weight: '55' },
            { id: 5, name: 'Remada Baixa', reps: '10', sets: 3, weight: '60' },
            { id: 6, name: 'Rosca Direta', reps: '12', sets: 4, weight: '30' }
        ]
    }
];

export const MOCK_WEEKLY_STATS = {
    workouts: 4,
    minutes: 240,
    calories: '2.4k',
    daysCompleted: [1, 2, 4, 5]
};

export const MOCK_STREAK = {
    current: 12,
    best: 21
};

export const MOCK_LEADERBOARD = {
    ranked: [
        { user_id: '1', name: 'João Silva', avatar: 'https://i.pravatar.cc/150?u=1', count: 6 },
        { user_id: '2', name: 'Maria Souza', avatar: 'https://i.pravatar.cc/150?u=2', count: 5 },
        { user_id: 'demo-user-id', name: 'Visitante Demo (Você)', avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop', count: 4 },
        { user_id: '3', name: 'Pedro Alves', avatar: 'https://i.pravatar.cc/150?u=3', count: 3 },
        { user_id: '4', name: 'Ana Costa', avatar: 'https://i.pravatar.cc/150?u=4', count: 2 }
    ],
    currentUserId: 'demo-user-id'
};

export const MOCK_DIET_PROFILE = {
    gender: 'male',
    weight: 82.5,
    height: 185,
    age: 28,
    activityLevel: 'active',
    goal: 'gain_muscle',
    customMacros: { protein: 30, carbs: 45, fat: 25 }
};

export const MOCK_WEIGHT_HISTORY = [
    { id: '1', weight: 85, date: '2024-01-01', user_id: 'demo' },
    { id: '2', weight: 84.2, date: '2024-01-15', user_id: 'demo' },
    { id: '3', weight: 83.5, date: '2024-02-01', user_id: 'demo' },
    { id: '4', weight: 82.5, date: new Date().toISOString(), user_id: 'demo' }
];

export const MOCK_FOODS = [
    { id: 1, name: 'Frango Grelhado', calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: '100g' },
    { id: 2, name: 'Arroz Integral', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, unit: '100g' },
    { id: 3, name: 'Ovo Cozido', calories: 155, protein: 13, carbs: 1.1, fat: 11, unit: '100g' },
    { id: 4, name: 'Batata Doce Cozida', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, unit: '100g' }
];
