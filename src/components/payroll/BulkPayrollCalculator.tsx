
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { calculateSalaryElements, recalculateAllSalaryElements } from '@/utils/payrollCalculations';
import { Calculator, RefreshCw } from 'lucide-react';

export const BulkPayrollCalculator = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('statut', 'Actif');
      
      if (error) throw error;
      return data;
    },
  });

  const bulkCalculateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMonth || !employees) {
        throw new Error('Veuillez sélectionner un mois et vérifier que les employés sont chargés');
      }

      const results = [];
      for (const employee of employees) {
        try {
          // Utiliser un salaire de base par défaut (à adapter selon vos besoins)
          const salaireBrut = 500000; // Valeur par défaut, à personnaliser
          
          await calculateSalaryElements(
            employee.id,
            salaireBrut,
            selectedMonth,
            Number(selectedYear)
          );
          results.push({ success: true, employee: employee.prenom + ' ' + employee.nom });
        } catch (error) {
          results.push({ 
            success: false, 
            employee: employee.prenom + ' ' + employee.nom, 
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;
      
      toast({
        title: "Calcul terminé",
        description: `${successCount} calculs réussis, ${errorCount} erreurs`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['paySlips'] });
      queryClient.invalidateQueries({ queryKey: ['salaryElements'] });
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
        description: "Tous les éléments de salaire ont été recalculés",
      });
      queryClient.invalidateQueries({ queryKey: ['paySlips'] });
      queryClient.invalidateQueries({ queryKey: ['salaryElements'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const months = [
    { value: 'Janvier', label: 'Janvier' },
    { value: 'Février', label: 'Février' },
    { value: 'Mars', label: 'Mars' },
    { value: 'Avril', label: 'Avril' },
    { value: 'Mai', label: 'Mai' },
    { value: 'Juin', label: 'Juin' },
    { value: 'Juillet', label: 'Juillet' },
    { value: 'Août', label: 'Août' },
    { value: 'Septembre', label: 'Septembre' },
    { value: 'Octobre', label: 'Octobre' },
    { value: 'Novembre', label: 'Novembre' },
    { value: 'Décembre', label: 'Décembre' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Calcul Automatique pour Tous les Employés</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="month">Mois</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le mois" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Année</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={() => bulkCalculateMutation.mutate()}
            className="w-full"
            disabled={bulkCalculateMutation.isPending || !selectedMonth}
          >
            {bulkCalculateMutation.isPending ? 'Calcul en cours...' : 'Calculer pour Tous les Employés'}
          </Button>
          
          <p className="text-sm text-gray-600">
            {employees?.length || 0} employé(s) actif(s) seront traités
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>Recalcul avec Nouveaux Paramètres</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Recalculer tous les éléments de salaire existants avec les derniers paramètres de paie.
          </p>
          <Button 
            onClick={() => recalculateMutation.mutate()}
            variant="outline"
            className="w-full"
            disabled={recalculateMutation.isPending}
          >
            {recalculateMutation.isPending ? 'Recalcul en cours...' : 'Recalculer Tous les Salaires'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
