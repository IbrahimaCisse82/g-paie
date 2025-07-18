// Types pour le module RH-Paie
// Correspond aux tables de base de données

import { MONTHS, PAY_ITEM_TYPES, REPORT_TYPES, CONTRACT_TYPES, EMPLOYEE_STATUS, FAMILY_STATUS, GENDER } from '@/constants/payroll';

// Types utilitaires
export type Month = typeof MONTHS[number]['value'];
export type PayItemType = typeof PAY_ITEM_TYPES[number]['value'];
export type ReportType = typeof REPORT_TYPES[number]['value'];
export type ContractType = typeof CONTRACT_TYPES[number]['value'];
export type EmployeeStatus = typeof EMPLOYEE_STATUS[number]['value'];
export type FamilyStatus = typeof FAMILY_STATUS[number]['value'];
export type Gender = typeof GENDER[number]['value'];

// Types de base pour les API responses
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface Employee {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: 'Masculin' | 'Féminin';
  date_naissance?: string;
  lieu_naissance?: string;
  nationalite?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  poste: string;
  convention_collective: string;
  categorie: string;
  statut: 'Actif' | 'Inactif' | 'En congé' | 'Licencié';
  type_contrat: 'CDI' | 'CDD' | 'Stage' | 'Intérim';
  date_embauche: string;
  date_sortie?: string;
  salaire_base: number;
  situation_familiale: 'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf/Veuve';
  nombre_enfants: number;
  nombre_conjoints: number;
  nombre_autres_charges: number;
  created_at: string;
  updated_at: string;
}

export interface PayrollSetting {
  id: string;
  nom_parametre: string;
  valeur: number;
  type_parametre: 'CNSS' | 'IPRES' | 'IR' | 'COTISATION_PATRONALE' | 'AUTRE';
  date_debut_application: string;
  date_fin_application?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PayItem {
  id: string;
  employe_id: string;
  mois: number;
  annee: number;
  type_element: 'HEURES_SUPPLEMENTAIRES' | 'ABSENCES' | 'PRIMES' | 'INDEMNITES' | 'RETENUES' | 'AVANCES' | 'AUTRES';
  libelle: string;
  montant: number;
  nombre_heures?: number;
  taux_horaire?: number;
  statut: 'En attente' | 'Validé' | 'Rejeté';
  date_saisie: string;
  created_at: string;
  updated_at: string;
}

export interface Payroll {
  id: string;
  employe_id: string;
  mois: number;
  annee: number;
  
  // Éléments de base
  salaire_base: number;
  heures_normales: number;
  heures_supplementaires: number;
  taux_horaire_normal: number;
  taux_horaire_supplementaire: number;
  
  // Gains
  salaire_brut: number;
  prime_anciennete: number;
  prime_logement: number;
  indemnite_transport: number;
  indemnite_fonction: number;
  autres_primes: number;
  total_gains: number;
  
  // Retenues salariales
  cnss_salarie: number;
  ipres_salarie: number;
  ir_salarie: number;
  autres_retenues: number;
  total_retenues_salariales: number;
  
  // Cotisations patronales
  cnss_patronal: number;
  ipres_patronal: number;
  accident_travail: number;
  autres_cotisations_patronales: number;
  total_cotisations_patronales: number;
  
  // Résultats
  salaire_net: number;
  cout_total_employeur: number;
  
  // Statut et validation
  statut: 'Brouillon' | 'Calculé' | 'Validé' | 'Payé';
  date_calcul: string;
  date_validation?: string;
  date_paiement?: string;
  
