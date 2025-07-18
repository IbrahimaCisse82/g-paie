/**
 * Constantes pour le système de paie
 */

// Mois de l'année
export const MONTHS = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' }
] as const;

// Types d'éléments de paie
export const PAY_ITEM_TYPES = [
  { value: 'HEURES_SUPPLEMENTAIRES', label: 'Heures supplémentaires' },
  { value: 'ABSENCES', label: 'Absences' },
  { value: 'PRIMES', label: 'Primes' },
  { value: 'INDEMNITES', label: 'Indemnités' },
  { value: 'RETENUES', label: 'Retenues' },
  { value: 'AVANCES', label: 'Avances' },
  { value: 'AUTRES', label: 'Autres' }
] as const;

// Types de rapports
export const REPORT_TYPES = [
  { value: 'LIVRE_PAIE', label: 'Livre de paie', icon: 'FileText' },
  { value: 'RECAPITULATIF_COTISATIONS', label: 'Récapitulatif des cotisations', icon: 'BarChart3' },
  { value: 'ETAT_CNSS', label: 'État CNSS', icon: 'FileText' },
  { value: 'ETAT_IPRES', label: 'État IPRES', icon: 'FileText' },
  { value: 'ETAT_IR', label: 'État IR', icon: 'FileText' }
] as const;

// Conventions collectives
export const CONVENTIONS_COLLECTIVES = [
  'COMMERCE',
  'INDUSTRIES_ALIMENTAIRES',
  'MECANIQUE_GENERALE',
  'PRESTATIONS_DE_SERVICES',
  'INDUSTRIES_HOTELIERES',
  'BTP',
  'SECURITE_PRIVEE',
  'Convention collective interprofessionnelle'
] as const;

// Catégories d'employés
export const EMPLOYEE_CATEGORIES = [
  'A1', 'A2', 'A3', 'A4', 'A5',
  'B1', 'B2', 'B3', 'B4', 'B5',
  'C1', 'C2', 'C3', 'C4', 'C5',
  'D1', 'D2', 'D3', 'D4', 'D5',
  'E1', 'E2', 'E3', 'E4', 'E5'
] as const;

// Types de contrat
export const CONTRACT_TYPES = [
  { value: 'CDI', label: 'CDI' },
  { value: 'CDD', label: 'CDD' },
  { value: 'Stage', label: 'Stage' },
  { value: 'Intérim', label: 'Intérim' }
] as const;

// Statuts d'employé
export const EMPLOYEE_STATUS = [
  { value: 'Actif', label: 'Actif' },
  { value: 'Inactif', label: 'Inactif' },
  { value: 'En congé', label: 'En congé' },
  { value: 'Licencié', label: 'Licencié' }
] as const;

// Situations familiales
export const FAMILY_STATUS = [
  { value: 'Célibataire', label: 'Célibataire' },
  { value: 'Marié(e)', label: 'Marié(e)' },
  { value: 'Divorcé(e)', label: 'Divorcé(e)' },
  { value: 'Veuf/Veuve', label: 'Veuf/Veuve' }
] as const;

// Sexes
export const GENDER = [
  { value: 'Masculin', label: 'Masculin' },
  { value: 'Féminin', label: 'Féminin' }
] as const;

// Génération d'années (pour les sélecteurs)
export const generateYears = (startOffset: number = -2, endOffset: number = 8): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: endOffset - startOffset + 1 }, (_, i) => currentYear + startOffset + i);
};

// Valeurs par défaut pour les formulaires
export const DEFAULT_PAYROLL_VALUES = {
  taux_cnss: 0.07,
  taux_ipres: 0.06,
  taux_ir: 0.25,
  taux_cotisation_patronale: 0.05,
  accident_travail: 0.05,
  cfce: 0.03,
  retenue_trimf: 800
} as const;

// Validation des données
export const VALIDATION_RULES = {
  matricule: { min: 1, max: 20 },
  nom: { min: 2, max: 100 },
  prenom: { min: 2, max: 100 },
  telephone: { min: 8, max: 20 },
  email: { min: 5, max: 100 },
  salaire_base: { min: 100000, max: 10000000 }
} as const;

// Formatage des devises
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Formatage des pourcentages
export const formatPercentage = (rate: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(rate);
};

// Utilitaires pour les calculs
export const CALCULATION_UTILS = {
  roundTo: (value: number, decimals: number = 0): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },
  
  calculatePercentage: (amount: number, rate: number): number => {
    return amount * rate;
  },
  
  isValidSalary: (salary: number): boolean => {
    return salary >= VALIDATION_RULES.salaire_base.min && salary <= VALIDATION_RULES.salaire_base.max;
  }
} as const;

// Constantes manquantes pour la compatibilité avec l'ancien système
export const ELEMENT_TYPES = PAY_ITEM_TYPES.map(item => item.value);
export const CONVENTION_TYPES = CONVENTIONS_COLLECTIVES;
export const CATEGORIES = EMPLOYEE_CATEGORIES;
export const PAYROLL_STATUS = ['Brouillon', 'Calculé', 'Validé', 'Payé'] as const;
export const PAYSLIP_STATUS = ['En attente', 'Généré', 'Envoyé', 'Archivé'] as const;
export const PERIOD_TYPES = ['Mensuel', 'Trimestriel', 'Annuel'] as const;
