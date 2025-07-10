import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle, AlertCircle, Download, Send, Eye, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

import { PayrollService, validatePayrollCalculations } from '@/lib/payroll-service';
import type { Employee, Payroll, PayrollCalculationResult } from '@/types/payroll';

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

// Ajout de la fonction de vérification
async function handleValidatePayroll(payroll: Payroll, setLoading: (b: boolean) => void) {
  setLoading(true);
  try {
    const attendu = payroll.salaire_net;
    const result = await validatePayrollCalculations(payroll.employe_id, payroll.mois, payroll.annee, attendu);
    if (result.ok) {
      toast.success(`✅ Calcul conforme : aucun écart détecté (≤ 1 FCFA) pour ${payroll.employe_id}`);
    } else {
      toast.error(`❌ Écart détecté pour ${payroll.employe_id} : ${result.message || 'Erreur inconnue'}`);
    }
  } catch (error) {
    toast.error('Erreur lors de la vérification');
    console.error(error);
  } finally {
    setLoading(false);
  }
}

// Fonction pour vérifier tous les calculs du mois
async function handleValidateAllPayrolls(payrolls: Payroll[], setLoading: (b: boolean) => void) {
  setLoading(true);
  let ok = 0, ko = 0, details: string[] = [];
  for (const payroll of payrolls) {
    const attendu = payroll.salaire_net;
    const result = await validatePayrollCalculations(payroll.employe_id, payroll.mois, payroll.annee, attendu);
    if (result.ok) {
      ok++;
    } else {
      ko++;
      details.push(`${payroll.employe_id}: ${result.message}`);
    }
  }
  setLoading(false);
  if (ko === 0) {
    toast.success(`✅ Tous les calculs sont conformes (${ok} vérifiés)`);
  } else {
    toast.error(`❌ ${ko} écart(s) détecté(s) sur ${payrolls.length} paies.\n${details.join('\n')}`);
  }
}

