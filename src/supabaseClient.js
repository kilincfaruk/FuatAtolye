import { createClient } from '@supabase/supabase-js';

// Supabase Configuration - Environment variables from .env file
// Vite uses VITE_ prefix for environment variables
// .env dosyasında VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY tanımlı olmalı
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Environment variable'lar kontrolü
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
  throw new Error(
    `Supabase configuration missing! Please set ${missingVars.join(' and ')} in environment variables. Current env: ${JSON.stringify({ hasUrl: !!supabaseUrl, hasKey: !!supabaseAnonKey })}`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
