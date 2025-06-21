
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type SalaryElement = Database['public']['Tables']['salary_elements']['Row'];
type PayrollParameters = Database['public']['Tables']['payroll_parameters']['Row'];

export const getLatestPayrollParameters = async (): Promise<PayrollParameters | null> => {
  const { data, error } = await supabase
    .from('payroll_parameters')
    .select('*')
    .order('date_application', { ascending: false })
    .limit(1);
  
  if (error) throw error;
  return data?.[0] || null;
};

export const calculateAdvancedSalaryElements = async (
  employeId: string,
  salaireBrut: number,
  surSalaire: number = 0,
  mois: string,
  annee: number,
  otherFields: {
    emploi?: string;
    contrat?: string;
    situation_contrat?: string;
    prime_anciennete?: number;
    prime_logement?: number;
    indemnite_transport?: number;
    prime_anciennete_rate?: number;
  } = {}
) => {
  // Vérifier la duplication
  const { data: existingElement } = await supabase
    .from('salary_elements')
    .select('id')
    .eq('employe_id', employeId)
    .eq('mois', mois)
    .eq('annee', annee)
    .limit(1);

  if (existingElement && existingElement.length > 0) {
    throw new Error('Un élément de salaire existe déjà pour cet employé, ce mois et cette année.');
  }

  // Récupérer les derniers paramètres de paie
  const parameters = await getLatestPayrollParameters();
  if (!parameters) {
    throw new Error('Aucun paramètre de paie configuré');
  }

  // Calculs avancés selon la nouvelle logique métier
  const baseSalary = salaireBrut;
  const primeAnciennete = otherFields.prime_anciennete_rate 
    ? baseSalary * (otherFields.prime_anciennete_rate / 100)
    : (otherFields.prime_anciennete || 0);
  
  const totalBrut = baseSalary + surSalaire + primeAnciennete;
  
  // Cotisations salariales
  const ipresRg = totalBrut * 0.056; // IPRES Régime Général 5,6%
  const cnss_salarie = totalBrut * (Number(parameters.taux_cnss) / 100);
  const ir = totalBrut * (Number(parameters.taux_ir) / 100);
  const retenueTrimf = 800; // Retenue fixe TRIMF
  
  // Cotisations patronales
  const cssAllocationsFamiliales = totalBrut * 0.07; // CSS Allocations Familiales 7%
  const cssAccidentTravail = totalBrut * 0.05; // CSS Accident de Travail 5%
  const cfce = totalBrut * 0.03; // CFCE 3%
  const cotisation_patronale = cssAllocationsFamiliales + cssAccidentTravail + cfce;
  
  const totalRetenues = ipresRg + cnss_salarie + ir + retenueTrimf;
  const indemnity = otherFields.indemnite_transport || 0;
  const salaire_net = totalBrut - totalRetenues + indemnity;

  // Créer l'élément de salaire avec les nouveaux champs
  const { data: salaryElement, error: salaryError } = await supabase
    .from('salary_elements')
    .insert({
      employe_id: employeId,
      salaire_brut: totalBrut,
      cnss_salarie,
      ipres_salarie: ipresRg,
      ir,
      salaire_net,
      mois,
      annee,
      prime_anciennete: primeAnciennete,
      prime_logement: otherFields.prime_logement || 0,
      indemnite_transport: indemnity,
      ...otherFields
    })
    .select()
    .single();

  if (salaryError) throw salaryError;

  // Créer l'enregistrement dans social_contributions avec les nouvelles cotisations
  const { error: socialError } = await supabase
    .from('social_contributions')
    .insert({
      employe_id: employeId,
      mois,
      annee,
      cnss_salarie,
      ipres_salarie: ipresRg,
      ir,
      cotisation_patronale
    });

  if (socialError) throw socialError;

  // Créer l'enregistrement dans pay_slips avec les détails complets
  const { error: paySlipError } = await supabase
    .from('pay_slips')
    .insert({
      employe_id: employeId,
      mois,
      annee,
      salaire_brut: totalBrut,
      cotisations_salariales: totalRetenues,
      cotisations_patronales: cotisation_patronale,
      salaire_net,
      date_generation: new Date().toISOString().split('T')[0]
    });

  if (paySlipError) throw paySlipError;

  return {
    ...salaryElement,
    totalBrut,
    totalRetenues,
    cssAllocationsFamiliales,
    cssAccidentTravail,
    cfce,
    retenueTrimf,
    ipresRg
  };
};

export const calculateSalaryElements = async (
  employeId: string,
  salaireBrut: number,
  mois: string,
  annee: number,
  otherFields: {
    emploi?: string;
    contrat?: string;
    situation_contrat?: string;
    prime_anciennete?: number;
    prime_logement?: number;
    indemnite_transport?: number;
  } = {}
) => {
  return calculateAdvancedSalaryElements(employeId, salaireBrut, 0, mois, annee, otherFields);
};

