
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useConventionCategories = (conventionCollective?: string) => {
  return useQuery({
    queryKey: ['conventionCategories', conventionCollective],
    queryFn: async () => {
      if (!conventionCollective) return [];
      
      const { data, error } = await supabase
        .from('convention_categories')
        .select('*')
        .eq('convention_collective', conventionCollective)
        .order('categorie');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!conventionCollective,
  });
};
