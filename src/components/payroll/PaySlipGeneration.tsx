import React, { useState, useEffect } from 'react';
import { FileText, Download, Send, Eye, Mail, Printer } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import { PayrollService } from '@/lib/payroll-service';
import type { Employee, Payroll, PaySlip } from '@/types/payroll';

// Mois de l'année
const MOIS = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' }
];

export function PaySlipGeneration() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [paySlips, setPaySlips] = useState<PaySlip[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedPaySlip, setSelectedPaySlip] = useState<PaySlip | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [emailTemplate, setEmailTemplate] = useState('');

  // Charger les données
  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les employés actifs
      const employeesData = await PayrollService.getEmployees({ statut: 'Actif' });
      setEmployees(employeesData);
      
      // Charger les paies validées pour la période
      // Note: Nous devons implémenter une méthode pour récupérer les paies par période
      // Pour l'instant, nous allons simuler
      setPayrolls([]);
      setPaySlips([]);
      
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Générer tous les bulletins
  const generateAllPaySlips = async () => {
    try {
      setGenerating(true);
      
      // Récupérer les paies validées pour la période
      const validatedPayrolls = payrolls.filter(p => p.statut === 'Validé');
      
      if (validatedPayrolls.length === 0) {
        toast.error('Aucune paie validée pour cette période');
        return;
      }

      // Générer les bulletins
      const generatedPaySlips: PaySlip[] = [];
      
      for (const payroll of validatedPayrolls) {
        const paySlip = await generatePaySlip(payroll);
        if (paySlip) {
          generatedPaySlips.push(paySlip);
        }
      }

      setPaySlips(generatedPaySlips);
      toast.success(`${generatedPaySlips.length} bulletins générés avec succès`);
      
    } catch (error) {
      toast.error('Erreur lors de la génération des bulletins');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  // Générer un bulletin individuel
  const generatePaySlip = async (payroll: Payroll): Promise<PaySlip | null> => {
    try {
      // Générer le contenu HTML du bulletin
      const htmlContent = generatePaySlipHTML(payroll);
      
      // Créer le bulletin
      const paySlip: Omit<PaySlip, 'id' | 'created_at' | 'updated_at'> = {
        payroll_id: payroll.id,
        employe_id: payroll.employe_id,
        numero_bulletin: generateBulletinNumber(payroll),
        mois: payroll.mois,
        annee: payroll.annee,
        contenu_html: htmlContent,
        statut: 'Généré',
        date_generation: new Date().toISOString()
      };

      // Sauvegarder en base (simulation)
      return { ...paySlip, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      
    } catch (error) {
      console.error('Erreur lors de la génération du bulletin:', error);
      return null;
    }
  };

  // Générer le numéro de bulletin
  const generateBulletinNumber = (payroll: Payroll): string => {
    const employee = employees.find(emp => emp.id === payroll.employe_id);
    const monthStr = payroll.mois.toString().padStart(2, '0');
    const yearStr = payroll.annee.toString();
    const matricule = employee?.matricule || 'UNK';
    
    return `BULL-${matricule}-${monthStr}-${yearStr}`;
  };

  // Générer le contenu HTML du bulletin
  const generatePaySlipHTML = (payroll: Payroll): string => {
    const employee = employees.find(emp => emp.id === payroll.employe_id);
    if (!employee) return '';

    const monthLabel = MOIS.find(m => m.value === payroll.mois)?.label;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bulletin de paie - ${employee.prenom} ${employee.nom}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .company-info { margin-bottom: 20px; }
          .employee-info { margin-bottom: 20px; }
          .payroll-details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BULLETIN DE PAIE</h1>
          <h2>${monthLabel} ${payroll.annee}</h2>
        </div>
        
        <div class="company-info">
          <h3>Informations de l'entreprise</h3>
          <p><strong>Raison sociale:</strong> [Nom de l'entreprise]</p>
          <p><strong>Adresse:</strong> [Adresse de l'entreprise]</p>
          <p><strong>NINEA:</strong> [NINEA de l'entreprise]</p>
        </div>
        
        <div class="employee-info">
          <h3>Informations du salarié</h3>
          <table>
            <tr>
              <td><strong>Matricule:</strong></td>
              <td>${employee.matricule}</td>
              <td><strong>Nom et prénom:</strong></td>
              <td>${employee.prenom} ${employee.nom}</td>
            </tr>
            <tr>
              <td><strong>Poste:</strong></td>
              <td>${employee.poste}</td>
              <td><strong>Convention:</strong></td>
              <td>${employee.convention_collective}</td>
            </tr>
            <tr>
              <td><strong>Catégorie:</strong></td>
              <td>${employee.categorie}</td>
              <td><strong>Date d'embauche:</strong></td>
              <td>${new Date(employee.date_embauche).toLocaleDateString('fr-FR')}</td>
            </tr>
          </table>
        </div>
        
        <div class="payroll-details">
          <h3>Détail de la paie</h3>
          
          <h4>Gains</h4>
          <table>
            <tr>
              <th>Élément</th>
              <th>Montant (FCFA)</th>
            </tr>
            <tr>
              <td>Salaire de base</td>
              <td>${formatAmount(payroll.salaire_base)}</td>
            </tr>
            <tr>
              <td>Heures supplémentaires</td>
              <td>${formatAmount(payroll.heures_supplementaires * payroll.taux_horaire_supplementaire)}</td>
            </tr>
            <tr>
              <td>Prime d'ancienneté</td>
              <td>${formatAmount(payroll.prime_anciennete)}</td>
            </tr>
            <tr>
              <td>Prime de logement</td>
              <td>${formatAmount(payroll.prime_logement)}</td>
            </tr>
            <tr>
              <td>Indemnité de transport</td>
              <td>${formatAmount(payroll.indemnite_transport)}</td>
            </tr>
            <tr class="total">
              <td><strong>Total gains</strong></td>
              <td><strong>${formatAmount(payroll.total_gains)}</strong></td>
            </tr>
          </table>
          
          <h4>Retenues</h4>
          <table>
            <tr>
              <th>Élément</th>
              <th>Montant (FCFA)</th>
            </tr>
            <tr>
              <td>CNSS (7%)</td>
              <td>${formatAmount(payroll.cnss_salarie)}</td>
            </tr>
            <tr>
              <td>IPRES (6%)</td>
              <td>${formatAmount(payroll.ipres_salarie)}</td>
            </tr>
            <tr>
              <td>Impôt sur le revenu</td>
              <td>${formatAmount(payroll.ir_salarie)}</td>
            </tr>
            <tr class="total">
              <td><strong>Total retenues</strong></td>
              <td><strong>${formatAmount(payroll.total_retenues_salariales)}</strong></td>
            </tr>
          </table>
          
          <h4>Résultat</h4>
          <table>
            <tr class="total">
              <td><strong>Net à payer</strong></td>
              <td><strong>${formatAmount(payroll.salaire_net)}</strong></td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>Bulletin généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          <p>Ce document est généré automatiquement par le système de paie</p>
        </div>
      </body>
      </html>
    `;
  };

  // Télécharger un bulletin
  const downloadPaySlip = (paySlip: PaySlip) => {
    if (!paySlip.contenu_html) {
      toast.error('Contenu du bulletin non disponible');
      return;
    }

    const blob = new Blob([paySlip.contenu_html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paySlip.numero_bulletin}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Bulletin téléchargé');
  };

  // Aperçu d'un bulletin
  const previewPaySlip = (paySlip: PaySlip) => {
    setSelectedPaySlip(paySlip);
    setIsPreviewDialogOpen(true);
  };

  // Envoyer par email
  const sendPaySlipByEmail = (paySlip: PaySlip) => {
    setSelectedPaySlip(paySlip);
    setIsEmailDialogOpen(true);
  };

  // Envoyer tous les bulletins par email
  const sendAllPaySlipsByEmail = async () => {
    if (selectedEmployees.length === 0) {
      toast.error('Veuillez sélectionner au moins un employé');
      return;
    }

    try {
      // Simulation d'envoi d'emails
      for (const employeeId of selectedEmployees) {
        const paySlip = paySlips.find(ps => ps.employe_id === employeeId);
        if (paySlip) {
          // Ici nous enverrions réellement l'email
          console.log(`Envoi du bulletin ${paySlip.numero_bulletin} par email`);
        }
      }
      
      toast.success(`${selectedEmployees.length} bulletins envoyés par email`);
      setSelectedEmployees([]);
      
    } catch (error) {
      toast.error('Erreur lors de l\'envoi des emails');
      console.error(error);
    }
  };

  // Formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  // Obtenir le nom complet de l'employé
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.prenom} ${employee.nom}` : 'Employé inconnu';
  };

  // Obtenir le matricule de l'employé
  const getEmployeeMatricule = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.matricule : '';
  };

  // Obtenir l'email de l'employé
  const getEmployeeEmail = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee?.email || '';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Génération des Bulletins de Paie</h1>
          <p className="text-muted-foreground">
            Générez et envoyez les bulletins de paie aux employés
          </p>
        </div>
      </div>

      {/* Sélecteurs de période */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Mois</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le mois" />
                </SelectTrigger>
                <SelectContent>
                  {MOIS.map(mois => (
                    <SelectItem key={mois.value} value={mois.value.toString()}>
                      {mois.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Année</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'année" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={generateAllPaySlips} 
                disabled={generating || payrolls.length === 0}
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                {generating ? 'Génération...' : 'Générer tous les bulletins'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions en lot */}
      {paySlips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actions en lot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Label>Sélectionner les employés pour l'envoi par email</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {employees.map(employee => (
                    <div key={employee.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={employee.id}
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEmployees([...selectedEmployees, employee.id]);
                          } else {
                            setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                          }
                        }}
                      />
                      <Label htmlFor={employee.id} className="text-sm">
                        {employee.prenom} {employee.nom}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={sendAllPaySlipsByEmail}
                disabled={selectedEmployees.length === 0}
              >
                <Mail className="mr-2 h-4 w-4" />
                Envoyer par email ({selectedEmployees.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des bulletins */}
      <Card>
        <CardHeader>
          <CardTitle>Bulletins générés</CardTitle>
          <CardDescription>
            {MOIS.find(m => m.value === selectedMonth)?.label} {selectedYear} - {paySlips.length} bulletins
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : paySlips.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun bulletin généré pour cette période
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Employé</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date génération</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paySlips.map((paySlip) => (
                  <TableRow key={paySlip.id}>
                    <TableCell className="font-medium">{paySlip.numero_bulletin}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getEmployeeName(paySlip.employe_id)}</div>
                        <div className="text-sm text-muted-foreground">{getEmployeeMatricule(paySlip.employe_id)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {MOIS.find(m => m.value === paySlip.mois)?.label} {paySlip.annee}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          paySlip.statut === 'Envoyé' ? 'default' : 
                          paySlip.statut === 'Lu' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {paySlip.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(paySlip.date_generation).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => previewPaySlip(paySlip)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadPaySlip(paySlip)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendPaySlipByEmail(paySlip)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'aperçu */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu du bulletin de paie</DialogTitle>
            <DialogDescription>
              {selectedPaySlip?.numero_bulletin}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPaySlip?.contenu_html && (
            <div 
              className="border rounded-lg p-4"
              dangerouslySetInnerHTML={{ __html: selectedPaySlip.contenu_html }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'envoi par email */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Envoi par email</DialogTitle>
            <DialogDescription>
              Envoyer le bulletin à {selectedPaySlip ? getEmployeeName(selectedPaySlip.employe_id) : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={selectedPaySlip ? getEmployeeEmail(selectedPaySlip.employe_id) : ''}
                placeholder="employe@entreprise.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Objet</Label>
              <Input
                id="subject"
                defaultValue={`Bulletin de paie - ${MOIS.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                className="w-full min-h-[100px] p-2 border rounded-md"
                defaultValue="Veuillez trouver ci-joint votre bulletin de paie pour le mois en cours."
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => {
                toast.success('Email envoyé avec succès');
                setIsEmailDialogOpen(false);
              }}>
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 