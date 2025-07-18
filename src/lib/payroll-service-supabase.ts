// Service de paie adapté aux tables Supabase réelles
// Remplace temporairement payroll-service.ts en attendant la migration complète

import { supabase } from './supabase';
import { 
  Employee, 
  PayrollCalculation, 
  PayrollElement, 
  PayrollPeriod, 
  PaySlip, 
  CollectiveAgreement,
  PayrollReport,
  EmployeeMetier,
  PayrollMetier,
  PayItemMetier,
  EmployeeAdapter,
  PayrollAdapter,
  PaginatedResponse,
  PayrollCalculationResult,
  PayrollSummary
} from '../types/supabase';
import { formatCurrency, formatDate } from './utils';

class PayrollServiceSupabase {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Gestion du cache
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

  // Adaptateurs pour conversion entre types Supabase et types métiers
  private employeeAdapter: EmployeeAdapter = {
    toMetier: (employee: Employee): EmployeeMetier => ({
      id: employee.id,
      nom: employee.last_name,
      prenom: employee.first_name,
      email: employee.email,
      telephone: employee.phone,
      adresse: employee.address,
      ville: '',
      code_postal: '',
      pays: '',
      date_embauche: employee.hire_date,
      poste: employee.position,
      service: employee.department,
      salaire_base: employee.base_salary,
      convention_collective: 'CADRE',
      statut: employee.status === 'active' ? 'actif' : 'inactif',
      numero_securite_sociale: '',
      numero_cnss: '',
      code_employe: employee.employee_number,
      date_naissance: '',
      lieu_naissance: '',
      situation_familiale: '',
      nombre_enfants: 0,
      nombre_conjoints: 0,
      nombre_autres_charges: 0,
      contact_urgence_nom: '',
      contact_urgence_telephone: '',
      iban: '',
      banque: '',
      numero_compte: '',
      taux_ir: 0.15,
      taux_cnss: 0.056,
      taux_ipres: 0.06,
      indemnite_transport: 0,
      indemnite_logement: 0,
      prime_anciennete: 0,
      avantages_nature: 0,
      created_at: employee.created_at,
      updated_at: employee.updated_at,
    }),
    fromMetier: (employee: EmployeeMetier): Partial<Employee> => ({
      employee_number: employee.code_employe,
      first_name: employee.prenom,
      last_name: employee.nom,
      email: employee.email,
      phone: employee.telephone,
      address: employee.adresse,
      hire_date: employee.date_embauche,
      position: employee.poste,
      department: employee.service,
      base_salary: employee.salaire_base,
      status: employee.statut === 'actif' ? 'active' : 'inactive',
    })
  };

  private payrollAdapter: PayrollAdapter = {
    toMetier: (payroll: PayrollCalculation): PayrollMetier => ({
      id: payroll.id,
      employe_id: payroll.employee_id,
      mois: new Date(payroll.calculation_date).getMonth() + 1,
      annee: new Date(payroll.calculation_date).getFullYear(),
      salaire_base: payroll.gross_salary,
      heures_supplementaires: 0,
      primes: 0,
      indemnites: 0,
      avantages_nature: 0,
      salaire_brut: payroll.gross_salary,
      cnss_salarie: payroll.social_charges * 0.3,
      ipres_salarie: payroll.social_charges * 0.3,
      ir: payroll.tax_charges,
      total_retenues_salariales: payroll.social_charges + payroll.tax_charges,
      cnss_patronal: payroll.social_charges * 0.4,
      ipres_patronal: payroll.social_charges * 0.3,
      accidents_travail: 0,
      allocations_familiales: 0,
      formation_professionnelle: 0,
      total_cotisations_patronales: payroll.social_charges,
      salaire_net: payroll.net_salary,
      statut: 'En attente',
      created_at: payroll.created_at,
      updated_at: payroll.created_at,
    }),
    fromMetier: (payroll: PayrollMetier): Partial<PayrollCalculation> => ({
      employee_id: payroll.employe_id,
      gross_salary: payroll.salaire_brut,
      social_charges: payroll.total_retenues_salariales,
      tax_charges: payroll.ir,
      net_salary: payroll.salaire_net,
    })
  };

