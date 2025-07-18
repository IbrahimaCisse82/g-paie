// Service de paie adapté aux nouvelles tables Supabase
import { supabase } from './supabase';
import { formatCurrency } from '../constants/payroll';
import type { Database } from '../integrations/supabase/types';

// Types extraits de la base de données
type Employee = Database['public']['Tables']['employees']['Row'];
type CollectiveAgreement = Database['public']['Tables']['collective_agreements']['Row'];
type PayrollPeriod = Database['public']['Tables']['payroll_periods']['Row'];
type PayrollElement = Database['public']['Tables']['payroll_elements']['Row'];
type PayrollCalculation = Database['public']['Tables']['payroll_calculations']['Row'];
type PaySlip = Database['public']['Tables']['pay_slips']['Row'];

// Types métiers adaptés
export interface EmployeeMetier {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: 'Masculin' | 'Féminin';
  email: string;
  telephone: string;
  adresse: string;
  poste: string;
  convention_collective: string;
  categorie: string;
  statut: 'Actif' | 'Inactif';
  date_embauche: string;
  salaire_base: number;
  situation_familiale: string;
  nombre_enfants: number;
  nombre_conjoints: number;
  nombre_autres_charges: number;
  created_at: string;
  updated_at: string;
}

export interface PayrollMetier {
  id: string;
  employe_id: string;
  mois: number;
  annee: number;
  salaire_base: number;
  heures_normales: number;
  heures_supplementaires: number;
  taux_horaire_normal: number;
  taux_horaire_supplementaire: number;
  salaire_brut: number;
  prime_anciennete: number;
  prime_logement: number;
  indemnite_transport: number;
  indemnite_fonction: number;
  autres_primes: number;
  total_gains: number;
  cnss_salarie: number;
  ipres_salarie: number;
  ir_salarie: number;
  autres_retenues: number;
  total_retenues_salariales: number;
  cnss_patronal: number;
  ipres_patronal: number;
  accident_travail: number;
  autres_cotisations_patronales: number;
  total_cotisations_patronales: number;
  salaire_net: number;
  cout_total_employeur: number;
  statut: 'Brouillon' | 'Calculé' | 'Validé' | 'Payé';
  date_calcul: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollCalculationResult {
  success: boolean;
  payroll?: PayrollMetier;
  error?: string;
  details?: {
    gains_breakdown: Record<string, number>;
    deductions_breakdown: Record<string, number>;
    employer_costs_breakdown: Record<string, number>;
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

class PayrollServiceSupabase {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Conversion des types Supabase vers les types métiers
  private convertEmployeeToMetier(employee: Employee, agreement?: CollectiveAgreement): EmployeeMetier {
    return {
      id: employee.id,
      matricule: employee.employee_number,
      prenom: employee.first_name,
      nom: employee.last_name,
      sexe: 'Masculin', // Valeur par défaut
      email: employee.email,
      telephone: employee.phone || '',
      adresse: employee.address || '',
      poste: employee.position,
      convention_collective: agreement?.name || 'Non définie',
      categorie: 'A1', // Valeur par défaut
      statut: employee.status === 'active' ? 'Actif' : 'Inactif',
      date_embauche: employee.hire_date,
      salaire_base: employee.base_salary,
      situation_familiale: 'Célibataire', // Valeur par défaut
      nombre_enfants: 0,
      nombre_conjoints: 0,
      nombre_autres_charges: 0,
      created_at: employee.created_at || new Date().toISOString(),
      updated_at: employee.updated_at || new Date().toISOString(),
    };
  }

  private convertPayrollCalculationToMetier(calculation: PayrollCalculation & { period?: PayrollPeriod }): PayrollMetier {
    const date = new Date(calculation.period?.start_date || calculation.calculation_date);
    
    return {
      id: calculation.id,
      employe_id: calculation.employee_id,
      mois: date.getMonth() + 1,
      annee: date.getFullYear(),
      salaire_base: calculation.gross_salary,
      heures_normales: 173,
      heures_supplementaires: 0,
      taux_horaire_normal: calculation.gross_salary / 173,
      taux_horaire_supplementaire: 0,
      salaire_brut: calculation.gross_salary,
      prime_anciennete: 0,
      prime_logement: 0,
      indemnite_transport: 0,
      indemnite_fonction: 0,
      autres_primes: 0,
      total_gains: calculation.gross_salary,
      cnss_salarie: calculation.social_charges * 0.4,
      ipres_salarie: calculation.social_charges * 0.3,
      ir_salarie: calculation.tax_charges,
      autres_retenues: 0,
      total_retenues_salariales: calculation.social_charges + calculation.tax_charges,
      cnss_patronal: calculation.social_charges * 0.4,
      ipres_patronal: calculation.social_charges * 0.3,
      accident_travail: 0,
      autres_cotisations_patronales: 0,
      total_cotisations_patronales: calculation.social_charges,
      salaire_net: calculation.net_salary,
      cout_total_employeur: calculation.gross_salary + calculation.social_charges,
      statut: 'Calculé',
      date_calcul: calculation.calculation_date,
      created_at: calculation.created_at,
      updated_at: calculation.created_at,
    };
  }

  // Méthodes publiques
  async getEmployees(): Promise<EmployeeMetier[]> {
    const cacheKey = 'employees_all';
    const cached = this.getFromCache<EmployeeMetier[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          collective_agreement:collective_agreements(*)
        `)
        .eq('status', 'active');

      if (error) throw error;

      const employees = data.map(emp => 
        this.convertEmployeeToMetier(emp, emp.collective_agreement)
      );

      this.setCache(cacheKey, employees);
      return employees;
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      throw error;
    }
  }

  async getEmployeeById(id: string): Promise<EmployeeMetier | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          collective_agreement:collective_agreements(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.convertEmployeeToMetier(data, data.collective_agreement);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'employé:', error);
      throw error;
    }
  }

  async calculatePayroll(employeeId: string, month: number, year: number): Promise<PayrollCalculationResult> {
    try {
      const employee = await this.getEmployeeById(employeeId);
      if (!employee) {
        return {
          success: false,
          error: 'Employé non trouvé'
        };
      }

      // Récupérer ou créer la période
      const periodName = `${month.toString().padStart(2, '0')}/${year}`;
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const { data: period, error: periodError } = await supabase
        .from('payroll_periods')
        .upsert({
          name: periodName,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'open'
        })
        .select()
        .single();

      if (periodError) throw periodError;

      // Récupérer les éléments de paie
      const { data: elements } = await supabase
        .from('payroll_elements')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('period_id', period.id);

      // Calculer les montants
      const elementSum = elements?.reduce((sum, el) => sum + el.amount, 0) || 0;
      const grossSalary = employee.salaire_base + elementSum;
      const socialCharges = grossSalary * 0.20;
      const taxCharges = (grossSalary - socialCharges) * 0.15;
      const netSalary = grossSalary - socialCharges - taxCharges;

      // Créer ou mettre à jour le calcul
      const { data: calculation, error: calcError } = await supabase
        .from('payroll_calculations')
        .upsert({
          employee_id: employeeId,
          period_id: period.id,
          gross_salary: grossSalary,
          social_charges: socialCharges,
          tax_charges: taxCharges,
          net_salary: netSalary,
          calculation_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (calcError) throw calcError;

      const payrollMetier = this.convertPayrollCalculationToMetier({
        ...calculation,
        period
      });

      return {
        success: true,
        payroll: payrollMetier,
        details: {
          gains_breakdown: {
            salaire_base: employee.salaire_base,
            elements: elementSum,
          },
          deductions_breakdown: {
            cnss_salarie: socialCharges * 0.4,
            ipres_salarie: socialCharges * 0.3,
            ir: taxCharges,
          },
          employer_costs_breakdown: {
            cnss_patronal: socialCharges * 0.4,
            ipres_patronal: socialCharges * 0.3,
          },
        },
      };
    } catch (error) {
      console.error('Erreur lors du calcul de paie:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  async getPayrollCalculations(month: number, year: number): Promise<PayrollMetier[]> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const { data, error } = await supabase
        .from('payroll_calculations')
        .select(`
          *,
          period:payroll_periods(*)
        `)
        .gte('calculation_date', startDate.toISOString())
        .lte('calculation_date', endDate.toISOString());

      if (error) throw error;

      return data.map(calc => this.convertPayrollCalculationToMetier(calc));
    } catch (error) {
      console.error('Erreur lors de la récupération des calculs:', error);
      return [];
    }
  }

  async validatePayroll(payrollId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('payroll_calculations')
        .update({ calculation_date: new Date().toISOString() })
        .eq('id', payrollId);

      if (error) throw error;
      
      this.cache.clear();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      throw error;
    }
  }

  async getPayrollSummary(month: number, year: number): Promise<PayrollSummary> {
    try {
      const employees = await this.getEmployees();
      const payrolls = await this.getPayrollCalculations(month, year);
      
      const totalMassSalariale = payrolls.reduce((sum, p) => sum + p.salaire_brut, 0);
      const totalCotisationsSalariales = payrolls.reduce((sum, p) => sum + p.total_retenues_salariales, 0);
      const totalCotisationsPatronales = payrolls.reduce((sum, p) => sum + p.total_cotisations_patronales, 0);
      const totalSalaireNet = payrolls.reduce((sum, p) => sum + p.salaire_net, 0);

      const repartitionConvention: Record<string, number> = {};
      const repartitionCategorie: Record<string, number> = {};

      employees.forEach(emp => {
        repartitionConvention[emp.convention_collective] = (repartitionConvention[emp.convention_collective] || 0) + 1;
        repartitionCategorie[emp.poste] = (repartitionCategorie[emp.poste] || 0) + 1;
      });

      return {
        total_employees: employees.length,
        total_mass_salariale: totalMassSalariale,
        total_cotisations_salariales: totalCotisationsSalariales,
        total_cotisations_patronales: totalCotisationsPatronales,
        total_salaire_net: totalSalaireNet,
        repartition_convention: repartitionConvention,
        repartition_categorie: repartitionCategorie,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé:', error);
      throw error;
    }
  }
}

// Fonction de validation des calculs
export async function validatePayrollCalculations(
  employeeId: string,
  month: number,
  year: number,
  expectedAmount: number
): Promise<{ ok: boolean; ecart: number }> {
  try {
    const service = new PayrollServiceSupabase();
    const result = await service.calculatePayroll(employeeId, month, year);
    
    if (!result.success || !result.payroll) {
      return { ok: false, ecart: 0 };
    }

    const ecart = Math.abs(result.payroll.salaire_net - expectedAmount);
    return { ok: ecart <= 1, ecart };
  } catch (error) {
    console.error('Erreur lors de la validation:', error);
    return { ok: false, ecart: 0 };
  }
}

export const PayrollService = new PayrollServiceSupabase();
