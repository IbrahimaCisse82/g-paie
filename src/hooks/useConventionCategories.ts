
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
      
      try {
        const { data, error } = await supabase
          .from('convention_categories')
          .select('*')
          .eq('convention_collective', conventionCollective)
          .order('salaire_base', { ascending: true });
        
        if (error) {
          console.error('Error fetching convention categories:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Failed to fetch convention categories:', error);
        return [];
      }
    },
    enabled: !!conventionCollective,
  });
};

// Hook pour récupérer toutes les catégories (pour afficher le barème complet)
export const useAllConventionCategories = () => {
  return useQuery({
    queryKey: ['allConventionCategories'],
    queryFn: async (): Promise<ConventionCategory[]> => {
      try {
        const { data, error } = await supabase
          .from('convention_categories')
          .select('*')
          .order('convention_collective', { ascending: true })
          .order('salaire_base', { ascending: true });
        
        if (error) {
          console.error('Error fetching all convention categories:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Failed to fetch all convention categories:', error);
        return [];
      }
    },
  });
};
