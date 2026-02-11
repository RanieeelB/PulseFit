-- Add email column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Optional: Update existing profiles with emails from auth.users (Requires special privileges or running in Supabase Dashboard SQL Editor)
-- UPDATE profiles p
-- SET email = u.email
-- FROM auth.users u
-- WHERE p.id = u.id;
