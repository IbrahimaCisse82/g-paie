
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { EmployeeForm } from './EmployeeForm';
import { SalarieFormData } from '@/types/employee';

export const AddEmployeeDialog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const addEmployeeMutation = useMutation({
    mutationFn: async (formData: SalarieFormData) => {
      // Convert form data to database format
      const dataToInsert = {
        matricule: formData.matricule,
        prenom: formData.prenom,
        nom: formData.nom,
        sexe: formData.sexe,
        date_naissance: formData.dateNaissance || null,
        lieu_naissance: formData.lieuNaissance || null,
        nationalite: formData.nationalite || null,
        statut: formData.statut,
        type_contrat: formData.typeContrat,
        categorie: formData.categorie || null,
        date_entree: formData.dateEntree || null,
        date_sortie: formData.dateFin || null,
        motif_sortie: formData.motifSortie || null,
        date_retour_conge: formData.dateRetourConge || null
      };

      const { data, error } = await supabase
        .from('employees')
        .insert([dataToInsert])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Employé ajouté avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (formData: SalarieFormData) => {
    addEmployeeMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Employé
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel employé</DialogTitle>
        </DialogHeader>
        <EmployeeForm 
          onSubmit={handleSubmit} 
          isLoading={addEmployeeMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};
