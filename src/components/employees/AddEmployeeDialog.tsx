
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { EmployeeDetailForm } from './EmployeeDetailForm';

export const AddEmployeeDialog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    matricule: '',
    sexe: 'M',
    date_naissance: '',
    lieu_naissance: '',
    nationalite: '',
    poste: '',
    type_contrat: 'CDI',
    statut: 'Actif',
    date_entree: '',
    date_sortie: '',
    telephone: '',
    email: '',
    adresse: '',
    ville: '',
    code_postal: '',
    situation_familiale: '',
    nombre_enfants: 0,
    numero_cnss: '',
    numero_ipres: '',
    salaire_base: 0,
    sur_salaire: 0,
    prime_anciennete_taux: 0,
    indemnite_transport: 0,
    diplomes: '',
    contact_urgence_nom: '',
    contact_urgence_telephone: '',
    rib: ''
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async () => {
      // Préparer les données en convertissant les chaînes vides en null pour les champs optionnels
      const dataToInsert = {
        ...formData,
        date_naissance: formData.date_naissance || null,
        lieu_naissance: formData.lieu_naissance || null,
        nationalite: formData.nationalite || null,
        date_entree: formData.date_entree || null,
        date_sortie: formData.date_sortie || null,
        telephone: formData.telephone || null,
        email: formData.email || null,
        adresse: formData.adresse || null,
        ville: formData.ville || null,
        code_postal: formData.code_postal || null,
        situation_familiale: formData.situation_familiale || null,
        numero_cnss: formData.numero_cnss || null,
        numero_ipres: formData.numero_ipres || null,
        diplomes: formData.diplomes || null,
        contact_urgence_nom: formData.contact_urgence_nom || null,
        contact_urgence_telephone: formData.contact_urgence_telephone || null,
        rib: formData.rib || null
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
      // Reset form
      setFormData({
        nom: '',
        prenom: '',
        matricule: '',
        sexe: 'M',
        date_naissance: '',
        lieu_naissance: '',
        nationalite: '',
        poste: '',
        type_contrat: 'CDI',
        statut: 'Actif',
        date_entree: '',
        date_sortie: '',
        telephone: '',
        email: '',
        adresse: '',
        ville: '',
        code_postal: '',
        situation_familiale: '',
        nombre_enfants: 0,
        numero_cnss: '',
        numero_ipres: '',
        salaire_base: 0,
        sur_salaire: 0,
        prime_anciennete_taux: 0,
        indemnite_transport: 0,
        diplomes: '',
        contact_urgence_nom: '',
        contact_urgence_telephone: '',
        rib: ''
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
    addEmployeeMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Employé
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel employé</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <EmployeeDetailForm formData={formData} setFormData={setFormData} />
          
          <Button type="submit" className="w-full" disabled={addEmployeeMutation.isPending}>
            {addEmployeeMutation.isPending ? 'Ajout en cours...' : 'Ajouter l\'employé'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
