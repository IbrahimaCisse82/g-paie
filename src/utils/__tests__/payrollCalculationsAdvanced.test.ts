import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateElements,
  type PayrollElement
} from '../payrollCalculationsAdvanced';

describe('Payroll Calculations', () => {
  let mockElements: PayrollElement[];

  beforeEach(() => {
    mockElements = [
      {
        type: 'PRIME',
        description: 'Prime de performance',
        amount: 10000,
        isTaxable: true,
        isSocialChargeable: true
      },
      {
        type: 'INDEMNITE',
        description: 'Indemnité de transport',
        amount: 5000,
        isTaxable: false,
        isSocialChargeable: true
      },
      {
        type: 'RETENUE',
        description: 'Retenue avance',
        amount: -3000,
        isTaxable: true,
        isSocialChargeable: false
      }
    ];
  });

  describe('calculateElements', () => {
    it('should calculate total additions and deductions correctly', () => {
      const result = calculateElements(mockElements);
      
      expect(result.totalAdditions).toBe(15000); // 10000 + 5000
      expect(result.totalDeductions).toBe(3000); // 3000 (absolute value)
    });

    it('should handle empty elements array', () => {
      const result = calculateElements([]);
      
      expect(result.totalAdditions).toBe(0);
      expect(result.totalDeductions).toBe(0);
    });
  });
});
