
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

// Mock data for development - replace with real data once DB is set up
const getMockCategories = (conventionCollective: string): ConventionCategory[] => {
  const mockData: ConventionCategory[] = [
    {
      id: '1',
      convention_collective: 'COMMERCE',
      categorie: '1_er A',
      taux_horaire: 407.927,
      salaire_base: 70706,
      statut: 'EMPLOYES',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2', 
      convention_collective: 'COMMERCE',
      categorie: '1_er B',
      taux_horaire: 431.951,
      salaire_base: 74870,
      statut: 'EMPLOYES',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      convention_collective: 'COMMERCE', 
      categorie: '7_ème A',
      taux_horaire: 607.754,
      salaire_base: 105342,
      statut: 'Agents de maîtrise',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return mockData.filter(cat => cat.convention_collective === conventionCollective);
};

export const useConventionCategories = (conventionCollective?: string) => {
  return useQuery({
    queryKey: ['conventionCategories', conventionCollective],
    queryFn: async (): Promise<ConventionCategory[]> => {
      if (!conventionCollective) return [];
      
      // At this point, conventionCollective is guaranteed to be a string
      const ccValue = conventionCollective as string;
      
      try {
        // Try to use RPC function first
        const { data, error } = await supabase.rpc('get_convention_categories', { 
          p_convention_collective: ccValue 
        });
        
        if (!error && data) {
          return data;
        }
      } catch (rpcError) {
        console.log('RPC function not available, using mock data');
      }

      // For now, return mock data while the database table is being set up
      console.log('Using mock convention categories data');
      return getMockCategories(ccValue);
    },
    enabled: !!conventionCollective,
  });
};
