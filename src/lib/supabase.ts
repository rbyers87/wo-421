import { createClient } from '@supabase/supabase-js';
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log(import.meta.env.VITE_SUPABASE_URL);  // Log to verify the URL
    console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);  // Log to verify the anon key
