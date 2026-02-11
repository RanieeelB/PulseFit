-- Custom Workout Plan for User e5d81f0d-cb30-4694-8ae9-735fea3b2c34

-- Delete existing workouts for this user to avoid duplicates if re-running (Optional, be careful)
-- DELETE FROM workouts WHERE user_id = 'e5d81f0d-cb30-4694-8ae9-735fea3b2c34';

-- Day 1: Pernas & Glúteos (Posterior)
INSERT INTO workouts (user_id, title, description, icon, duration, intensity, status, created_at, order_index, exercises)
VALUES (
    'e5d81f0d-cb30-4694-8ae9-735fea3b2c34',
    'Pernas & Glúteos (Posterior)',
    'Foco em posterior de coxa e glúteos',
    'fitness_center',
    '60m',
    'High',
    'pending',
    NOW(),
    1,
    '[
        {
            "id": 1, 
            "name": "Levantamento terra romeno com halter", 
            "sets": [{"reps": "10-12", "weight": 0}, {"reps": "10-12", "weight": 0}, {"reps": "10-12", "weight": 0}]
        },
        {
            "id": 2, 
            "name": "Mesa flexora", 
            "sets": [{"reps": "12-15", "weight": 0}, {"reps": "12-15", "weight": 0}, {"reps": "12-15", "weight": 0}]
        },
        {
            "id": 3, 
            "name": "Cadeira abdutora", 
            "sets": [{"reps": "15-20", "weight": 0}, {"reps": "15-20", "weight": 0}, {"reps": "15-20", "weight": 0}]
        },
        {
            "id": 4, 
            "name": "Glúteo no cabo (extensão de quadril)", 
            "sets": [{"reps": "12-15", "weight": 0}, {"reps": "12-15", "weight": 0}, {"reps": "12-15", "weight": 0}]
        },
        {
            "id": 5, 
            "name": "Passada andando com halteres", 
            "sets": [{"reps": "10", "weight": 0}, {"reps": "10", "weight": 0}, {"reps": "10", "weight": 0}]
        }
    ]'::jsonb
);

-- Day 2: Superiores + Core
INSERT INTO workouts (user_id, title, description, icon, duration, intensity, status, created_at, order_index, exercises)
VALUES (
    'e5d81f0d-cb30-4694-8ae9-735fea3b2c34',
    'Superiores + Core',
    'Peito, Costas, Ombros e Braços',
    'hardware',
    '50m',
    'Med',
    'pending',
    NOW() + interval '1 second',
    2,
    '[
        {
            "id": 1, 
            "name": "Supino reto na máquina (ID 1)", 
            "sets": [{"reps": "10-12", "weight": 0}, {"reps": "10-12", "weight": 0}, {"reps": "10-12", "weight": 0}]
        },
        {
            "id": 2, 
            "name": "Puxada frontal na máquina", 
            "sets": [{"reps": "10-12", "weight": 0}, {"reps": "10-12", "weight": 0}, {"reps": "10-12", "weight": 0}]
        },
        {
            "id": 3, 
            "name": "Elevação lateral com halteres", 
            "sets": [{"reps": "12-15", "weight": 0}, {"reps": "12-15", "weight": 0}, {"reps": "12-15", "weight": 0}]
        },
        {
            "id": 4, 
            "name": "Tríceps na polia", 
            "sets": [{"reps": "12-15", "weight": 0}, {"reps": "12-15", "weight": 0}, {"reps": "12-15", "weight": 0}]
        },
        {
            "id": 5, 
            "name": "Rosca direta com halteres", 
            "sets": [{"reps": "12", "weight": 0}, {"reps": "12", "weight": 0}, {"reps": "12", "weight": 0}]
        },
        {
            "id": 6, 
            "name": "Prancha abdominal", 
            "sets": [{"reps": "30-40s", "weight": 0}, {"reps": "30-40s", "weight": 0}, {"reps": "30-40s", "weight": 0}]
        }
    ]'::jsonb
);