export const recalculateAllSalaryElements = async () => {
  const parameters = await getLatestPayrollParameters();
  if (!parameters) {
    throw new Error('Aucun paramètre de paie configuré');
  }

  // Récupérer tous les éléments de salaire actifs
  const { data: salaryElements, error: fetchError } = await supabase
    .from('salary_elements')
    .select('*');

  if (fetchError) throw fetchError;

  for (const element of salaryElements || []) {
    // Recalculer selon les nouvelles formules
    const totalBrut = Number(element.salaire_brut);
    const ipresRg = totalBrut * 0.056;
    const cnss_salarie = totalBrut * (Number(parameters.taux_cnss) / 100);
    const ir = totalBrut * (Number(parameters.taux_ir) / 100);
    const retenueTrimf = 800;
    
    const totalRetenues = ipresRg + cnss_salarie + ir + retenueTrimf;
    const salaire_net = totalBrut - totalRetenues + Number(element.indemnite_transport || 0);

    // Cotisations patronales
    const cssAllocationsFamiliales = totalBrut * 0.07;
    const cssAccidentTravail = totalBrut * 0.05;
    const cfce = totalBrut * 0.03;
    const cotisation_patronale = cssAllocationsFamiliales + cssAccidentTravail + cfce;

    // Mettre à jour l'élément de salaire
    const { error: updateError } = await supabase
      .from('salary_elements')
      .update({
        cnss_salarie,
        ipres_salarie: ipresRg,
        ir,
        salaire_net
      })
      .eq('id', element.id);

    if (updateError) throw updateError;

    // Mettre à jour les cotisations sociales
    const { error: socialUpdateError } = await supabase
      .from('social_contributions')
      .update({
        cnss_salarie,
        ipres_salarie: ipresRg,
        ir,
        cotisation_patronale
      })
      .eq('employe_id', element.employe_id)
      .eq('mois', element.mois!)
      .eq('annee', element.annee!);

    if (socialUpdateError) throw socialUpdateError;

    // Mettre à jour les bulletins de paie
    const { error: paySlipUpdateError } = await supabase
      .from('pay_slips')
      .update({
        salaire_brut: totalBrut,
        cotisations_salariales: totalRetenues,
        cotisations_patronales: cotisation_patronale,
        salaire_net
      })
      .eq('employe_id', element.employe_id)
      .eq('mois', element.mois!)
      .eq('annee', element.annee!);

    if (paySlipUpdateError) throw paySlipUpdateError;
  }
};

export const generatePeriodicReports = async (
  periodType: 'monthly' | 'quarterly' | 'semiannually' | 'annually' | 'custom',
  startDate?: string,
  endDate?: string
) => {
  let dateFilter = {};
  const now = new Date();

  switch (periodType) {
    case 'monthly':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = {
        created_at: {
          gte: startOfMonth.toISOString(),
          lte: endOfMonth.toISOString()
        }
      };
      break;
    case 'quarterly':
      const quarter = Math.floor(now.getMonth() / 3);
      const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
      const endOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      dateFilter = {
        created_at: {
          gte: startOfQuarter.toISOString(),
          lte: endOfQuarter.toISOString()
        }
      };
      break;
    case 'annually':
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      dateFilter = {
        created_at: {
          gte: startOfYear.toISOString(),
          lte: endOfYear.toISOString()
        }
      };
      break;
    case 'custom':
      if (startDate && endDate) {
        dateFilter = {
          created_at: {
            gte: new Date(startDate).toISOString(),
            lte: new Date(endDate).toISOString()
          }
        };
      }
      break;
  }

  const { data: payslips, error } = await supabase
    .from('pay_slips')
    .select('*')
    .gte('created_at', (dateFilter as any).created_at?.gte || '1900-01-01')
    .lte('created_at', (dateFilter as any).created_at?.lte || '2100-12-31');

  if (error) throw error;

  const totalBrut = payslips?.reduce((sum, p) => sum + Number(p.salaire_brut || 0), 0) || 0;
  const totalCotisations = payslips?.reduce((sum, p) => sum + Number(p.cotisations_salariales || 0), 0) || 0;
  const totalNet = payslips?.reduce((sum, p) => sum + Number(p.salaire_net || 0), 0) || 0;
  const totalChargesPatronales = payslips?.reduce((sum, p) => sum + Number(p.cotisations_patronales || 0), 0) || 0;

  return {
    periodType,
    startDate,
    endDate,
    totalBrut,
    totalCotisations,
    totalNet,
    totalChargesPatronales,
    payslipsCount: payslips?.length || 0,
    payslips
  };
};
