
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SalarieFormData } from '@/types/employee';

interface EmployeeFormProps {
  onSubmit: (data: SalarieFormData) => void;
  initialData?: Partial<SalarieFormData>;
  isLoading?: boolean;
}

export const EmployeeForm = ({ onSubmit, initialData, isLoading }: EmployeeFormProps) => {
  const [formData, setFormData] = useState<SalarieFormData>({
    matricule: initialData?.matricule || '',
    prenom: initialData?.prenom || '',
    nom: initialData?.nom || '',
    sexe: initialData?.sexe || 'M',
    dateNaissance: initialData?.dateNaissance || '',
    lieuNaissance: initialData?.lieuNaissance || '',
    nationalite: initialData?.nationalite || '',
    statut: initialData?.statut || 'Actif',
    typeContrat: initialData?.typeContrat || 'CDI',
    categorie: initialData?.categorie || '',
    conventionCollective: initialData?.conventionCollective || '',
    dateEntree: initialData?.dateEntree || '',
    dateFin: initialData?.dateFin || '',
    motifSortie: initialData?.motifSortie || '',
    dateRetourConge: initialData?.dateRetourConge || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
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
          <Label htmlFor="categorie">Catégorie</Label>
          <Input
            id="categorie"
            value={formData.categorie}
            onChange={(e) => setFormData(prev => ({...prev, categorie: e.target.value}))}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => setFormData(prev => ({...prev, nom: e.target.value}))}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sexe">Sexe *</Label>
          <Select value={formData.sexe} onValueChange={(value: "M" | "F") => setFormData(prev => ({...prev, sexe: value}))}>
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
          <Label htmlFor="dateNaissance">Date de naissance *</Label>
          <Input
            id="dateNaissance"
            type="date"
            value={formData.dateNaissance}
            onChange={(e) => setFormData(prev => ({...prev, dateNaissance: e.target.value}))}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lieuNaissance">Lieu de naissance *</Label>
          <Input
            id="lieuNaissance"
            value={formData.lieuNaissance}
            onChange={(e) => setFormData(prev => ({...prev, lieuNaissance: e.target.value}))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationalite">Nationalité *</Label>
          <Input
            id="nationalite"
            value={formData.nationalite}
            onChange={(e) => setFormData(prev => ({...prev, nationalite: e.target.value}))}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="statut">Statut</Label>
          <Select value={formData.statut} onValueChange={(value) => setFormData(prev => ({...prev, statut: value}))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Actif">Actif</SelectItem>
              <SelectItem value="Inactif">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="typeContrat">Type de contrat</Label>
          <Select value={formData.typeContrat} onValueChange={(value) => setFormData(prev => ({...prev, typeContrat: value}))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CDI">CDI</SelectItem>
              <SelectItem value="CDD">CDD</SelectItem>
              <SelectItem value="Stage">Stage</SelectItem>
              <SelectItem value="Freelance">Freelance</SelectItem>
              <SelectItem value="Consultant">Consultant</SelectItem>
              <SelectItem value="Apprentissage">Apprentissage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="conventionCollective">Convention collective</Label>
        <Input
          id="conventionCollective"
          value={formData.conventionCollective}
          onChange={(e) => setFormData(prev => ({...prev, conventionCollective: e.target.value}))}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateEntree">Date d'entrée *</Label>
          <Input
            id="dateEntree"
            type="date"
            value={formData.dateEntree}
            onChange={(e) => setFormData(prev => ({...prev, dateEntree: e.target.value}))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateFin">Date de fin</Label>
          <Input
            id="dateFin"
            type="date"
            value={formData.dateFin}
            onChange={(e) => setFormData(prev => ({...prev, dateFin: e.target.value}))}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="motifSortie">Motif de sortie</Label>
          <Input
            id="motifSortie"
            value={formData.motifSortie}
            onChange={(e) => setFormData(prev => ({...prev, motifSortie: e.target.value}))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateRetourConge">Date de retour de congé</Label>
          <Input
            id="dateRetourConge"
            type="date"
            value={formData.dateRetourConge}
            onChange={(e) => setFormData(prev => ({...prev, dateRetourConge: e.target.value}))}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </form>
  );
};
