import { createClient } from '@supabase/supabase-js';

// Nutze die Keys aus der .env Datei (oder Demo-Fallback, falls nicht vorhanden)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const hasValidSupabaseKeys = () => {
    return import.meta.env.VITE_SUPABASE_URL !== undefined;
};
