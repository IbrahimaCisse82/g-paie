import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SalarieFormData } from '@/types/employee';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useConventionCategories } from '@/hooks/useConventionCategories';
import { CategoryInfo } from './CategoryInfo';

interface EmployeeFormProps {
  onSubmit: (data: SalarieFormData) => void;
  initialData?: Partial<SalarieFormData>;
  isLoading?: boolean;
}

export const EmployeeForm = ({ onSubmit, initialData, isLoading }: EmployeeFormProps) => {
  const { data: companyInfo } = useCompanyInfo();
  const { data: categories } = useConventionCategories(companyInfo?.convention_collective);
  
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
    dateRetourConge: initialData?.dateRetourConge || '',
    tauxHoraire: initialData?.tauxHoraire || 0,
    salaireBase: initialData?.salaireBase || 0
  });

  // Mettre à jour automatiquement la convention collective de l'entreprise
  useEffect(() => {
    if (companyInfo?.convention_collective && !initialData?.conventionCollective) {
      setFormData(prev => ({
        ...prev,
        conventionCollective: companyInfo.convention_collective
      }));
    }
  }, [companyInfo, initialData]);

  // Générer automatiquement les données salariales lors de la sélection de catégorie
  const handleCategoryChange = (selectedCategory: string) => {
    // Trouver les données de la catégorie sélectionnée
    const categoryData = categories?.find(cat => cat.categorie === selectedCategory);
    
    if (categoryData) {
      console.log(`Catégorie ${selectedCategory} sélectionnée:`, {
        taux_horaire: categoryData.taux_horaire,
        salaire_base: categoryData.salaire_base,
        statut: categoryData.statut
      });
      
      setFormData(prev => ({
        ...prev,
        categorie: selectedCategory,
        tauxHoraire: categoryData.taux_horaire,
        salaireBase: categoryData.salaire_base,
        statut: categoryData.statut
      }));
    } else {
      setFormData(prev => ({ ...prev, categorie: selectedCategory }));
    }
  };

  // Obtenir les données de la catégorie sélectionnée pour l'affichage
  const selectedCategoryData = categories?.find(cat => cat.categorie === formData.categorie);

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
          <Select value={formData.categorie} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.categorie}>
                  {category.categorie} ({category.salaire_base.toLocaleString()} FCFA)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Affichage des informations automatiques de la catégorie */}
      {selectedCategoryData && (
        <CategoryInfo 
          tauxHoraire={selectedCategoryData.taux_horaire}
          salaireBase={selectedCategoryData.salaire_base}
          statut={selectedCategoryData.statut}
        />
      )}

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
          readOnly
          className="bg-gray-100"
          placeholder="Définie dans le profil de l'entreprise"
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
