
export interface Salarie {
  id?: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: "M" | "F";
  dateNaissance: Date;
  lieuNaissance: string;
  nationalite: string;
  statut: string;
  typeContrat: string;
  categorie: string;
  conventionCollective: string;
  dateEntree: Date;
  dateFin?: Date;
  motifSortie?: string;
  dateRetourConge?: Date;
  tauxHoraire?: number;
  salaireBase?: number;
}

// Interface pour les données du formulaire (avec des strings pour les dates)
export interface SalarieFormData {
  id?: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: "M" | "F";
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  statut: string;
  typeContrat: string;
  categorie: string;
  conventionCollective: string;
  dateEntree: string;
  dateFin?: string;
  motifSortie?: string;
  dateRetourConge?: string;
  tauxHoraire?: number;
  salaireBase?: number;
}
