import { 
  ELEMENT_TYPES, 
  PAYROLL_STATUS, 
  CATEGORIES, 
  MONTHS,
  formatCurrency,
  formatPercentage
} from '../constants/payroll';

/**
 * Utilitaires de calcul de paie avancés
 * Centralise toutes les logiques de calcul métier
 */

// Types pour les calculs
export interface PayrollCalculationInput {
  employeeId: string;
  grossSalary: number;
  elements: PayrollElement[];
  socialChargeRate: number;
  taxRate: number;
  workingHours?: number;
  overtimeHours?: number;
  category?: string;
  conventionId?: string;
}

export interface PayrollElement {
  type: string;
  description: string;
  amount: number;
  isTaxable: boolean;
  isSocialChargeable: boolean;
  isRecurring?: boolean;
  formula?: string;
}

export interface PayrollCalculationResult {
  grossSalary: number;
  totalDeductions: number;
  totalAdditions: number;
  taxableAmount: number;
  socialChargeableAmount: number;
  socialCharges: number;
  taxCharges: number;
  netSalary: number;
  employerCharges: number;
  totalCost: number;
  breakdown: PayrollBreakdown;
}

export interface PayrollBreakdown {
  baseSalary: number;
  bonuses: number;
  allowances: number;
  overtime: number;
  deductions: number;
  socialCharges: {
    employee: number;
    employer: number;
    breakdown: SocialChargeBreakdown;
  };
  taxes: {
    income: number;
    professional: number;
    other: number;
  };
}

export interface SocialChargeBreakdown {
  pension: number;
  health: number;
  unemployment: number;
  workAccident: number;
  familyAllowance: number;
  socialSecurity: number;
}

/**
 * Calcul principal de la paie
 */
export const calculatePayroll = (input: PayrollCalculationInput): PayrollCalculationResult => {
  const {
    grossSalary,
    elements = [],
    socialChargeRate,
    taxRate,
    workingHours = 0,
    overtimeHours = 0
  } = input;

  // Calcul des éléments de paie
  const { totalAdditions, totalDeductions } = calculateElements(elements);
  
  // Calcul du salaire brut ajusté
  const adjustedGrossSalary = grossSalary + totalAdditions - totalDeductions;
  
  // Calcul des montants imposables - Utiliser le salaire brut de base pour éviter le double comptage
  const taxableAmount = calculateTaxableAmount(grossSalary, elements);
  const socialChargeableAmount = calculateSocialChargeableAmount(grossSalary, elements);
  
  // Calcul des charges sociales
  const socialCharges = calculateSocialCharges(socialChargeableAmount, socialChargeRate);
  const employerCharges = calculateEmployerCharges(socialChargeableAmount, socialChargeRate);
  
  // Calcul des impôts
  const taxCharges = calculateTaxes(taxableAmount - socialCharges, taxRate);
  
  // Calcul du salaire net
  const netSalary = adjustedGrossSalary - socialCharges - taxCharges;
  
  // Coût total pour l'employeur
  const totalCost = adjustedGrossSalary + employerCharges;
  
  // Détail des calculs
  const breakdown = generateBreakdown(
    adjustedGrossSalary,
    elements,
    socialCharges,
    employerCharges,
    taxCharges,
    workingHours,
    overtimeHours
  );

  return {
    grossSalary: adjustedGrossSalary,
    totalDeductions,
    totalAdditions,
    taxableAmount,
    socialChargeableAmount,
    socialCharges,
    taxCharges,
    netSalary,
    employerCharges,
    totalCost,
    breakdown
  };
};

/**
 * Calcul des éléments de paie (primes, indemnités, déductions)
 */
export const calculateElements = (elements: PayrollElement[]) => {
  const totalAdditions = elements
    .filter(e => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);
    
  const totalDeductions = elements
    .filter(e => e.amount < 0)
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);

  return { totalAdditions, totalDeductions };
};

/**
 * Calcul du montant imposable
 */
export const calculateTaxableAmount = (grossSalary: number, elements: PayrollElement[]): number => {
  const taxableElements = elements.filter(e => e.isTaxable);
  const taxableAdditions = taxableElements
    .filter(e => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);
  const taxableDeductions = taxableElements
    .filter(e => e.amount < 0)
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);

  return grossSalary + taxableAdditions - taxableDeductions;
};

