import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Configuration de développement vs production
const isDevelopment = import.meta.env.MODE === 'development';

// Vérification des variables d'environnement
if (!supabaseUrl) {
  const error = '❌ VITE_SUPABASE_URL is not defined in environment variables';
  console.error(error);
  if (isDevelopment) {
    console.error('Please check your .env file or Vercel environment variables');
  }
  throw new Error('VITE_SUPABASE_URL is required. Please check your environment configuration.');
}

if (!supabaseAnonKey) {
  const error = '❌ VITE_SUPABASE_ANON_KEY is not defined in environment variables';
  console.error(error);
  if (isDevelopment) {
    console.error('Please check your .env file or Vercel environment variables');
  }
  throw new Error('VITE_SUPABASE_ANON_KEY is required. Please check your environment configuration.');
}

if (isDevelopment) {
  console.log('✅ Supabase environment variables loaded successfully');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey.substring(0, 10) + '...');
}

// Configuration du client Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'g-paie-app',
    },
  },
});

// Utilitaires pour les erreurs Supabase
export const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  
  if (error?.details) {
    return error.details;
  }
  
  return 'Une erreur inattendue est survenue';
};

// Wrapper pour les requêtes avec gestion d'erreurs
export const supabaseQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T> => {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      throw new Error(handleSupabaseError(error));
    }
    
    return data as T;
  } catch (error) {
    console.error('Supabase query error:', error);
    throw error;
  }
};

// Middleware pour la pagination
export const paginatedQuery = async <T>(
  tableName: string,
  page: number = 1,
  limit: number = 10,
  filters?: Record<string, any>
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  let query = supabase
    .from(tableName)
    .select('*', { count: 'exact' })
    .range(from, to);
  
  // Appliquer les filtres
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });
  }
  
  const { data, error, count } = await query;
  
  if (error) {
    throw new Error(handleSupabaseError(error));
  }
  
  return {
    data: data || [],
    count: count || 0,
    page,
    limit,
    total_pages: Math.ceil((count || 0) / limit)
  };
};