import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification des variables d'environnement
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not defined in environment variables');
  console.error('Please check your .env file or Vercel environment variables');
  throw new Error('VITE_SUPABASE_URL is required. Please check your environment configuration.');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not defined in environment variables');
  console.error('Please check your .env file or Vercel environment variables');
  throw new Error('VITE_SUPABASE_ANON_KEY is required. Please check your environment configuration.');
}

console.log('✅ Supabase environment variables loaded successfully');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey.substring(0, 10) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 