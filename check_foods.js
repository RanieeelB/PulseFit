import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_ANON_KEY = env['VITE_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkFoods() {
    console.log('Checking foods table...');
    const { data, error, count } = await supabase
        .from('foods')
        .select('*', { count: 'exact' })
        .limit(5);

    if (error) {
        console.error('Error fetching foods:', error);
    } else {
        console.log(`Found ${count} foods.`);
        if (data.length > 0) {
            console.log('First 5 foods:', data.map(f => f.name));
        } else {
            console.log('No foods found. The table is empty.');
        }
    }
}

checkFoods();
