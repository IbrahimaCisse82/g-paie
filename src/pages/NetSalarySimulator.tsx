import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PayrollService } from '@/lib/payroll-service';
import type { PayrollCalculationResult } from '@/types/payroll';

const CONVENTIONS = [
  'COMMERCE',
  'INDUSTRIES_ALIMENTAIRES',
  'MECANIQUE_GENERALE',
  'PRESTATIONS_DE_SERVICES',
  'INDUSTRIES_HOTELIERES',
  'BTP',
  'SECURITE_PRIVEE',
  'Convention collective interprofessionnelle'
];

const CATEGORIES = [
  '1_er A', '1_er B', '2_ème', '3_ème', '4_ème', '5_ème', '6_ème', '7_ème A', '7_ème B', '8_ème A', '8_ème B', '8_ème C', '9_ème A', '9_ème B', '10_ème A', '10_ème B', '10_ème C', '11_ème',
  'Manœuvre', 'Ouvrier Spécialisé', 'Ouvrier Qualifié', 'Agent de Maîtrise', 'Technicien', 'Cadre', 'Cadre Supérieur'
];

export default function NetSalarySimulatorPage() {
  const [form, setForm] = useState({
    salaire_base: 0,
    convention_collective: '',
    categorie: '',
    type_contrat: 'CDI',
    situation_familiale: 'Célibataire',
    nombre_enfants: 0,
    nombre_conjoints: 0,
    heures_supp: 0,
    primes: 0,
    absences: 0,
  });
  const [result, setResult] = useState<PayrollCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSimulate = async () => {
    setLoading(true);
    // Construction d'un faux employé pour la simulation
    const fakeEmployee = {
      id: 'SIMU',
      matricule: 'SIMU',
      prenom: 'Simulation',
      nom: 'Test',
      sexe: 'Masculin',
      date_embauche: '2020-01-01',
      ...form,
      statut: 'Actif',
      nationalite: 'Sénégalaise',
      poste: 'Simulation',
      email: '',
      telephone: '',
      adresse: '',
      date_naissance: '1990-01-01',
      lieu_naissance: '',
      date_sortie: null,
      created_at: '',
      updated_at: '',
    };
    // Construction des éléments variables
    const payItems = [
      form.heures_supp > 0 ? { type_element: 'HEURES_SUPPLEMENTAIRES', libelle: 'Heures supp', montant: 0, nombre_heures: form.heures_supp, taux_horaire: 0 } : null,
      form.primes > 0 ? { type_element: 'PRIMES', libelle: 'Primes', montant: form.primes } : null,
      form.absences > 0 ? { type_element: 'ABSENCES', libelle: 'Absences', montant: form.absences } : null,
    ].filter(Boolean);

    // Appel du service de calcul (à adapter pour accepter un employé en paramètre)
    const result = await PayrollService.calculatePayroll({
      employe_id: fakeEmployee.id,
      mois: 1,
      annee: 2024,
      include_pay_items: false, // ou true si vous adaptez la logique
    });
    setResult(result);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Simulateur de salaire net</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Formulaire de saisie */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Salaire brut</label>
              <Input type="number" value={form.salaire_base} onChange={e => handleChange('salaire_base', Number(e.target.value))} />
            </div>
            <div>
              <label>Convention collective</label>
              <Select value={form.convention_collective} onValueChange={v => handleChange('convention_collective', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {CONVENTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label>Catégorie</label>
              <Select value={form.categorie} onValueChange={v => handleChange('categorie', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label>Type de contrat</label>
              <Select value={form.type_contrat} onValueChange={v => handleChange('type_contrat', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="Stage">Stage</SelectItem>
                  <SelectItem value="Intérim">Intérim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label>Situation familiale</label>
              <Select value={form.situation_familiale} onValueChange={v => handleChange('situation_familiale', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Célibataire">Célibataire</SelectItem>
                  <SelectItem value="Marié(e)">Marié(e)</SelectItem>
                  <SelectItem value="Divorcé(e)">Divorcé(e)</SelectItem>
                  <SelectItem value="Veuf/Veuve">Veuf/Veuve</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label>Enfants à charge</label>
              <Input type="number" value={form.nombre_enfants} min={0} onChange={e => handleChange('nombre_enfants', Number(e.target.value))} />
            </div>
            <div>
              <label>Conjoints à charge</label>
              <Input type="number" value={form.nombre_conjoints} min={0} onChange={e => handleChange('nombre_conjoints', Number(e.target.value))} />
            </div>
            <div>
              <label>Heures supplémentaires</label>
              <Input type="number" value={form.heures_supp} min={0} onChange={e => handleChange('heures_supp', Number(e.target.value))} />
            </div>
            <div>
              <label>Primes</label>
              <Input type="number" value={form.primes} min={0} onChange={e => handleChange('primes', Number(e.target.value))} />
            </div>
            <div>
              <label>Absences (montant)</label>
              <Input type="number" value={form.absences} min={0} onChange={e => handleChange('absences', Number(e.target.value))} />
            </div>
          </div>
          <Button className="mt-4" onClick={handleSimulate} disabled={loading}>
            {loading ? 'Calcul...' : 'Simuler'}
          </Button>
          {/* Affichage du résultat */}
          {result && result.success && (
            <div className="mt-6 space-y-2">
              <div>Salaire brut : <b>{result.payroll?.salaire_brut} FCFA</b></div>
              <div>Cotisations : {result.payroll?.total_retenues_salariales} FCFA</div>
              <div>IR : {result.payroll?.ir_salarie} FCFA</div>
              <div>Salaire net : <b>{result.payroll?.salaire_net} FCFA</b></div>
              <div>Coût employeur : {result.payroll?.cout_total_employeur} FCFA</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 