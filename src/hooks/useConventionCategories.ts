
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ConventionCategory {
  id: string;
  convention_collective: string;
  categorie: string;
  taux_horaire: number;
  salaire_base: number;
  statut: string;
  created_at: string;
  updated_at: string;
}

export const useConventionCategories = (conventionCollective?: string) => {
  return useQuery({
    queryKey: ['conventionCategories', conventionCollective],
    queryFn: async (): Promise<ConventionCategory[]> => {
      if (!conventionCollective) return [];
      
      const { data, error } = await supabase
        .rpc('get_convention_categories', { 
          p_convention_collective: conventionCollective 
        });
      
      if (error) {
        console.error('Error fetching convention categories:', error);
        // Fallback: try direct query if RPC doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('convention_categories' as any)
          .select('*')
          .eq('convention_collective', conventionCollective)
          .order('categorie');
        
        if (fallbackError) {
          console.warn('Convention categories table not found, using default categories');
          return [];
        }
        return fallbackData || [];
      }
      return data || [];
    },
    enabled: !!conventionCollective,
  });
};
