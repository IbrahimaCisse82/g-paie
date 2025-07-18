// Service de paie temporaire avec les types adaptés
import { supabase } from './supabase';
import { formatCurrency, generateYears } from '../constants/payroll';
import type { Employee, Payroll, PayrollCalculationResult } from '../types/payroll';

export class TempPayrollService {
  // Récupération des employés simulée
  async getEmployees(): Promise<Employee[]> {
    // Simuler des données d'employés
    return [
      {
        id: '1',
        matricule: 'EMP001',
        prenom: 'Jean',
        nom: 'Dupont',
        sexe: 'Masculin',
        date_naissance: '1990-01-01',
        lieu_naissance: 'Paris',
        nationalite: 'Française',
        adresse: '123 Rue de la Paix, 75001 Paris',
        telephone: '0123456789',
        email: 'jean.dupont@example.com',
        poste: 'Développeur',
        convention_collective: 'CADRE',
        categorie: 'A1',
        statut: 'Actif',
        type_contrat: 'CDI',
        date_embauche: '2023-01-15',
        salaire_base: 50000,
        situation_familiale: 'Célibataire',
        nombre_enfants: 0,
        nombre_conjoints: 0,
        nombre_autres_charges: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  }

  // Calcul de paie simulé
  async calculatePayroll(employeeId: string, month: number, year: number): Promise<PayrollCalculationResult> {
    const employees = await this.getEmployees();
    const employee = employees.find(e => e.id === employeeId);
    
    if (!employee) {
      throw new Error('Employé non trouvé');
    }

    const salaire_base = employee.salaire_base;
    const primes = 2000; // Prime fixe temporaire
    const indemnites = 5000; // Indemnité fixe temporaire
    const salaire_brut = salaire_base + primes + indemnites;
    
    const cnss_salarie = salaire_brut * 0.056;
    const ipres_salarie = salaire_brut * 0.06;
    const ir = (salaire_brut - cnss_salarie - ipres_salarie) * 0.15;
    const total_retenues = cnss_salarie + ipres_salarie + ir;
    
    const cnss_patronal = salaire_brut * 0.08;
    const ipres_patronal = salaire_brut * 0.06;
    const total_cotisations_patronales = cnss_patronal + ipres_patronal;
    
    const salaire_net = salaire_brut - total_retenues;

    const payroll: Payroll = {
      id: `payroll_${employeeId}_${month}_${year}`,
      employe_id: employeeId,
      mois: month,
      annee: year,
      salaire_base,
      heures_normales: 173,
      heures_supplementaires: 0,
      taux_horaire_normal: salaire_base / 173,
      taux_horaire_supplementaire: 0,
      salaire_brut,
      prime_anciennete: 0,
      prime_logement: 0,
      indemnite_transport: 0,
      indemnite_fonction: 0,
      autres_primes: primes,
      total_gains: salaire_brut,
      cnss_salarie,
      ipres_salarie,
      ir_salarie: ir,
      autres_retenues: 0,
      total_retenues_salariales: total_retenues,
      cnss_patronal,
      ipres_patronal,
      accident_travail: 0,
      autres_cotisations_patronales: 0,
      total_cotisations_patronales,
      salaire_net,
      cout_total_employeur: salaire_brut + total_cotisations_patronales,
      statut: 'Calculé',
      date_calcul: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      success: true,
      payroll,
      details: {
        gains_breakdown: {
          salaire_base,
          primes,
          indemnites,
        },
        deductions_breakdown: {
          cnss_salarie,
          ipres_salarie,
          ir,
        },
        employer_costs_breakdown: {
          cnss_patronal,
          ipres_patronal,
        },
      },
    };
  }

  // Récupération des calculs de paie
  async getPayrollCalculations(month: number, year: number): Promise<Payroll[]> {
    const employees = await this.getEmployees();
    const payrolls: Payroll[] = [];
    
    for (const employee of employees) {
      const result = await this.calculatePayroll(employee.id, month, year);
      payrolls.push(result.payroll);
    }
    
    return payrolls;
  }

  // Validation d'un calcul de paie
  async validatePayroll(payrollId: string): Promise<void> {
    console.log(`Validation de la paie ${payrollId}`);
    // Simulation de validation
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Récupération du résumé de paie
  async getPayrollSummary(month: number, year: number) {
    const payrolls = await this.getPayrollCalculations(month, year);
    const employees = await this.getEmployees();
    
    return {
      total_employees: employees.length,
      total_mass_salariale: payrolls.reduce((sum, p) => sum + p.salaire_brut, 0),
      total_cotisations_salariales: payrolls.reduce((sum, p) => sum + p.total_retenues_salariales, 0),
      total_cotisations_patronales: payrolls.reduce((sum, p) => sum + p.total_cotisations_patronales, 0),
      total_salaire_net: payrolls.reduce((sum, p) => sum + p.salaire_net, 0),
      repartition_convention: employees.reduce((acc, emp) => {
        acc[emp.convention_collective] = (acc[emp.convention_collective] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      repartition_categorie: employees.reduce((acc, emp) => {
        acc[emp.poste] = (acc[emp.poste] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

// Fonction de validation temporaire
export async function validatePayrollCalculations(
  employeeId: string,
  month: number,
  year: number,
  expectedAmount: number
): Promise<{ ok: boolean; ecart: number }> {
  // Simulation de validation
  const tolerance = 1; // 1 FCFA de tolérance
  const randomEcart = Math.random() * 10 - 5; // Écart aléatoire entre -5 et 5
  
  return {
    ok: Math.abs(randomEcart) <= tolerance,
    ecart: randomEcart
  };
}

// Instance temporaire du service
export const PayrollService = new TempPayrollService();
