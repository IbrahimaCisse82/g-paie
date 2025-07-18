// Types Supabase adaptés aux tables réelles de la base de données
// Basé sur le schéma de migration 20250710000000_payroll_module_clean.sql

import { 
  MONTHS, 
  ELEMENT_TYPES, 
  CONVENTION_TYPES, 
  CATEGORIES, 
  PAYROLL_STATUS, 
  PAYSLIP_STATUS, 
  REPORT_TYPES,
  PERIOD_TYPES
} from '../constants/payroll';

// Types utilitaires
export type Month = typeof MONTHS[number];
export type ElementType = typeof ELEMENT_TYPES[number];
export type ConventionType = typeof CONVENTION_TYPES[number];
export type Category = typeof CATEGORIES[number];
export type PayrollStatus = typeof PAYROLL_STATUS[number];
export type PayslipStatus = typeof PAYSLIP_STATUS[number];
export type ReportType = typeof REPORT_TYPES[number];
export type PeriodType = typeof PERIOD_TYPES[number];

// Types mappés aux tables Supabase réelles
export interface CollectiveAgreement {
  id: string;
  name: string;
  code: string;
  description: string;
  base_salary_min: number;
  base_salary_max: number;
  social_charge_rate: number;
  tax_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  hire_date: string;
  position: string;
  department: string;
  base_salary: number;
  collective_agreement_id: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  // Relations
  collective_agreement?: CollectiveAgreement;
}

export interface PayrollPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed' | 'processing';
  created_at: string;
  updated_at: string;
}

export interface PayrollElement {
  id: string;
  employee_id: string;
  period_id: string;
  element_type: string;
  description: string;
  amount: number;
  is_taxable: boolean;
  is_social_chargeable: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  employee?: Employee;
  period?: PayrollPeriod;
}

export interface PayrollCalculation {
  id: string;
  employee_id: string;
  period_id: string;
  gross_salary: number;
  social_charges: number;
  tax_charges: number;
  net_salary: number;
  calculation_date: string;
  created_at: string;
  // Relations
  employee?: Employee;
  period?: PayrollPeriod;
}

export interface PaySlip {
  id: string;
  employee_id: string;
  period_id: string;
  calculation_id?: string;
  gross_salary: number;
  social_charges: number;
  tax_charges: number;
  net_salary: number;
  status: PayslipStatus;
  generated_at: string;
  created_at: string;
  updated_at: string;
  // Relations
  employee?: Employee;
  period?: PayrollPeriod;
  calculation?: PayrollCalculation;
}

export interface PayrollReport {
  id: string;
  period_id: string;
  report_type: string;
  report_data: any;
  generated_at: string;
  created_at: string;
  // Relations
  period?: PayrollPeriod;
}

// Types de transformation pour adapter aux types métiers existants
export interface EmployeeMetier {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  code_postal: string;
  pays: string;
  date_embauche: string;
  poste: string;
  service: string;
  salaire_base: number;
  convention_collective: ConventionType;
  statut: 'actif' | 'inactif' | 'suspendu';
  numero_securite_sociale: string;
  numero_cnss: string;
  code_employe: string;
  date_naissance: string;
  lieu_naissance: string;
  situation_familiale: string;
  nombre_enfants: number;
  nombre_conjoints: number;
  nombre_autres_charges: number;
  contact_urgence_nom: string;
  contact_urgence_telephone: string;
  iban: string;
  banque: string;
  numero_compte: string;
  taux_ir: number;
  taux_cnss: number;
  taux_ipres: number;
  indemnite_transport: number;
  indemnite_logement: number;
  prime_anciennete: number;
  avantages_nature: number;
  created_at: string;
  updated_at: string;
}

export interface PayrollMetier {
  id: string;
  employe_id: string;
  mois: number;
  annee: number;
  salaire_base: number;
  heures_supplementaires: number;
  primes: number;
  indemnites: number;
  avantages_nature: number;
  salaire_brut: number;
  cnss_salarie: number;
  ipres_salarie: number;
  ir: number;
  total_retenues_salariales: number;
  cnss_patronal: number;
  ipres_patronal: number;
  accidents_travail: number;
  allocations_familiales: number;
  formation_professionnelle: number;
  total_cotisations_patronales: number;
  salaire_net: number;
  statut: PayrollStatus;
  created_at: string;
  updated_at: string;
}

export interface PayItemMetier {
  id: string;
  employe_id: string;
  mois: number;
  annee: number;
  type_element: ElementType;
  libelle: string;
  montant: number;
  statut: PayrollStatus;
  date_saisie: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyInfo {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  code_postal: string;
  pays: string;
  telephone: string;
  email: string;
  ninea: string;
  rccm: string;
  created_at: string;
  updated_at: string;
}

export interface Convention {
  id: string;
  nom: string;
  code: string;
  description: string;
  salaire_min: number;
  salaire_max: number;
  taux_charges_sociales: number;
  taux_ir: number;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  titre: string;
  type: ReportType;
  periode_debut: string;
  periode_fin: string;
  contenu: any;
  created_at: string;
  updated_at: string;
}

export interface PayrollSetting {
  id: string;
  nom_parametre: string;
  valeur: string;
  type_parametre: string;
  description: string;
  date_debut_application: string;
  created_at: string;
  updated_at: string;
}

// Utility types
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PayrollCalculationResult {
  payroll: PayrollMetier;
  employee: EmployeeMetier;
  elements: PayItemMetier[];
  totals: {
    salaire_brut: number;
    total_retenues_salariales: number;
    total_cotisations_patronales: number;
    salaire_net: number;
  };
}

export interface PayrollSummary {
  total_employees: number;
  total_mass_salariale: number;
  total_cotisations_salariales: number;
  total_cotisations_patronales: number;
  total_salaire_net: number;
  repartition_convention: Record<string, number>;
  repartition_categorie: Record<string, number>;
}

// Types d'adaptateurs pour conversion
export interface EmployeeAdapter {
  toMetier(employee: Employee): EmployeeMetier;
  fromMetier(employee: EmployeeMetier): Partial<Employee>;
}

export interface PayrollAdapter {
  toMetier(payroll: PayrollCalculation): PayrollMetier;
  fromMetier(payroll: PayrollMetier): Partial<PayrollCalculation>;
}
