
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface PaySlipPDFProps {
  paySlipId: string;
}

export const PaySlipPDF: React.FC<PaySlipPDFProps> = ({ paySlipId }) => {
  const { data: paySlipData } = useQuery({
    queryKey: ['paySlipDetails', paySlipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pay_slips')
        .select(`
          *,
          employees!inner(
            matricule,
            prenom,
            nom,
            poste,
            type_contrat,
            date_entree,
            statut
          ),
          salary_elements!inner(
            salaire_brut,
            cnss_salarie,
            ipres_salarie,
            ir,
            prime_anciennete,
            prime_logement,
            indemnite_transport
          ),
          social_contributions!inner(
            cotisation_patronale
          )
        `)
        .eq('id', paySlipId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const generatePDF = () => {
    if (!paySlipData) return;

    const printContent = document.getElementById('payslip-content');
    if (printContent) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Bulletin de Paie - ${paySlipData.employees.prenom} ${paySlipData.employees.nom}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
                .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                .company-info { width: 45%; }
                .bulletin-header { width: 45%; background-color: #1e40af; color: white; padding: 10px; text-align: center; }
                .employee-info { background-color: #1e40af; color: white; padding: 8px; margin: 10px 0; }
                .employee-details { display: flex; justify-content: space-between; margin: 10px 0; }
                .salary-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .salary-table th, .salary-table td { border: 1px solid #ccc; padding: 5px; text-align: center; }
                .salary-table th { background-color: #1e40af; color: white; }
                .total-row { background-color: #1e40af; color: white; font-weight: bold; }
                .net-salary { background-color: #f0f9ff; }
                .summary-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .summary-table th, .summary-table td { border: 1px solid #1e40af; padding: 8px; text-align: center; }
                .summary-table th { background-color: #1e40af; color: white; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        newWindow.document.close();
        newWindow.print();
      }
    }
  };

  if (!paySlipData) {
    return <div>Chargement...</div>;
  }

  const employee = paySlipData.employees;
  const salaryElement = paySlipData.salary_elements;
  const socialContrib = paySlipData.social_contributions;

  // Calculs pour l'affichage
  const salaireBrut = Number(salaryElement.salaire_brut);
  const cnss = Number(salaryElement.cnss_salarie);
  const ipres = Number(salaryElement.ipres_salarie);
  const ir = Number(salaryElement.ir);
  const primeAnciennete = Number(salaryElement.prime_anciennete) || 0;
  const primeLogement = Number(salaryElement.prime_logement) || 0;
  const indemniteTransport = Number(salaryElement.indemnite_transport) || 0;
  const cotisationPatronale = Number(socialContrib.cotisation_patronale);

  const totalCotisations = cnss + ipres;
  const salaireNet = Number(paySlipData.salaire_net);

  return (
    <div className="space-y-4">
      <Button onClick={generatePDF} className="flex items-center space-x-2">
        <Download className="h-4 w-4" />
        <span>Télécharger PDF</span>
      </Button>

      <div id="payslip-content" className="bg-white p-8 max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="header">
          <div className="company-info">
            <h2 className="text-xl font-bold text-blue-900">LE MEDICAL KAMANO</h2>
            <p>Tél. : 221 77 633 01 34</p>
            <p>Adr. : 4, Bld République x Mouhamed V</p>
            <p>NINEA : 006760210</p>
          </div>
          <div className="bulletin-header">
            <h2 className="text-xl font-bold">BULLETIN DE PAIE</h2>
            <div className="mt-4 text-sm">
              <p>Période du 01/{String(new Date().getMonth() + 1).padStart(2, '0')}/{paySlipData.annee}</p>
              <p>au 30/{String(new Date().getMonth() + 1).padStart(2, '0')}/{paySlipData.annee}</p>
              <p>Mode de paiement par chèque</p>
            </div>
          </div>
        </div>

        {/* Informations employé */}
        <div className="employee-info">
          <div className="flex justify-between">
            <span>MATRICULE : {employee.matricule}</span>
            <span>IF0001</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>PRENOM ET NOM : {employee.prenom} {employee.nom}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>EMPLOI : {employee.poste || 'COMMIS'}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>ADRESSE : Grand Yoff, Maka 2, Dakar - SÉNÉGAL</span>
          </div>
        </div>

        {/* Détails employé */}
        <div className="employee-details">
          <div>
            <p><strong>#VALEUR!</strong></p>
            <p>Ancienneté : 12 an(s) et 9 mois</p>
            <p>Catégorie : 3_ème</p>
            <br />
            <p>Statut : EMPLOYES</p>
            <p>Contrat : {employee.type_contrat}</p>
          </div>
          <div className="text-right">
            <p>Situation de famille : Marié(e)</p>
            <p>Nombre de conjoint(e) : 1</p>
            <p>Nombre d'enfants : 5</p>
            <p>Nombre de parts TRIMF : 2</p>
            <p>Nombre de parts IR : 4</p>
          </div>
        </div>

        {/* Tableau des salaires */}
        <table className="salary-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Désignation</th>
              <th>Base</th>
              <th>Nombre</th>
              <th>Taux</th>
              <th colspan="2">Part salarié</th>
              <th colspan="2">Part patronale</th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th>Gains</th>
              <th>Retenues</th>
              <th>Taux</th>
              <th>Cotisations</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>10</td>
              <td>SALAIRE DE BASE</td>
              <td>{salaireBrut.toLocaleString()}</td>
              <td>173,33</td>
              <td>100%</td>
              <td>{salaireBrut.toLocaleString()}</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            {primeAnciennete > 0 && (
              <tr>
                <td>11</td>
                <td>PRIME D'ANCIENNETÉ</td>
                <td>{primeAnciennete.toLocaleString()}</td>
                <td>173,33</td>
                <td>12%</td>
                <td>{primeAnciennete.toLocaleString()}</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            )}
            {primeLogement > 0 && (
              <tr>
                <td>12</td>
                <td>PRIME DE LOGEMENT</td>
                <td>{primeLogement.toLocaleString()}</td>
                <td>173,33</td>
                <td>100%</td>
                <td>{primeLogement.toLocaleString()}</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            )}
            
            <tr className="total-row">
              <td colspan="5"><strong>Total brut</strong></td>
              <td><strong>{salaireBrut.toLocaleString()}</strong></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            
            <tr>
              <td>51</td>
              <td>Impôt sur revenu</td>
              <td></td>
              <td>4</td>
              <td></td>
              <td></td>
              <td>{ir.toLocaleString()}</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>53</td>
              <td>IPRES Régime Général</td>
              <td>{salaireBrut.toLocaleString()}</td>
              <td></td>
              <td>5,6%</td>
              <td></td>
              <td>{ipres.toLocaleString()}</td>
              <td>8,40%</td>
              <td>{(salaireBrut * 0.084).toLocaleString()}</td>
            </tr>
            <tr>
              <td>58</td>
              <td>CSS-Accident de travail</td>
              <td>{salaireBrut.toLocaleString()}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>5,00%</td>
              <td>{(salaireBrut * 0.05).toLocaleString()}</td>
            </tr>
            <tr>
              <td>59</td>
              <td>CFCE</td>
              <td>{salaireBrut.toLocaleString()}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>3,00%</td>
              <td>{(salaireBrut * 0.03).toLocaleString()}</td>
            </tr>
            
            <tr className="total-row">
              <td colspan="6"><strong>Total cotisations</strong></td>
              <td><strong>{totalCotisations.toLocaleString()}</strong></td>
              <td></td>
              <td><strong>{cotisationPatronale.toLocaleString()}</strong></td>
            </tr>
            
            <tr className="net-salary">
              <td colspan="5"><strong>Rémunération Nette</strong></td>
              <td><strong>{salaireNet.toLocaleString()}</strong></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            
            {indemniteTransport > 0 && (
              <tr>
                <td>70</td>
                <td>Indemnité de transport</td>
                <td>120</td>
                <td>173</td>
                <td>100%</td>
                <td>{indemniteTransport.toLocaleString()}</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Tableau récapitulatif */}
        <table className="summary-table">
          <thead>
            <tr>
              <th>CUMULS</th>
              <th>BRUT</th>
              <th>IR</th>
              <th>TRIMF</th>
              <th>PROV. CONGÉ</th>
              <th>IPRES RG</th>
              <th>IPRES RC</th>
              <th>Net à payer</th>
              <th>Signature</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>période</td>
              <td>{salaireBrut.toLocaleString()}</td>
              <td>-</td>
              <td>{Math.round(salaireBrut * 0.008).toLocaleString()}</td>
              <td>{Math.round(salaireBrut * 0.083).toLocaleString()}</td>
              <td>{ipres.toLocaleString()}</td>
              <td>-</td>
              <td>{salaireNet.toLocaleString()} CFA</td>
              <td></td>
            </tr>
            <tr>
              <td>année</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