  created_at: string;
  updated_at: string;
}

export interface PaySlip {
  id: string;
  payroll_id: string;
  employe_id: string;
  numero_bulletin: string;
  mois: number;
  annee: number;
  contenu_html?: string;
  contenu_pdf?: Uint8Array;
  statut: 'Généré' | 'Envoyé' | 'Lu';
  date_generation: string;
  date_envoi?: string;
  email_destinataire?: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollReport {
  id: string;
  mois: number;
  annee: number;
  type_rapport: 'LIVRE_PAIE' | 'RECAPITULATIF_COTISATIONS' | 'ETAT_CNSS' | 'ETAT_IPRES' | 'ETAT_IR';
  contenu_json?: any;
  fichier_pdf?: Uint8Array;
  statut: 'Généré' | 'Validé' | 'Transmis';
  date_generation: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollPeriod {
  id: string;
  mois: number;
  annee: number;
  statut: 'Ouverte' | 'En cours de calcul' | 'Calculée' | 'Validée' | 'Fermée';
  date_ouverture: string;
  date_fermeture?: string;
  nombre_employes: number;
  total_masse_salariale: number;
  total_cotisations: number;
  created_at: string;
  updated_at: string;
}

export interface ConventionCategory {
  id: string;
  convention_collective: string;
  categorie: string;
  taux_horaire: number;
  salaire_base: number;
  statut: string;
  created_at: string;
  updated_at: string;
}

// Types pour les formulaires
export interface EmployeeFormData {
  matricule: string;
  prenom: string;
  nom: string;
  sexe: 'Masculin' | 'Féminin';
  date_naissance?: string;
  lieu_naissance?: string;
  nationalite?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  poste: string;
  convention_collective: string;
  categorie: string;
  type_contrat: 'CDI' | 'CDD' | 'Stage' | 'Intérim';
  date_embauche: string;
  salaire_base: number;
  situation_familiale: 'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf/Veuve';
  nombre_enfants: number;
  nombre_conjoints: number;
  nombre_autres_charges: number;
}

export interface PayItemFormData {
  employe_id: string;
  mois: number;
  annee: number;
  type_element: 'HEURES_SUPPLEMENTAIRES' | 'ABSENCES' | 'PRIMES' | 'INDEMNITES' | 'RETENUES' | 'AVANCES' | 'AUTRES';
  libelle: string;
  montant: number;
  nombre_heures?: number;
  taux_horaire?: number;
}

// Types pour les calculs
export interface PayrollCalculationParams {
  employe_id: string;
  mois: number;
  annee: number;
  include_pay_items?: boolean;
}

export interface PayrollCalculationResult {
  success: boolean;
  payroll?: Payroll;
  error?: string;
  details?: {
    gains_breakdown: Record<string, number>;
    deductions_breakdown: Record<string, number>;
    employer_costs_breakdown: Record<string, number>;
  };
}

// Types pour les rapports
export interface PayrollReportParams {
  mois: number;
  annee: number;
  type_rapport: 'LIVRE_PAIE' | 'RECAPITULATIF_COTISATIONS' | 'ETAT_CNSS' | 'ETAT_IPRES' | 'ETAT_IR';
  format?: 'pdf' | 'excel' | 'json';
}

// Types pour les filtres et recherche
export interface EmployeeFilters {
  statut?: 'Actif' | 'Inactif' | 'En congé' | 'Licencié';
  convention_collective?: string;
  categorie?: string;
  type_contrat?: 'CDI' | 'CDD' | 'Stage' | 'Intérim';
  search?: string;
}

export interface PayrollFilters {
  mois?: number;
  annee?: number;
  statut?: 'Brouillon' | 'Calculé' | 'Validé' | 'Payé';
  employe_id?: string;
}

// Types pour les statistiques
export interface PayrollStatistics {
  total_employes: number;
  total_masse_salariale: number;
  total_cotisations_salariales: number;
  total_cotisations_patronales: number;
  total_salaire_net: number;
  moyenne_salaire: number;
  repartition_par_convention: Record<string, number>;
  repartition_par_categorie: Record<string, number>;
}

// Types pour les exports
export interface PayrollExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  include_details?: boolean;
  include_breakdown?: boolean;
  filters?: PayrollFilters;
}