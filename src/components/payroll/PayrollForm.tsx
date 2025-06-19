
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { calculateSalaryElements } from '@/utils/payrollCalculations';
import { Plus } from 'lucide-react';

export const PayrollForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    employe_id: '',
    salaire_brut: '',
    mois: '',
    annee: new Date().getFullYear().toString(),
    emploi: '',
    contrat: '',
    situation_contrat: '',
    prime_anciennete: '0',
    prime_logement: '0',
    indemnite_transport: '0'
  });

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, prenom, nom, matricule')
        .eq('statut', 'Actif');
      
      if (error) throw error;
      return data;
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async () => {
      if (!formData.employe_id || !formData.salaire_brut || !formData.mois) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      return calculateSalaryElements(
        formData.employe_id,
        Number(formData.salaire_brut),
        formData.mois,
        Number(formData.annee),
        {
          emploi: formData.emploi || undefined,
          contrat: formData.contrat || undefined,
          situation_contrat: formData.situation_contrat || undefined,
          prime_anciennete: Number(formData.prime_anciennete) || 0,
          prime_logement: Number(formData.prime_logement) || 0,
          indemnite_transport: Number(formData.indemnite_transport) || 0
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Calcul de paie effectué avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['paySlips'] });
      queryClient.invalidateQueries({ queryKey: ['salaryElements'] });
      // Réinitialiser le formulaire
      setFormData({
        employe_id: '',
        salaire_brut: '',
        mois: '',
        annee: new Date().getFullYear().toString(),
        emploi: '',
        contrat: '',
        situation_contrat: '',
        prime_anciennete: '0',
        prime_logement: '0',
        indemnite_transport: '0'
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
    calculateMutation.mutate();
  };

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Calcul Manuel de Paie</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="employe_id">Employé *</Label>
              <Select 
                value={formData.employe_id} 
                onValueChange={(value) => setFormData(prev => ({...prev, employe_id: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.matricule} - {employee.prenom} {employee.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaire_brut">Salaire Brut (FCFA) *</Label>
              <Input
                id="salaire_brut"
                type="number"
                value={formData.salaire_brut}
                onChange={(e) => setFormData(prev => ({...prev, salaire_brut: e.target.value}))}
                placeholder="500000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mois">Mois *</Label>
              <Select 
                value={formData.mois} 
                onValueChange={(value) => setFormData(prev => ({...prev, mois: value}))}
              >
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
              <Label htmlFor="annee">Année *</Label>
              <Input
                id="annee"
                type="number"
                value={formData.annee}
                onChange={(e) => setFormData(prev => ({...prev, annee: e.target.value}))}
                min="2020"
                max="2030"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prime_anciennete">Prime d'Ancienneté (FCFA)</Label>
              <Input
                id="prime_anciennete"
                type="number"
                value={formData.prime_anciennete}
                onChange={(e) => setFormData(prev => ({...prev, prime_anciennete: e.target.value}))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prime_logement">Prime de Logement (FCFA)</Label>
              <Input
                id="prime_logement"
                type="number"
                value={formData.prime_logement}
                onChange={(e) => setFormData(prev => ({...prev, prime_logement: e.target.value}))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="indemnite_transport">Indemnité de Transport (FCFA)</Label>
              <Input
                id="indemnite_transport"
                type="number"
                value={formData.indemnite_transport}
                onChange={(e) => setFormData(prev => ({...prev, indemnite_transport: e.target.value}))}
                placeholder="0"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={calculateMutation.isPending}
          >
            {calculateMutation.isPending ? 'Calcul en cours...' : 'Calculer la Paie'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
