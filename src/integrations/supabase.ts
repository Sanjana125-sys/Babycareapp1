// src/integrations/supabase.ts
import { createClient } from '@supabase/supabase-js';

// REPLACE WITH YOUR ACTUAL SUPABASE PROJECT URL AND ANON KEY
const supabaseUrl = 'YOUR_SUPABASE_URL'; 
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
