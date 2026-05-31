// Handles administrative Supabase actions from the backend.
import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// WARNING: Only use Service Role keys on the Backend!
const supabaseUrl = env.supabaseUrl || 'https://placeholder-project.supabase.co';
const supabaseServiceKey = env.supabaseServiceKey;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey,
    {
        auth: { autoRefreshToken: false, persistSession: false },
    }
);