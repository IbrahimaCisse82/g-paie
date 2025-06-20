
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

export const AddEmployeeDialog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    matricule: '',
    poste: '',
    type_contrat: 'CDI',
    statut: 'Actif',
    sexe: 'M'
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .insert([formData])
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
      setFormData({
        nom: '',
        prenom: '',
        matricule: '',
        poste: '',
        type_contrat: 'CDI',
        statut: 'Actif',
        sexe: 'M'
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel employé</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({...prev, nom: e.target.value}))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prenom">Prénom *</Label>
            <Input
              id="prenom"
              value={formData.prenom}
              onChange={(e) => setFormData(prev => ({...prev, prenom: e.target.value}))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="matricule">Matricule *</Label>
            <Input
              id="matricule"
              value={formData.matricule}
              onChange={(e) => setFormData(prev => ({...prev, matricule: e.target.value}))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sexe">Sexe *</Label>
            <Select value={formData.sexe} onValueChange={(value) => setFormData(prev => ({...prev, sexe: value}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculin</SelectItem>
                <SelectItem value="F">Féminin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="poste">Poste</Label>
            <Input
              id="poste"
              value={formData.poste}
              onChange={(e) => setFormData(prev => ({...prev, poste: e.target.value}))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type_contrat">Type de contrat</Label>
            <Select value={formData.type_contrat} onValueChange={(value) => setFormData(prev => ({...prev, type_contrat: value}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CDI">CDI</SelectItem>
                <SelectItem value="CDD">CDD</SelectItem>
                <SelectItem value="Stage">Stage</SelectItem>
                <SelectItem value="Freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full" disabled={addEmployeeMutation.isPending}>
            {addEmployeeMutation.isPending ? 'Ajout en cours...' : 'Ajouter l\'employé'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