export function PayrollCalculation() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [calculationDetails, setCalculationDetails] = useState<PayrollCalculationResult | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Charger les employés
  useEffect(() => {
    loadEmployees();
  }, []);

  // Charger les paies calculées
  useEffect(() => {
    loadPayrolls();
  }, [selectedMonth, selectedYear]);

  const loadEmployees = async () => {
    try {
      const data = await PayrollService.getEmployees({ statut: 'Actif' });
      setEmployees(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des employés');
      console.error(error);
    }
  };

  const loadPayrolls = async () => {
    try {
      setLoading(true);
      // Ici nous devrions avoir une méthode pour récupérer toutes les paies d'une période
      // Pour l'instant, nous allons calculer individuellement
      setPayrolls([]);
    } catch (error) {
      toast.error('Erreur lors du chargement des paies');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculer la paie pour tous les employés
  const calculateAllPayrolls = async () => {
    try {
      setCalculating(true);
      const activeEmployees = employees.filter(emp => emp.statut === 'Actif');
      const results: Payroll[] = [];

      for (const employee of activeEmployees) {
        const result = await PayrollService.calculatePayroll({
          employe_id: employee.id,
          mois: selectedMonth,
          annee: selectedYear,
          include_pay_items: true
        });

        if (result.success && result.payroll) {
          results.push(result.payroll);
        }
      }

      setPayrolls(results);
      toast.success(`${results.length} paies calculées avec succès`);
    } catch (error) {
      toast.error('Erreur lors du calcul des paies');
      console.error(error);
    } finally {
      setCalculating(false);
    }
  };

  // Calculer la paie pour un employé spécifique
  const calculateEmployeePayroll = async (employeeId: string) => {
    try {
      const result = await PayrollService.calculatePayroll({
        employe_id: employeeId,
        mois: selectedMonth,
        annee: selectedYear,
        include_pay_items: true
      });

      if (result.success && result.payroll) {
        setCalculationDetails(result);
        setIsDetailsDialogOpen(true);
        
        // Mettre à jour la liste
        const updatedPayrolls = payrolls.filter(p => p.employe_id !== employeeId);
        setPayrolls([...updatedPayrolls, result.payroll]);
      } else {
        toast.error(result.error || 'Erreur lors du calcul');
      }
    } catch (error) {
      toast.error('Erreur lors du calcul');
      console.error(error);
    }
  };

  // Valider une paie
  const validatePayroll = async (payrollId: string) => {
    try {
      await PayrollService.updatePayroll(payrollId, { 
        statut: 'Validé',
        date_validation: new Date().toISOString()
      });
      toast.success('Paie validée avec succès');
      loadPayrolls();
    } catch (error) {
      toast.error('Erreur lors de la validation');
      console.error(error);
    }
  };

  // Marquer comme payé
  const markAsPaid = async (payrollId: string) => {
    try {
      await PayrollService.updatePayroll(payrollId, { 
        statut: 'Payé',
        date_paiement: new Date().toISOString()
      });
      toast.success('Paie marquée comme payée');
      loadPayrolls();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
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

  // Calculer les statistiques
  const getStatistics = () => {
    const totalEmployees = employees.filter(emp => emp.statut === 'Actif').length;
    const calculatedPayrolls = payrolls.length;
    const validatedPayrolls = payrolls.filter(p => p.statut === 'Validé').length;
    const paidPayrolls = payrolls.filter(p => p.statut === 'Payé').length;
    
    const totalMasseSalariale = payrolls.reduce((sum, p) => sum + p.salaire_brut, 0);
    const totalSalaireNet = payrolls.reduce((sum, p) => sum + p.salaire_net, 0);
    const totalCotisations = payrolls.reduce((sum, p) => sum + p.total_retenues_salariales, 0);

    return {
      totalEmployees,
      calculatedPayrolls,
      validatedPayrolls,
      paidPayrolls,
      totalMasseSalariale,
      totalSalaireNet,
      totalCotisations,
      progress: totalEmployees > 0 ? (calculatedPayrolls / totalEmployees) * 100 : 0
    };
  };

  const stats = getStatistics();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calcul et Validation des Paies</h1>
          <p className="text-muted-foreground">
            Calculez et validez les paies pour la période sélectionnée
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
                onClick={calculateAllPayrolls} 
                disabled={calculating || employees.length === 0}
                className="w-full"
              >
                <Calculator className="mr-2 h-4 w-4" />
                {calculating ? 'Calcul en cours...' : 'Calculer toutes les paies'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <div className="text-sm text-muted-foreground">Employés actifs</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.calculatedPayrolls}</div>
              <div className="text-sm text-muted-foreground">Paies calculées</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.validatedPayrolls}</div>
              <div className="text-sm text-muted-foreground">Paies validées</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.paidPayrolls}</div>
              <div className="text-sm text-muted-foreground">Paies payées</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progression */}
      <Card>
        <CardHeader>
          <CardTitle>Progression du calcul</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{Math.round(stats.progress)}%</span>
            </div>
            <Progress value={stats.progress} className="w-full" />
            <div className="text-sm text-muted-foreground">
              {stats.calculatedPayrolls} sur {stats.totalEmployees} employés traités
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé financier */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé financier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Masse salariale brute</div>
              <div className="text-lg font-semibold">{formatAmount(stats.totalMasseSalariale)}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Total cotisations</div>
              <div className="text-lg font-semibold">{formatAmount(stats.totalCotisations)}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Salaire net total</div>
              <div className="text-lg font-semibold">{formatAmount(stats.totalSalaireNet)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vérification globale */}
      <div className="flex justify-end mb-4">
        <Button
          variant="default"
          onClick={() => handleValidateAllPayrolls(payrolls, setLoading)}
          disabled={payrolls.length === 0 || loading}
        >
          <ShieldCheck className="h-4 w-4 mr-2" />
          Vérifier tous les calculs du mois
        </Button>
      </div>

      {/* Liste des paies */}
      <Card>
        <CardHeader>
          <CardTitle>Paies calculées</CardTitle>
          <CardDescription>
            {MOIS.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : payrolls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune paie calculée pour cette période
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Salaire brut</TableHead>
                  <TableHead>Cotisations</TableHead>
                  <TableHead>Salaire net</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getEmployeeName(payroll.employe_id)}</div>
                        <div className="text-sm text-muted-foreground">{getEmployeeMatricule(payroll.employe_id)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatAmount(payroll.salaire_brut)}</TableCell>
                    <TableCell>{formatAmount(payroll.total_retenues_salariales)}</TableCell>
                    <TableCell className="font-medium">{formatAmount(payroll.salaire_net)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          payroll.statut === 'Payé' ? 'default' : 
                          payroll.statut === 'Validé' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {payroll.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => calculateEmployeePayroll(payroll.employe_id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {payroll.statut === 'Calculé' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => validatePayroll(payroll.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {payroll.statut === 'Validé' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsPaid(payroll.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Bouton Vérifier le calcul */}
                        <Button
                          size="sm"
                          variant="outline"
                          title="Vérifier le calcul"
                          onClick={() => handleValidatePayroll(payroll, setLoading)}
                        >
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
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

      {/* Dialog de détails de calcul */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du calcul de paie</DialogTitle>
            <DialogDescription>
              Aperçu détaillé des calculs effectués
            </DialogDescription>
          </DialogHeader>
          
          {calculationDetails && (
            <div className="space-y-6">
              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations de base</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Employé</Label>
                      <p>{getEmployeeName(calculationDetails.payroll!.employe_id)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Période</Label>
                      <p>{MOIS.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Salaire de base</Label>
                      <p>{formatAmount(calculationDetails.payroll!.salaire_base)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Heures supplémentaires</Label>
                      <p>{calculationDetails.payroll!.heures_supplementaires} heures</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Détail des gains */}
              {calculationDetails.details && (
                <Card>
                  <CardHeader>
                    <CardTitle>Détail des gains</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Élément</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(calculationDetails.details.gains_breakdown).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell className="text-right">{formatAmount(value)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-medium">
                          <TableCell>Total gains</TableCell>
                          <TableCell className="text-right">{formatAmount(calculationDetails.payroll!.total_gains)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Détail des retenues */}
              {calculationDetails.details && (
                <Card>
                  <CardHeader>
                    <CardTitle>Détail des retenues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Élément</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(calculationDetails.details.deductions_breakdown).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell className="text-right">{formatAmount(value)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-medium">
                          <TableCell>Total retenues</TableCell>
                          <TableCell className="text-right">{formatAmount(calculationDetails.payroll!.total_retenues_salariales)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Résultat final */}
              <Card>
                <CardHeader>
                  <CardTitle>Résultat final</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Salaire net à payer</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatAmount(calculationDetails.payroll!.salaire_net)}
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Coût total employeur</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatAmount(calculationDetails.payroll!.cout_total_employeur)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {calculationDetails?.payroll && (
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleValidatePayroll(calculationDetails.payroll, setLoading)}
                    title="Vérifier le calcul"
                  >
                    <ShieldCheck className="h-4 w-4 text-blue-600 mr-2" />
                    Vérifier le calcul
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 