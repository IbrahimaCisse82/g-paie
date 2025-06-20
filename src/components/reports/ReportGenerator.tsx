
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';

interface ReportGeneratorProps {
  reportType: 'monthly' | 'costs' | 'evolution' | 'statistics';
  title: string;
}

export const ReportGenerator = ({ reportType, title }: ReportGeneratorProps) => {
  const { toast } = useToast();

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const generateReport = () => {
    // Simulation de génération de rapport
    const reportData = {
      monthly: {
        totalEmployees: employees?.length || 0,
        totalSalary: 15000000,
        averageSalary: 500000
      },
      costs: {
        salaries: 80,
        charges: 15,
        benefits: 5
      },
      evolution: {
        growth: 12,
        trend: 'positive'
      },
      statistics: {
        activeEmployees: employees?.filter(e => e.statut === 'Actif').length || 0,
        cdiEmployees: employees?.filter(e => e.type_contrat === 'CDI').length || 0
      }
    };

    // Générer un fichier CSV simulé
    const csvContent = `Type de Rapport,${title}\nDonnées,${JSON.stringify(reportData[reportType])}\nDate de génération,${new Date().toLocaleDateString()}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Rapport généré",
      description: `Le rapport "${title}" a été téléchargé avec succès`,
    });
  };

  return (
    <Button onClick={generateReport} className="w-full">
      <Download className="h-4 w-4 mr-2" />
      Générer le Rapport
    </Button>
  );
};
