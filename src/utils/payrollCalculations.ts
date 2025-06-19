
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

  // Calculs selon les formules
  const cnss_salarie = salaireBrut * (Number(parameters.taux_cnss) / 100);
  const ipres_salarie = salaireBrut * (Number(parameters.taux_ipres) / 100);
  const ir = salaireBrut * (Number(parameters.taux_ir) / 100);
  const salaire_net = salaireBrut - (cnss_salarie + ipres_salarie + ir);
  const cotisation_patronale = salaireBrut * (Number(parameters.taux_cotisation_patronale) / 100);

  // Créer l'élément de salaire
  const { data: salaryElement, error: salaryError } = await supabase
    .from('salary_elements')
    .insert({
      employe_id: employeId,
      salaire_brut: salaireBrut,
      cnss_salarie,
      ipres_salarie,
      ir,
      salaire_net,
      mois,
      annee,
      ...otherFields
    })
    .select()
    .single();

  if (salaryError) throw salaryError;

  // Créer l'enregistrement dans social_contributions
  const { error: socialError } = await supabase
    .from('social_contributions')
    .insert({
      employe_id: employeId,
      mois,
      annee,
      cnss_salarie,
      ipres_salarie,
      ir,
      cotisation_patronale
    });

  if (socialError) throw socialError;

  // Créer l'enregistrement dans pay_slips
  const cotisations_salariales = cnss_salarie + ipres_salarie + ir;
  const { error: paySlipError } = await supabase
    .from('pay_slips')
    .insert({
      employe_id: employeId,
      mois,
      annee,
      salaire_brut: salaireBrut,
      cotisations_salariales,
      cotisations_patronales: cotisation_patronale,
      salaire_net,
      date_generation: new Date().toISOString().split('T')[0]
    });

  if (paySlipError) throw paySlipError;

  return salaryElement;
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
    const cnss_salarie = Number(element.salaire_brut) * (Number(parameters.taux_cnss) / 100);
    const ipres_salarie = Number(element.salaire_brut) * (Number(parameters.taux_ipres) / 100);
    const ir = Number(element.salaire_brut) * (Number(parameters.taux_ir) / 100);
    const salaire_net = Number(element.salaire_brut) - (cnss_salarie + ipres_salarie + ir);

    // Mettre à jour l'élément de salaire
    const { error: updateError } = await supabase
      .from('salary_elements')
      .update({
        cnss_salarie,
        ipres_salarie,
        ir,
        salaire_net
      })
      .eq('id', element.id);

    if (updateError) throw updateError;

    // Mettre à jour les cotisations sociales
    const cotisation_patronale = Number(element.salaire_brut) * (Number(parameters.taux_cotisation_patronale) / 100);
    
    const { error: socialUpdateError } = await supabase
      .from('social_contributions')
      .update({
        cnss_salarie,
        ipres_salarie,
        ir,
        cotisation_patronale
      })
      .eq('employe_id', element.employe_id)
      .eq('mois', element.mois!)
      .eq('annee', element.annee!);

    if (socialUpdateError) throw socialUpdateError;

    // Mettre à jour les bulletins de paie
    const cotisations_salariales = cnss_salarie + ipres_salarie + ir;
    
    const { error: paySlipUpdateError } = await supabase
      .from('pay_slips')
      .update({
        salaire_brut: element.salaire_brut,
        cotisations_salariales,
        cotisations_patronales: cotisation_patronale,
        salaire_net
      })
      .eq('employe_id', element.employe_id)
      .eq('mois', element.mois!)
      .eq('annee', element.annee!);

    if (paySlipUpdateError) throw paySlipUpdateError;
  }
};