  // Méthodes pour les employés
  async getEmployees(filters: any = {}): Promise<EmployeeMetier[]> {
    const cacheKey = `employees_${JSON.stringify(filters)}`;
    const cached = this.getFromCache<EmployeeMetier[]>(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('employees')
        .select('*, collective_agreement:collective_agreements(*)');

      // Application des filtres
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.department) {
        query = query.eq('department', filters.department);
      }
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erreur lors de la récupération des employés: ${error.message}`);
      }

      const employees = data.map(emp => this.employeeAdapter.toMetier(emp));
      this.setCache(cacheKey, employees);
      return employees;
    } catch (error) {
      console.error('Erreur getEmployees:', error);
      throw error;
    }
  }

  async getEmployeeById(id: string): Promise<EmployeeMetier | null> {
    const cacheKey = `employee_${id}`;
    const cached = this.getFromCache<EmployeeMetier>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*, collective_agreement:collective_agreements(*)')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`Erreur lors de la récupération de l'employé: ${error.message}`);
      }

      const employee = this.employeeAdapter.toMetier(data);
      this.setCache(cacheKey, employee);
      return employee;
    } catch (error) {
      console.error('Erreur getEmployeeById:', error);
      throw error;
    }
  }

  async createEmployee(employee: Partial<EmployeeMetier>): Promise<EmployeeMetier> {
    try {
      const employeeData = this.employeeAdapter.fromMetier(employee as EmployeeMetier);
      
      const { data, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur lors de la création de l'employé: ${error.message}`);
      }

      this.cache.clear(); // Vider le cache après modification
      return this.employeeAdapter.toMetier(data);
    } catch (error) {
      console.error('Erreur createEmployee:', error);
      throw error;
    }
  }

  async updateEmployee(id: string, updates: Partial<EmployeeMetier>): Promise<EmployeeMetier> {
    try {
      const employeeData = this.employeeAdapter.fromMetier(updates as EmployeeMetier);
      
      const { data, error } = await supabase
        .from('employees')
        .update({ ...employeeData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur lors de la mise à jour de l'employé: ${error.message}`);
      }

      this.cache.clear(); // Vider le cache après modification
      return this.employeeAdapter.toMetier(data);
    } catch (error) {
      console.error('Erreur updateEmployee:', error);
      throw error;
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erreur lors de la suppression de l'employé: ${error.message}`);
      }

      this.cache.clear(); // Vider le cache après modification
    } catch (error) {
      console.error('Erreur deleteEmployee:', error);
      throw error;
    }
  }

  // Méthodes pour les conventions collectives
  async getCollectiveAgreements(): Promise<CollectiveAgreement[]> {
    const cacheKey = 'collective_agreements';
    const cached = this.getFromCache<CollectiveAgreement[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('collective_agreements')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Erreur lors de la récupération des conventions: ${error.message}`);
      }

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Erreur getCollectiveAgreements:', error);
      throw error;
    }
  }

  // Méthodes pour les périodes de paie
  async getPayrollPeriods(): Promise<PayrollPeriod[]> {
    const cacheKey = 'payroll_periods';
    const cached = this.getFromCache<PayrollPeriod[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('payroll_periods')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        throw new Error(`Erreur lors de la récupération des périodes: ${error.message}`);
      }

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Erreur getPayrollPeriods:', error);
      throw error;
    }
  }

  async createPayrollPeriod(periodData: Partial<PayrollPeriod>): Promise<PayrollPeriod> {
    try {
      const { data, error } = await supabase
        .from('payroll_periods')
        .insert(periodData)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur lors de la création de la période: ${error.message}`);
      }

      this.cache.clear();
      return data;
    } catch (error) {
      console.error('Erreur createPayrollPeriod:', error);
      throw error;
    }
  }

  // Méthodes pour les calculs de paie
  async calculatePayroll(employeeId: string, periodId: string): Promise<PayrollCalculationResult> {
    try {
      // Récupérer l'employé
      const employee = await this.getEmployeeById(employeeId);
      if (!employee) {
        throw new Error('Employé non trouvé');
      }

      // Récupérer les éléments de paie pour la période
      const { data: elements, error: elementsError } = await supabase
        .from('payroll_elements')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('period_id', periodId);

      if (elementsError) {
        throw new Error(`Erreur lors de la récupération des éléments: ${elementsError.message}`);
      }

      // Calculer les montants
      const grossSalary = employee.salaire_base + (elements?.reduce((sum, el) => sum + el.amount, 0) || 0);
      const socialCharges = grossSalary * 0.20; // 20% charges sociales
      const taxCharges = (grossSalary - socialCharges) * 0.15; // 15% IR
      const netSalary = grossSalary - socialCharges - taxCharges;

      // Créer ou mettre à jour le calcul
      const { data: calculation, error: calcError } = await supabase
        .from('payroll_calculations')
        .upsert({
          employee_id: employeeId,
          period_id: periodId,
          gross_salary: grossSalary,
          social_charges: socialCharges,
          tax_charges: taxCharges,
          net_salary: netSalary,
          calculation_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (calcError) {
        throw new Error(`Erreur lors du calcul: ${calcError.message}`);
      }

      return {
        payroll: this.payrollAdapter.toMetier(calculation),
        employee,
        elements: elements?.map(el => ({
          id: el.id,
          employe_id: el.employee_id,
          mois: new Date().getMonth() + 1,
          annee: new Date().getFullYear(),
          type_element: 'PRIMES',
          libelle: el.description,
          montant: el.amount,
          statut: 'En attente',
          date_saisie: el.created_at,
          created_at: el.created_at,
          updated_at: el.updated_at,
        })) || [],
        totals: {
          salaire_brut: grossSalary,
          total_retenues_salariales: socialCharges + taxCharges,
          total_cotisations_patronales: socialCharges,
          salaire_net: netSalary,
        },
      };
    } catch (error) {
      console.error('Erreur calculatePayroll:', error);
      throw error;
    }
  }

  // Méthodes pour les bulletins de paie
  async generatePaySlip(employeeId: string, periodId: string): Promise<PaySlip> {
    try {
      // Récupérer le calcul de paie
      const { data: calculation, error: calcError } = await supabase
        .from('payroll_calculations')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('period_id', periodId)
        .single();

      if (calcError) {
        throw new Error(`Calcul de paie non trouvé: ${calcError.message}`);
      }

      // Créer le bulletin
      const { data: paySlip, error: slipError } = await supabase
        .from('pay_slips')
        .insert({
          employee_id: employeeId,
          period_id: periodId,
          calculation_id: calculation.id,
          gross_salary: calculation.gross_salary,
          social_charges: calculation.social_charges,
          tax_charges: calculation.tax_charges,
          net_salary: calculation.net_salary,
          status: 'En attente',
          generated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (slipError) {
        throw new Error(`Erreur lors de la génération du bulletin: ${slipError.message}`);
      }

      return paySlip;
    } catch (error) {
      console.error('Erreur generatePaySlip:', error);
      throw error;
    }
  }

  // Méthodes pour les rapports
  async getPayrollSummary(mois: number, annee: number): Promise<PayrollSummary> {
    try {
      const employees = await this.getEmployees();
      
      // Simuler les données pour le moment
      const totalEmployees = employees.length;
      const totalMassSalariale = employees.reduce((sum, emp) => sum + emp.salaire_base, 0);
      const totalCotisationsSalariales = totalMassSalariale * 0.20;
      const totalCotisationsPatronales = totalMassSalariale * 0.25;
      const totalSalaireNet = totalMassSalariale - totalCotisationsSalariales;

      const repartitionConvention: Record<string, number> = {};
      const repartitionCategorie: Record<string, number> = {};

      employees.forEach(emp => {
        repartitionConvention[emp.convention_collective] = (repartitionConvention[emp.convention_collective] || 0) + 1;
        repartitionCategorie[emp.service] = (repartitionCategorie[emp.service] || 0) + 1;
      });

      return {
        total_employees: totalEmployees,
        total_mass_salariale: totalMassSalariale,
        total_cotisations_salariales: totalCotisationsSalariales,
        total_cotisations_patronales: totalCotisationsPatronales,
        total_salaire_net: totalSalaireNet,
        repartition_convention: repartitionConvention,
        repartition_categorie: repartitionCategorie,
      };
    } catch (error) {
      console.error('Erreur getPayrollSummary:', error);
      throw error;
    }
  }

  // Méthodes utilitaires
  async validatePayroll(payrollId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('payroll_calculations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', payrollId);

      if (error) {
        throw new Error(`Erreur lors de la validation: ${error.message}`);
      }

      this.cache.clear();
    } catch (error) {
      console.error('Erreur validatePayroll:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const payrollServiceSupabase = new PayrollServiceSupabase();
