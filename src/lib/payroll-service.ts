import { supabase } from './supabase';
import type {
  Employee,
  Payroll,
  PayItem,
  PayrollSetting,
  PayrollCalculationParams,
  PayrollCalculationResult,
  PayrollStatistics,
  EmployeeFilters,
  PayrollFilters
} from '../types/payroll';

export class PayrollService {
  // ===== GESTION DES EMPLOYÉS =====
  
  /**
   * Récupère tous les employés avec filtres optionnels
   */
  static async getEmployees(filters?: EmployeeFilters): Promise<Employee[]> {
    let query = supabase
      .from('employees')
      .select('*')
      .order('nom', { ascending: true });

    if (filters) {
      if (filters.statut) {
        query = query.eq('statut', filters.statut);
      }
      if (filters.convention_collective) {
        query = query.eq('convention_collective', filters.convention_collective);
      }
      if (filters.categorie) {
        query = query.eq('categorie', filters.categorie);
      }
      if (filters.type_contrat) {
        query = query.eq('type_contrat', filters.type_contrat);
      }
      if (filters.search) {
        query = query.or(`nom.ilike.%${filters.search}%,prenom.ilike.%${filters.search}%,matricule.ilike.%${filters.search}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Récupère un employé par son ID
   */
  static async getEmployee(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Crée un nouvel employé
   */
  static async createEmployee(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert(employee)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Met à jour un employé
   */
  static async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Supprime un employé
   */
  static async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== GESTION DES ÉLÉMENTS DE PAIE =====

  /**
   * Récupère les éléments de paie d'un employé pour une période donnée
   */
  static async getPayItems(employeId: string, mois: number, annee: number): Promise<PayItem[]> {
    const { data, error } = await supabase
      .from('pay_items')
      .select('*')
      .eq('employe_id', employeId)
      .eq('mois', mois)
      .eq('annee', annee)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Ajoute un élément de paie
   */
  static async addPayItem(payItem: Omit<PayItem, 'id' | 'created_at' | 'updated_at'>): Promise<PayItem> {
    const { data, error } = await supabase
      .from('pay_items')
      .insert(payItem)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Met à jour un élément de paie
   */
  static async updatePayItem(id: string, updates: Partial<PayItem>): Promise<PayItem> {
    const { data, error } = await supabase
      .from('pay_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Supprime un élément de paie
   */
  static async deletePayItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('pay_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ===== PARAMÈTRES DE PAIE =====

  /**
   * Récupère les paramètres de paie actifs
   */
  static async getPayrollSettings(): Promise<PayrollSetting[]> {
    const { data, error } = await supabase
      .from('payroll_settings')
      .select('*')
      .order('nom_parametre', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Récupère un paramètre spécifique
   */
  static async getPayrollSetting(nomParametre: string): Promise<PayrollSetting | null> {
    const { data, error } = await supabase
      .from('payroll_settings')
      .select('*')
      .eq('nom_parametre', nomParametre)
      .single();

    if (error) throw error;
    return data;
  }

  // ===== CALCULS DE PAIE =====

  /**
   * Calcule la paie d'un employé pour une période donnée
   */
  static async calculatePayroll(params: PayrollCalculationParams): Promise<PayrollCalculationResult> {
    try {
      // Récupérer l'employé
      const employee = await this.getEmployee(params.employe_id);
      if (!employee) {
        return { success: false, error: 'Employé non trouvé' };
      }

      // Récupérer les paramètres de paie
      const settings = await this.getPayrollSettings();
      const settingsMap = new Map(settings.map(s => [s.nom_parametre, s.valeur]));

      // Récupérer les éléments variables de paie
      const payItems = params.include_pay_items 
        ? await this.getPayItems(params.employe_id, params.mois, params.annee)
        : [];

      // Calculer le salaire brut
      const salaireBrut = this.calculateSalaireBrut(employee, settingsMap, payItems);

      // Calculer les cotisations salariales
      const cotisationsSalariales = this.calculateCotisationsSalariales(salaireBrut, settingsMap);

      // Calculer l'impôt sur le revenu
      const ir = this.calculateIR(salaireBrut, settingsMap, employee);

      // Calculer les cotisations patronales
      const cotisationsPatronales = this.calculateCotisationsPatronales(salaireBrut, settingsMap);

      // Calculer le salaire net
      const salaireNet = salaireBrut - cotisationsSalariales.total - ir;

      // Créer l'objet de paie
      const payroll: Omit<Payroll, 'id' | 'created_at' | 'updated_at'> = {
        employe_id: params.employe_id,
        mois: params.mois,
        annee: params.annee,
        salaire_base: employee.salaire_base,
        heures_normales: settingsMap.get('HEURES_NORMALES_MOIS') || 173.33,
        heures_supplementaires: this.getHeuresSupplementaires(payItems),
        taux_horaire_normal: employee.salaire_base / (settingsMap.get('HEURES_NORMALES_MOIS') || 173.33),
        taux_horaire_supplementaire: (employee.salaire_base / (settingsMap.get('HEURES_NORMALES_MOIS') || 173.33)) * (settingsMap.get('TAUX_HEURES_SUPPLEMENTAIRES') || 1.25),
        salaire_brut: salaireBrut,
        prime_anciennete: this.calculatePrimeAnciennete(employee, settingsMap),
        prime_logement: settingsMap.get('PRIME_LOGEMENT_MONTANT') || 25000,
        indemnite_transport: settingsMap.get('INDEMNITE_TRANSPORT_MONTANT') || 15000,
        indemnite_fonction: 0,
        autres_primes: this.getAutresPrimes(payItems),
        total_gains: salaireBrut,
        cnss_salarie: cotisationsSalariales.cnss,
        ipres_salarie: cotisationsSalariales.ipres,
        ir_salarie: ir,
        autres_retenues: this.getAutresRetenues(payItems),
        total_retenues_salariales: cotisationsSalariales.total + ir + this.getAutresRetenues(payItems),
        cnss_patronal: cotisationsPatronales.cnss,
        ipres_patronal: cotisationsPatronales.ipres,
        accident_travail: cotisationsPatronales.accidentTravail,
        autres_cotisations_patronales: 0,
        total_cotisations_patronales: cotisationsPatronales.total,
        salaire_net: salaireNet,
        cout_total_employeur: salaireBrut + cotisationsPatronales.total,
        statut: 'Calculé',
        date_calcul: new Date().toISOString()
      };

      // Sauvegarder ou mettre à jour le calcul
      const existingPayroll = await this.getPayroll(params.employe_id, params.mois, params.annee);
      let savedPayroll: Payroll;

      if (existingPayroll) {
        savedPayroll = await this.updatePayroll(existingPayroll.id, payroll);
      } else {
        savedPayroll = await this.createPayroll(payroll);
      }

      return {
        success: true,
        payroll: savedPayroll,
        details: {
          gains_breakdown: {
            'Salaire de base': employee.salaire_base,
            'Heures supplémentaires': this.getHeuresSupplementaires(payItems) * payroll.taux_horaire_supplementaire,
            'Prime d\'ancienneté': payroll.prime_anciennete,
            'Prime de logement': payroll.prime_logement,
            'Indemnité de transport': payroll.indemnite_transport,
            'Autres primes': payroll.autres_primes
          },
          deductions_breakdown: {
            'CNSS': cotisationsSalariales.cnss,
            'IPRES': cotisationsSalariales.ipres,
            'IR': ir,
            'Autres retenues': payroll.autres_retenues
          },
          employer_costs_breakdown: {
            'Salaire brut': salaireBrut,
            'CNSS patronal': cotisationsPatronales.cnss,
            'IPRES patronal': cotisationsPatronales.ipres,
            'Accident de travail': cotisationsPatronales.accidentTravail
          }
        }
      };

    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur lors du calcul' };
    }
  }

  // ===== FONCTIONS DE CALCUL PRIVÉES =====

  private static calculateSalaireBrut(
    employee: Employee, 
    settings: Map<string, number>, 
    payItems: PayItem[]
  ): number {
    let salaireBrut = employee.salaire_base;

    // Ajouter les heures supplémentaires
    const heuresSupp = this.getHeuresSupplementaires(payItems);
    const tauxHoraire = employee.salaire_base / (settings.get('HEURES_NORMALES_MOIS') || 173.33);
    const tauxHoraireSupp = tauxHoraire * (settings.get('TAUX_HEURES_SUPPLEMENTAIRES') || 1.25);
    salaireBrut += heuresSupp * tauxHoraireSupp;

    // Ajouter les primes
    salaireBrut += this.calculatePrimeAnciennete(employee, settings);
    salaireBrut += settings.get('PRIME_LOGEMENT_MONTANT') || 25000;
    salaireBrut += settings.get('INDEMNITE_TRANSPORT_MONTANT') || 15000;
    salaireBrut += this.getAutresPrimes(payItems);

    return salaireBrut;
  }

  private static calculatePrimeAnciennete(employee: Employee, settings: Map<string, number>): number {
    const dateEmbauche = new Date(employee.date_embauche);
    const dateActuelle = new Date();
    const anneesAnciennete = Math.floor((dateActuelle.getTime() - dateEmbauche.getTime()) / (1000 * 60 * 60 * 24 * 365));
    const tauxPrime = settings.get('PRIME_ANCIENNETE_TAUX') || 0.05;
    return employee.salaire_base * tauxPrime * anneesAnciennete;
  }

  private static calculateCotisationsSalariales(salaireBrut: number, settings: Map<string, number>) {
    const plafondCNSS = settings.get('CNSS_PLAFOND') || 600000;
    const plafondIPRES = settings.get('IPRES_PLAFOND') || 600000;
    
    const baseCNSS = Math.min(salaireBrut, plafondCNSS);
    const baseIPRES = Math.min(salaireBrut, plafondIPRES);
    
    const cnss = baseCNSS * (settings.get('CNSS_SALARIE') || 0.07);
    const ipres = baseIPRES * (settings.get('IPRES_SALARIE') || 0.06);
    
    return {
      cnss,
      ipres,
      total: cnss + ipres
    };
  }

  private static calculateIR(salaireBrut: number, settings: Map<string, number>, employee: Employee): number {
    // Calcul de l'IR selon les tranches 2024
    const seuil1 = settings.get('IR_SEUIL_1') || 630000;
    const seuil2 = settings.get('IR_SEUIL_2') || 1500000;
    const seuil3 = settings.get('IR_SEUIL_3') || 4000000;
    
    const taux1 = settings.get('IR_TAUX_1') || 0;
    const taux2 = settings.get('IR_TAUX_2') || 0.20;
    const taux3 = settings.get('IR_TAUX_3') || 0.30;
    const taux4 = settings.get('IR_TAUX_4') || 0.40;

    // Calcul de la base imposable (salaire brut - CNSS - IPRES)
    const cotisationsSalariales = this.calculateCotisationsSalariales(salaireBrut, settings);
    const baseImposable = salaireBrut - cotisationsSalariales.total;

    // Abattement pour charges de famille
    const abattement = this.calculateAbattementFamille(employee, settings);
    const baseImposableApresAbattement = Math.max(0, baseImposable - abattement);

    let ir = 0;

    if (baseImposableApresAbattement <= seuil1) {
      ir = baseImposableApresAbattement * taux1;
    } else if (baseImposableApresAbattement <= seuil2) {
      ir = seuil1 * taux1 + (baseImposableApresAbattement - seuil1) * taux2;
    } else if (baseImposableApresAbattement <= seuil3) {
      ir = seuil1 * taux1 + (seuil2 - seuil1) * taux2 + (baseImposableApresAbattement - seuil2) * taux3;
    } else {
      ir = seuil1 * taux1 + (seuil2 - seuil1) * taux2 + (seuil3 - seuil2) * taux3 + (baseImposableApresAbattement - seuil3) * taux4;
    }

    return Math.round(ir);
  }

  private static calculateAbattementFamille(employee: Employee, settings: Map<string, number>): number {
    // Abattement pour charges de famille (simplifié)
    const abattementConjoint = 50000;
    const abattementEnfant = 25000;
    
    return employee.nombre_conjoints * abattementConjoint + employee.nombre_enfants * abattementEnfant;
  }

  private static calculateCotisationsPatronales(salaireBrut: number, settings: Map<string, number>) {
    const plafondCNSS = settings.get('CNSS_PLAFOND') || 600000;
    const plafondIPRES = settings.get('IPRES_PLAFOND') || 600000;
    
    const baseCNSS = Math.min(salaireBrut, plafondCNSS);
    const baseIPRES = Math.min(salaireBrut, plafondIPRES);
    
    const cnss = baseCNSS * (settings.get('CNSS_PATRONAL') || 0.14);
    const ipres = baseIPRES * (settings.get('IPRES_PATRONAL') || 0.075);
    const accidentTravail = salaireBrut * (settings.get('ACCIDENT_TRAVAIL') || 0.015);
    
    return {
      cnss,
      ipres,
      accidentTravail,
      total: cnss + ipres + accidentTravail
    };
  }

  private static getHeuresSupplementaires(payItems: PayItem[]): number {
    return payItems
      .filter(item => item.type_element === 'HEURES_SUPPLEMENTAIRES')
      .reduce((total, item) => total + (item.nombre_heures || 0), 0);
  }

  private static getAutresPrimes(payItems: PayItem[]): number {
    return payItems
      .filter(item => item.type_element === 'PRIMES')
      .reduce((total, item) => total + item.montant, 0);
  }

  private static getAutresRetenues(payItems: PayItem[]): number {
    return payItems
      .filter(item => item.type_element === 'RETENUES')
      .reduce((total, item) => total + item.montant, 0);
  }

  // ===== GESTION DES CALCULS DE PAIE =====

  static async getPayroll(employeId: string, mois: number, annee: number): Promise<Payroll | null> {
    const { data, error } = await supabase
      .from('payrolls')
      .select('*')
      .eq('employe_id', employeId)
      .eq('mois', mois)
      .eq('annee', annee)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async createPayroll(payroll: Omit<Payroll, 'id' | 'created_at' | 'updated_at'>): Promise<Payroll> {
    const { data, error } = await supabase
      .from('payrolls')
      .insert(payroll)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePayroll(id: string, updates: Partial<Payroll>): Promise<Payroll> {
    const { data, error } = await supabase
      .from('payrolls')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ===== STATISTIQUES =====

  static async getPayrollStatistics(mois: number, annee: number): Promise<PayrollStatistics> {
    const { data: payrolls, error } = await supabase
      .from('payrolls')
      .select('*')
      .eq('mois', mois)
      .eq('annee', annee)
      .eq('statut', 'Validé');

    if (error) throw error;

    const totalEmployes = payrolls?.length || 0;
    const totalMasseSalariale = payrolls?.reduce((sum, p) => sum + p.salaire_brut, 0) || 0;
    const totalCotisationsSalariales = payrolls?.reduce((sum, p) => sum + p.total_retenues_salariales, 0) || 0;
    const totalCotisationsPatronales = payrolls?.reduce((sum, p) => sum + p.total_cotisations_patronales, 0) || 0;
    const totalSalaireNet = payrolls?.reduce((sum, p) => sum + p.salaire_net, 0) || 0;
    const moyenneSalaire = totalEmployes > 0 ? totalMasseSalariale / totalEmployes : 0;

    // Récupérer la répartition par convention
    const { data: employees } = await supabase
      .from('employees')
      .select('convention_collective, categorie')
      .eq('statut', 'Actif');

    const repartitionConvention: Record<string, number> = {};
    const repartitionCategorie: Record<string, number> = {};

    employees?.forEach(emp => {
      repartitionConvention[emp.convention_collective] = (repartitionConvention[emp.convention_collective] || 0) + 1;
      repartitionCategorie[emp.categorie] = (repartitionCategorie[emp.categorie] || 0) + 1;
    });

    return {
      total_employes: totalEmployes,
      total_masse_salariale: totalMasseSalariale,
      total_cotisations_salariales: totalCotisationsSalariales,
      total_cotisations_patronales: totalCotisationsPatronales,
      total_salaire_net: totalSalaireNet,
      moyenne_salaire: moyenneSalaire,
      repartition_par_convention: repartitionConvention,
      repartition_par_categorie: repartitionCategorie
    };
  }
} 

export async function validatePayrollCalculations(
  employeId: string,
  mois: number,
  annee: number,
  attendu: number
): Promise<{ ok: boolean; message?: string }> {
  try {
    const result = await PayrollService.calculatePayroll({
      employe_id: employeId,
      mois,
      annee,
      include_pay_items: true,
    });
    if (!result.success || !result.payroll) {
      return { ok: false, message: result.error || 'Erreur de calcul' };
    }
    const ecart = Math.abs(result.payroll.salaire_net - attendu);
    if (ecart > 1) {
      return {
        ok: false,
        message: `Écart de ${ecart} FCFA (attendu: ${attendu}, calculé: ${result.payroll.salaire_net})`,
      };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: 'Erreur lors de la vérification' };
  }
} 