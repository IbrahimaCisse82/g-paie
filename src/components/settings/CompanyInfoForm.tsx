
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, Save } from 'lucide-react';

const CONVENTIONS_COLLECTIVES = [
  'Convention collective interprofessionnelle',
  'Convention collective du commerce',
  'Convention collective de l\'industrie',
  'Convention collective des services',
  'Convention collective du bâtiment et travaux publics',
  'Convention collective de l\'agriculture',
  'Convention collective des transports',
  'Convention collective de la banque et assurance',
  'Convention collective de l\'hôtellerie et restauration',
  'Convention collective des télécommunications'
];

export const CompanyInfoForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    ville: '',
    pays: '',
    telephone: '',
    email: '',
    ninea: '',
    rccm: '',
    convention_collective: ''
  });

  const { data: companyInfo, isLoading } = useQuery({
    queryKey: ['companyInfo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (data?.[0]) {
        setFormData({
          nom: data[0].nom || '',
          adresse: data[0].adresse || '',
          ville: data[0].ville || '',
          pays: data[0].pays || '',
          telephone: data[0].telephone || '',
          email: data[0].email || '',
          ninea: data[0].ninea || '',
          rccm: data[0].rccm || '',
          convention_collective: data[0].convention_collective || ''
        });
      }
      
      return data?.[0];
    },
  });

  const saveCompanyInfoMutation = useMutation({
    mutationFn: async () => {
      if (companyInfo) {
        // Mise à jour
        const { error } = await supabase
          .from('company_info')
          .update({
            nom: formData.nom,
            adresse: formData.adresse,
            ville: formData.ville,
            pays: formData.pays,
            telephone: formData.telephone,
            email: formData.email,
            ninea: formData.ninea,
            rccm: formData.rccm,
            convention_collective: formData.convention_collective,
            updated_at: new Date().toISOString()
          })
          .eq('id', companyInfo.id);
        
        if (error) throw error;
      } else {
        // Création
        const { error } = await supabase
          .from('company_info')
          .insert({
            nom: formData.nom,
            adresse: formData.adresse,
            ville: formData.ville,
            pays: formData.pays,
            telephone: formData.telephone,
            email: formData.email,
            ninea: formData.ninea,
            rccm: formData.rccm,
            convention_collective: formData.convention_collective
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Informations de l'entreprise sauvegardées",
      });
      queryClient.invalidateQueries({ queryKey: ['companyInfo'] });
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
    saveCompanyInfoMutation.mutate();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Informations de l'Entreprise</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom de l'entreprise *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                placeholder="Nom de votre entreprise"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@entreprise.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                placeholder="+221 XX XXX XX XX"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ninea">NINEA</Label>
              <Input
                id="ninea"
                value={formData.ninea}
                onChange={(e) => handleInputChange('ninea', e.target.value)}
                placeholder="Numéro NINEA"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rccm">RCCM</Label>
              <Input
                id="rccm"
                value={formData.rccm}
                onChange={(e) => handleInputChange('rccm', e.target.value)}
                placeholder="Numéro RCCM"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pays">Pays</Label>
              <Input
                id="pays"
                value={formData.pays}
                onChange={(e) => handleInputChange('pays', e.target.value)}
                placeholder="Sénégal"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                placeholder="Adresse complète de l'entreprise"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Input
                id="ville"
                value={formData.ville}
                onChange={(e) => handleInputChange('ville', e.target.value)}
                placeholder="Dakar"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="convention">Convention Collective</Label>
              <Select
                value={formData.convention_collective}
                onValueChange={(value) => handleInputChange('convention_collective', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une convention" />
                </SelectTrigger>
                <SelectContent>
                  {CONVENTIONS_COLLECTIVES.map((convention) => (
                    <SelectItem key={convention} value={convention}>
                      {convention}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={saveCompanyInfoMutation.isPending}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>
              {saveCompanyInfoMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
            </span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
