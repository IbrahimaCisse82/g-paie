
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmployeeFormData {
  nom: string;
  prenom: string;
  matricule: string;
  sexe: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  poste: string;
  type_contrat: string;
  statut: string;
  date_entree: string;
  date_sortie: string;
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  code_postal: string;
  situation_familiale: string;
  nombre_enfants: number;
  numero_cnss: string;
  numero_ipres: string;
  salaire_base: number;
  sur_salaire: number;
  prime_anciennete_taux: number;
  indemnite_transport: number;
  diplomes: string;
  contact_urgence_nom: string;
  contact_urgence_telephone: string;
  rib: string;
}

interface EmployeeDetailFormProps {
  formData: EmployeeFormData;
  setFormData: (data: EmployeeFormData | ((prev: EmployeeFormData) => EmployeeFormData)) => void;
}

export const EmployeeDetailForm = ({ formData, setFormData }: EmployeeDetailFormProps) => {
  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="personal">Personnel</TabsTrigger>
        <TabsTrigger value="professional">Professionnel</TabsTrigger>
        <TabsTrigger value="financial">Financier</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
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
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
            <Label htmlFor="date_naissance">Date de naissance</Label>
            <Input
              id="date_naissance"
              type="date"
              value={formData.date_naissance}
              onChange={(e) => setFormData(prev => ({...prev, date_naissance: e.target.value}))}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lieu_naissance">Lieu de naissance</Label>
            <Input
              id="lieu_naissance"
              value={formData.lieu_naissance}
              onChange={(e) => setFormData(prev => ({...prev, lieu_naissance: e.target.value}))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationalite">Nationalité</Label>
            <Input
              id="nationalite"
              value={formData.nationalite}
              onChange={(e) => setFormData(prev => ({...prev, nationalite: e.target.value}))}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="situation_familiale">Situation familiale</Label>
            <Select value={formData.situation_familiale} onValueChange={(value) => setFormData(prev => ({...prev, situation_familiale: value}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Célibataire">Célibataire</SelectItem>
                <SelectItem value="Marié(e)">Marié(e)</SelectItem>
                <SelectItem value="Divorcé(e)">Divorcé(e)</SelectItem>
                <SelectItem value="Veuf(ve)">Veuf(ve)</SelectItem>
                <SelectItem value="Union libre">Union libre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre_enfants">Nombre d'enfants</Label>
            <Input
              id="nombre_enfants"
              type="number"
              min="0"
              value={formData.nombre_enfants}
              onChange={(e) => setFormData(prev => ({...prev, nombre_enfants: parseInt(e.target.value) || 0}))}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="professional" className="space-y-4">
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
            <Label htmlFor="poste">Poste</Label>
            <Input
              id="poste"
              value={formData.poste}
              onChange={(e) => setFormData(prev => ({...prev, poste: e.target.value}))}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
                <SelectItem value="Consultant">Consultant</SelectItem>
                <SelectItem value="Apprentissage">Apprentissage</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date_entree">Date d'entrée</Label>
            <Input
              id="date_entree"
              type="date"
              value={formData.date_entree}
              onChange={(e) => setFormData(prev => ({...prev, date_entree: e.target.value}))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_sortie">Date de sortie</Label>
            <Input
              id="date_sortie"
              type="date"
              value={formData.date_sortie}
              onChange={(e) => setFormData(prev => ({...prev, date_sortie: e.target.value}))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="diplomes">Diplômes et formations</Label>
          <Textarea
            id="diplomes"
            value={formData.diplomes}
            onChange={(e) => setFormData(prev => ({...prev, diplomes: e.target.value}))}
            placeholder="Listez les diplômes et formations de l'employé..."
          />
        </div>
      </TabsContent>

      <TabsContent value="financial" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="salaire_base">Salaire de base (FCFA)</Label>
            <Input
              id="salaire_base"
              type="number"
              min="0"
              value={formData.salaire_base}
              onChange={(e) => setFormData(prev => ({...prev, salaire_base: parseFloat(e.target.value) || 0}))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sur_salaire">Sur-salaire (FCFA)</Label>
            <Input
              id="sur_salaire"
              type="number"
              min="0"
              value={formData.sur_salaire}
              onChange={(e) => setFormData(prev => ({...prev, sur_salaire: parseFloat(e.target.value) || 0}))}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="prime_anciennete_taux">Taux prime ancienneté (%)</Label>
            <Input
              id="prime_anciennete_taux"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.prime_anciennete_taux}
              onChange={(e) => setFormData(prev => ({...prev, prime_anciennete_taux: parseFloat(e.target.value) || 0}))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="indemnite_transport">Indemnité transport (FCFA)</Label>
            <Input
              id="indemnite_transport"
              type="number"
              min="0"
              value={formData.indemnite_transport}
              onChange={(e) => setFormData(prev => ({...prev, indemnite_transport: parseFloat(e.target.value) || 0}))}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="numero_cnss">Numéro CNSS</Label>
            <Input
              id="numero_cnss"
              value={formData.numero_cnss}
              onChange={(e) => setFormData(prev => ({...prev, numero_cnss: e.target.value}))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero_ipres">Numéro IPRES</Label>
            <Input
              id="numero_ipres"
              value={formData.numero_ipres}
              onChange={(e) => setFormData(prev => ({...prev, numero_ipres: e.target.value}))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rib">RIB (Relevé d'Identité Bancaire)</Label>
          <Input
            id="rib"
            value={formData.rib}
            onChange={(e) => setFormData(prev => ({...prev, rib: e.target.value}))}
            placeholder="Numéro de compte bancaire..."
          />
        </div>
      </TabsContent>

      <TabsContent value="contact" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData(prev => ({...prev, telephone: e.target.value}))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="adresse">Adresse</Label>
          <Input
            id="adresse"
            value={formData.adresse}
            onChange={(e) => setFormData(prev => ({...prev, adresse: e.target.value}))}
            placeholder="Rue, quartier..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ville">Ville</Label>
            <Input
              id="ville"
              value={formData.ville}
              onChange={(e) => setFormData(prev => ({...prev, ville: e.target.value}))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code_postal">Code postal</Label>
            <Input
              id="code_postal"
              value={formData.code_postal}
              onChange={(e) => setFormData(prev => ({...prev, code_postal: e.target.value}))}
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Contact d'urgence</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_urgence_nom">Nom du contact</Label>
              <Input
                id="contact_urgence_nom"
                value={formData.contact_urgence_nom}
                onChange={(e) => setFormData(prev => ({...prev, contact_urgence_nom: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_urgence_telephone">Téléphone du contact</Label>
              <Input
                id="contact_urgence_telephone"
                type="tel"
                value={formData.contact_urgence_telephone}
                onChange={(e) => setFormData(prev => ({...prev, contact_urgence_telephone: e.target.value}))}
              />
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