-- Day 3: Pernas & Glúteos (Anterior)
INSERT INTO workouts (user_id, title, description, icon, duration, intensity, status, created_at, order_index, exercises)
VALUES (
    'e5d81f0d-cb30-4694-8ae9-735fea3b2c34',
    'Pernas & Glúteos (Anterior)',
    'Foco em quadríceps',
    'directions_run',
    '60m',
    'High',
    'pending',
    NOW() + interval '2 seconds',
    3,
    '[
        {
            "id": 1, 
            "name": "Agachamento guiado (Smith)", 
            "sets": [{"reps": "10-12", "weight": 0}, {"reps": "10-12", "weight": 0}, {"reps": "10-12", "weight": 0}]
        },
        {
            "id": 2, 
            "name": "Cadeira extensora", 
            "sets": [{"reps": "12-15", "weight": 0}, {"reps": "12-15", "weight": 0}, {"reps": "12-15", "weight": 0}]
        },
        {
            "id": 3, 
            "name": "Leg press 45°", 
            "sets": [{"reps": "12", "weight": 0}, {"reps": "12", "weight": 0}, {"reps": "12", "weight": 0}]
        },
        {
            "id": 4, 
            "name": "Afundo no lugar", 
            "sets": [{"reps": "10", "weight": 0}, {"reps": "10", "weight": 0}, {"reps": "10", "weight": 0}]
        },
        {
            "id": 5, 
            "name": "Panturrilha em pé na máquina", 
            "sets": [{"reps": "15-20", "weight": 0}, {"reps": "15-20", "weight": 0}, {"reps": "15-20", "weight": 0}]
        }
    ]'::jsonb
);

-- Day 4: Superiores + Cardio
INSERT INTO workouts (user_id, title, description, icon, duration, intensity, status, created_at, order_index, exercises)
VALUES (
    'e5d81f0d-cb30-4694-8ae9-735fea3b2c34',
    'Superiores + Cardio',
    'Treino metabólico',
    'favorite',
    '50m',
    'High',
    'pending',
    NOW() + interval '3 seconds',
    4,
    '[
        {
            "id": 1, 
            "name": "Supino inclinado na máquina (ID 2)", 
            "sets": [{"reps": "10", "weight": 0}, {"reps": "10", "weight": 0}, {"reps": "10", "weight": 0}]
        },
        {
            "id": 2, 
            "name": "Remada baixa na máquina", 
            "sets": [{"reps": "10-12", "weight": 0}, {"reps": "10-12", "weight": 0}, {"reps": "10-12", "weight": 0}]
        },
        {
            "id": 3, 
            "name": "Crucifixo no cabo (ID 3)", 
            "sets": [{"reps": "12-15", "weight": 0}, {"reps": "12-15", "weight": 0}, {"reps": "12-15", "weight": 0}]
        },
        {
            "id": 4, 
            "name": "Desenvolvimento com halteres", 
            "sets": [{"reps": "10", "weight": 0}, {"reps": "10", "weight": 0}, {"reps": "10", "weight": 0}]
        },
        {
            "id": 5, 
            "name": "Cardio: Esteira / bike / escada", 
            "sets": [{"reps": "20-30 min", "weight": 0}]
        }
    ]'::jsonb
);

-- Day 5: Glúteos + Abdômen
INSERT INTO workouts (user_id, title, description, icon, duration, intensity, status, created_at, order_index, exercises)
VALUES (
    'e5d81f0d-cb30-4694-8ae9-735fea3b2c34',
    'Glúteos + Abdômen',
    'Foco final na semana',
    'spa',
    '50m',
    'Med',
    'pending',
    NOW() + interval '4 seconds',
    5,
    '[
        {
            "id": 1, 
            "name": "Hip thrust na máquina ou barra", 
            "sets": [{"reps": "10-12", "weight": 0}, {"reps": "10-12", "weight": 0}, {"reps": "10-12", "weight": 0}, {"reps": "10-12", "weight": 0}]
        },
        {
            "id": 2, 
            "name": "Cadeira abdutora", 
            "sets": [{"reps": "20", "weight": 0}, {"reps": "20", "weight": 0}, {"reps": "20", "weight": 0}]
        },
        {
            "id": 3, 
            "name": "Glúteo no cabo (coice)", 
            "sets": [{"reps": "15", "weight": 0}, {"reps": "15", "weight": 0}, {"reps": "15", "weight": 0}]
        },
        {
            "id": 4, 
            "name": "Abdominal infra no banco", 
            "sets": [{"reps": "15", "weight": 0}, {"reps": "15", "weight": 0}, {"reps": "15", "weight": 0}]
        },
        {
            "id": 5, 
            "name": "Abdominal oblíquo no cabo", 
            "sets": [{"reps": "12", "weight": 0}, {"reps": "12", "weight": 0}, {"reps": "12", "weight": 0}]
        }
    ]'::jsonb
);