/**
 * Calcul du montant soumis aux charges sociales
 */
export const calculateSocialChargeableAmount = (grossSalary: number, elements: PayrollElement[]): number => {
  const socialChargeableElements = elements.filter(e => e.isSocialChargeable);
  const socialChargeableAdditions = socialChargeableElements
    .filter(e => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);
  const socialChargeableDeductions = socialChargeableElements
    .filter(e => e.amount < 0)
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);

  return grossSalary + socialChargeableAdditions - socialChargeableDeductions;
};

/**
 * Calcul des charges sociales salariales
 */
export const calculateSocialCharges = (amount: number, rate: number): number => {
  return Math.round(amount * rate * 100) / 100;
};

/**
 * Calcul des charges sociales patronales
 */
export const calculateEmployerCharges = (amount: number, rate: number): number => {
  // Les charges patronales sont généralement plus élevées
  const employerRate = rate * 1.4; // Facteur approximatif
  return Math.round(amount * employerRate * 100) / 100;
};

/**
 * Calcul des impôts
 */
export const calculateTaxes = (taxableAmount: number, taxRate: number): number => {
  if (taxableAmount <= 0) return 0;
  return Math.round(taxableAmount * taxRate * 100) / 100;
};

/**
 * Calcul détaillé des charges sociales
 */
export const calculateDetailedSocialCharges = (amount: number): SocialChargeBreakdown => {
  const baseAmount = amount;
  
  return {
    pension: Math.round(baseAmount * 0.0475 * 100) / 100,
    health: Math.round(baseAmount * 0.0575 * 100) / 100,
    unemployment: Math.round(baseAmount * 0.024 * 100) / 100,
    workAccident: Math.round(baseAmount * 0.0055 * 100) / 100,
    familyAllowance: Math.round(baseAmount * 0.054 * 100) / 100,
    socialSecurity: Math.round(baseAmount * 0.0135 * 100) / 100
  };
};

/**
 * Génération du détail des calculs
 */
export const generateBreakdown = (
  grossSalary: number,
  elements: PayrollElement[],
  socialCharges: number,
  employerCharges: number,
  taxCharges: number,
  workingHours: number,
  overtimeHours: number
): PayrollBreakdown => {
  const bonuses = elements
    .filter(e => e.type === 'PRIME' && e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);
    
  const allowances = elements
    .filter(e => e.type === 'INDEMNITE' && e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);
    
  const overtime = elements
    .filter(e => e.type === 'HEURES_SUPPLEMENTAIRES' && e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);
    
  const deductions = elements
    .filter(e => e.amount < 0)
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);

  const socialChargeBreakdown = calculateDetailedSocialCharges(grossSalary);

  return {
    baseSalary: grossSalary - bonuses - allowances - overtime,
    bonuses,
    allowances,
    overtime,
    deductions,
    socialCharges: {
      employee: socialCharges,
      employer: employerCharges,
      breakdown: socialChargeBreakdown
    },
    taxes: {
      income: taxCharges,
      professional: 0,
      other: 0
    }
  };
};

/**
 * Calcul des heures supplémentaires
 */
export const calculateOvertime = (
  regularHours: number,
  workedHours: number,
  hourlyRate: number,
  overtimeRate: number = 1.25
): number => {
  const overtimeHours = Math.max(0, workedHours - regularHours);
  return Math.round(overtimeHours * hourlyRate * overtimeRate * 100) / 100;
};

/**
 * Calcul du taux horaire
 */
export const calculateHourlyRate = (monthlySalary: number, monthlyHours: number = 173.33): number => {
  if (monthlyHours === 0) return 0;
  return Math.round((monthlySalary / monthlyHours) * 10000) / 10000;
};

/**
 * Calcul de l'ancienneté
 */
