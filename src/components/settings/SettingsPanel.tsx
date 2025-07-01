import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { recalculateAllSalaryElements } from '@/utils/payrollCalculations';
import { Settings, Percent, Save } from 'lucide-react';
import { CompanyInfoForm } from './CompanyInfoForm';

export const SettingsPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    taux_cnss: '',
    taux_ipres: '',
    taux_ir: '',
    taux_cotisation_patronale: '',
    date_application: new Date().toISOString().split('T')[0]
  });

  const { data: parameters, isLoading } = useQuery({
    queryKey: ['payrollParameters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_parameters')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (data?.[0]) {
        setFormData({
          taux_cnss: data[0].taux_cnss?.toString() || '',
          taux_ipres: data[0].taux_ipres?.toString() || '',
          taux_ir: data[0].taux_ir?.toString() || '',
          taux_cotisation_patronale: data[0].taux_cotisation_patronale?.toString() || '',
          date_application: data[0].date_application || new Date().toISOString().split('T')[0]
        });
      }
      
      return data?.[0];
    },
  });

  const saveParametersMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('payroll_parameters')
        .insert({
          taux_cnss: Number(formData.taux_cnss),
          taux_ipres: Number(formData.taux_ipres),
          taux_ir: Number(formData.taux_ir),
          taux_cotisation_patronale: Number(formData.taux_cotisation_patronale),
          date_application: formData.date_application
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Paramètres de paie sauvegardés",
      });
      queryClient.invalidateQueries({ queryKey: ['payrollParameters'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const recalculateMutation = useMutation({
    mutationFn: recalculateAllSalaryElements,
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Tous les salaires ont été recalculés avec les nouveaux paramètres",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveParametersMutation.mutate();
  };

  const handleSaveAndRecalculate = () => {
    saveParametersMutation.mutate();
    // Attendre un peu puis recalculer
    setTimeout(() => {
      recalculateMutation.mutate();
    }, 1000);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <CompanyInfoForm />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Percent className="h-5 w-5" />
            <span>Paramètres de Paie</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taux_cnss">Taux CNSS (%)</Label>
                <Input
                  id="taux_cnss"
                  type="number"
                  step="0.01"
                  value={formData.taux_cnss}
                  onChange={(e) => setFormData(prev => ({...prev, taux_cnss: e.target.value}))}
                  placeholder="7.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taux_ipres">Taux IPRES (%)</Label>
                <Input
                  id="taux_ipres"
                  type="number"
                  step="0.01"
                  value={formData.taux_ipres}
                  onChange={(e) => setFormData(prev => ({...prev, taux_ipres: e.target.value}))}
                  placeholder="6.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taux_ir">Taux IR (%)</Label>
                <Input
                  id="taux_ir"
                  type="number"
                  step="0.01"
                  value={formData.taux_ir}
                  onChange={(e) => setFormData(prev => ({...prev, taux_ir: e.target.value}))}
                  placeholder="10.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taux_cotisation">Taux Cotisation Patronale (%)</Label>
                <Input
                  id="taux_cotisation"
                  type="number"
                  step="0.01"
                  value={formData.taux_cotisation_patronale}
                  onChange={(e) => setFormData(prev => ({...prev, taux_cotisation_patronale: e.target.value}))}
                  placeholder="16.00"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="date_application">Date d'Application</Label>
                <Input
                  id="date_application"
                  type="date"
                  value={formData.date_application}
                  onChange={(e) => setFormData(prev => ({...prev, date_application: e.target.value}))}
                  required
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                type="submit" 
                disabled={saveParametersMutation.isPending}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>
                  {saveParametersMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                </span>
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                onClick={handleSaveAndRecalculate}
                disabled={saveParametersMutation.isPending || recalculateMutation.isPending}
              >
                {(saveParametersMutation.isPending || recalculateMutation.isPending) 
                  ? 'Traitement...' 
                  : 'Sauvegarder et Recalculer'
                }
              </Button>
            </div>
          </form>
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
