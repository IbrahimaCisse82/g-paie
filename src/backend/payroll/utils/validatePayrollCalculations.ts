// Fonction de validation des calculs de paie pour les tests automatisés
export function validatePayrollCalculations(input: any, expected: any) {
  const diffs: string[] = [];

  // Recalcul des valeurs à partir de l'input
  const brut = input.baseSalary + input.primes + input.heuresSupp - input.absences;
  const cotisations = Math.round(brut * input.tauxIPRES_RG) + Math.round(brut * input.tauxCSS);
  const ir = Math.round(input.tauxIR(brut));
  const net = brut - cotisations - ir - input.retenues;

  if (expected.brut !== brut) diffs.push(`Brut attendu: ${expected.brut}, calculé: ${brut}`);
  if (expected.cotisations !== cotisations) diffs.push(`Cotisations attendues: ${expected.cotisations}, calculées: ${cotisations}`);
  if (expected.ir !== ir) diffs.push(`IR attendu: ${expected.ir}, calculé: ${ir}`);
  if (expected.netAPayer !== net) diffs.push(`Net à payer attendu: ${expected.netAPayer}, calculé: ${net}`);

  return {
    valid: diffs.length === 0,
    diffs,
  };
} 