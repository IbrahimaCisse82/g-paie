
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

export const AddConventionDialog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    intitule: '',
    description: '',
    date_entree_vigueur: ''
  });

  const addConventionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('conventions')
        .insert([formData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Convention ajoutée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['conventions'] });
      setOpen(false);
      setFormData({
        intitule: '',
        description: '',
        date_entree_vigueur: ''
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
    addConventionMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nouvelle Convention</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle convention</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="intitule">Intitulé *</Label>
            <Input
              id="intitule"
              value={formData.intitule}
              onChange={(e) => setFormData(prev => ({...prev, intitule: e.target.value}))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date_entree_vigueur">Date d'entrée en vigueur</Label>
            <Input
              id="date_entree_vigueur"
              type="date"
              value={formData.date_entree_vigueur}
              onChange={(e) => setFormData(prev => ({...prev, date_entree_vigueur: e.target.value}))}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={addConventionMutation.isPending}>
            {addConventionMutation.isPending ? 'Ajout en cours...' : 'Ajouter la convention'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