export const calculateSeniority = (hireDate: string): number => {
  const hire = new Date(hireDate);
  const now = new Date();
  
  let years = now.getFullYear() - hire.getFullYear();
  const m = now.getMonth() - hire.getMonth();
  
  if (m < 0 || (m === 0 && now.getDate() < hire.getDate())) {
    years--;
  }
  
  // Si la date d'embauche est aujourd'hui mais il y a 5 ans, la différence doit être 5.
  // Ex: 2019-07-26 to 2024-07-26 -> 5 ans.
  // Le calcul simple de diff peut donner 4.99...
  const hirePlusYears = new Date(hire.getTime());
  hirePlusYears.setFullYear(hire.getFullYear() + years);

  if (now >= hirePlusYears) {
     const nextAnniversary = new Date(hire.getTime());
     nextAnniversary.setFullYear(now.getFullYear());
     if(now < nextAnniversary) {
        // anniversary not passed yet this year
     } else {
        const anniversaryPlusOne = new Date(hire.getTime());
        anniversaryPlusOne.setFullYear(hire.getFullYear() + years + 1);
        if(now >= anniversaryPlusOne) {
            years++;
        }
     }
  }

  // Correction pour le cas limite où on est le jour de l'anniversaire
  const anniversaryThisYear = new Date(hire);
  anniversaryThisYear.setFullYear(now.getFullYear());
  if (now >= anniversaryThisYear && now.getMonth() === hire.getMonth() && now.getDate() >= hire.getDate()) {
      const potentialYears = now.getFullYear() - hire.getFullYear();
      if (potentialYears > years) return potentialYears;
  }
  
  const diffTime = now.getTime() - hire.getTime();
  return Math.floor(diffTime / (365.25 * 24 * 60 * 60 * 1000));
};

/**
 * Calcul de la prime d'ancienneté
 */
export const calculateSeniorityBonus = (baseSalary: number, seniority: number): number => {
  let rate = 0;
  
  if (seniority >= 2 && seniority < 5) {
    rate = 0.02; // 2%
  } else if (seniority >= 5 && seniority < 10) {
    rate = 0.05; // 5%
  } else if (seniority >= 10 && seniority < 15) {
    rate = 0.08; // 8%
  } else if (seniority >= 15) {
    rate = 0.10; // 10%
  }
  
  return Math.round(baseSalary * rate * 100) / 100;
};

/**
 * Validation des données de paie
 */
export const validatePayrollData = (input: PayrollCalculationInput): string[] => {
  const errors: string[] = [];
  
  if (!input.employeeId) {
    errors.push('ID employé requis');
  }
  
  if (input.grossSalary <= 0) {
    errors.push('Le salaire brut doit être supérieur à 0');
  }
  
  if (input.socialChargeRate < 0 || input.socialChargeRate > 1) {
    errors.push('Le taux de charges sociales doit être entre 0 et 1');
  }
  
  if (input.taxRate < 0 || input.taxRate > 1) {
    errors.push("Le taux d'impôt doit être entre 0 et 1");
  }
  
  return errors;
};

/**
 * Formatage des résultats de paie
 */
export const formatPayrollResult = (result: PayrollCalculationResult): Record<string, string> => {
  return {
    grossSalary: formatCurrency(result.grossSalary),
    socialCharges: formatCurrency(result.socialCharges),
    taxCharges: formatCurrency(result.taxCharges),
    netSalary: formatCurrency(result.netSalary),
    employerCharges: formatCurrency(result.employerCharges),
    totalCost: formatCurrency(result.totalCost),
    socialChargeRate: formatPercentage(result.socialCharges / result.grossSalary),
    taxRate: formatPercentage(result.taxCharges / result.grossSalary),
    netRate: formatPercentage(result.netSalary / result.grossSalary)
  };
};

/**
 * Comparaison de deux calculs de paie
 */
export const comparePayrollResults = (
  current: PayrollCalculationResult,
  previous: PayrollCalculationResult
): Record<string, { current: number; previous: number; difference: number; percentage: number }> => {
  const compare = (currentValue: number, previousValue: number) => ({
    current: currentValue,
    previous: previousValue,
    difference: currentValue - previousValue,
    percentage: previousValue ? ((currentValue - previousValue) / previousValue) * 100 : 0
  });
  
  return {
    grossSalary: compare(current.grossSalary, previous.grossSalary),
    socialCharges: compare(current.socialCharges, previous.socialCharges),
    taxCharges: compare(current.taxCharges, previous.taxCharges),
    netSalary: compare(current.netSalary, previous.netSalary),
    employerCharges: compare(current.employerCharges, previous.employerCharges),
    totalCost: compare(current.totalCost, previous.totalCost)
  };
};
