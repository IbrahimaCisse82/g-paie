
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Percent } from 'lucide-react';

export const SettingsPanel = () => {
  const { data: parameters, isLoading } = useQuery({
    queryKey: ['payrollParameters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_parameters')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0];
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Percent className="h-5 w-5" />
            <span>Paramètres de Paie</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="taux_cnss">Taux CNSS (%)</Label>
              <Input
                id="taux_cnss"
                type="number"
                step="0.01"
                defaultValue={parameters?.taux_cnss || 0}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taux_ipres">Taux IPRES (%)</Label>
              <Input
                id="taux_ipres"
                type="number"
                step="0.01"
                defaultValue={parameters?.taux_ipres || 0}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taux_ir">Taux IR (%)</Label>
              <Input
                id="taux_ir"
                type="number"
                step="0.01"
                defaultValue={parameters?.taux_ir || 0}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taux_cotisation">Taux Cotisation Patronale (%)</Label>
              <Input
                id="taux_cotisation"
                type="number"
                step="0.01"
                defaultValue={parameters?.taux_cotisation_patronale || 0}
              />
            </div>
          </div>
          
          <Button>
            Sauvegarder les Paramètres
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Conventions Collectives</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Gérez les conventions collectives de votre entreprise
          </p>
          <Button variant="outline">
            Gérer les Conventions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
