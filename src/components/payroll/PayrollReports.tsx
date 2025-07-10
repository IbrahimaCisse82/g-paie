import React, { useState, useEffect } from 'react';
import { FileText, Download, BarChart3, PieChart, TrendingUp, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

import { PayrollService } from '@/lib/payroll-service';
import type { Employee, Payroll, PayrollStatistics } from '@/types/payroll';

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

// Types de rapports
const REPORT_TYPES = [
  { value: 'LIVRE_PAIE', label: 'Livre de paie', icon: FileText },
  { value: 'RECAPITULATIF_COTISATIONS', label: 'Récapitulatif des cotisations', icon: BarChart3 },
  { value: 'ETAT_CNSS', label: 'État CNSS', icon: FileText },
  { value: 'ETAT_IPRES', label: 'État IPRES', icon: FileText },
  { value: 'ETAT_IR', label: 'État IR', icon: FileText }
];

export function PayrollReports() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [statistics, setStatistics] = useState<PayrollStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedReportType, setSelectedReportType] = useState<string>('LIVRE_PAIE');

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
      
      // Charger les statistiques
      const stats = await PayrollService.getPayrollStatistics(selectedMonth, selectedYear);
      setStatistics(stats);
      
      // Charger les paies (simulation)
      setPayrolls([]);
      
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Générer un rapport
  const generateReport = async (reportType: string) => {
    try {
      setGenerating(true);
      
      // Simulation de génération de rapport
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Rapport ${REPORT_TYPES.find(t => t.value === reportType)?.label} généré avec succès`);
      
    } catch (error) {
      toast.error('Erreur lors de la génération du rapport');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  // Télécharger un rapport
  const downloadReport = (reportType: string) => {
    const reportName = REPORT_TYPES.find(t => t.value === reportType)?.label;
    const fileName = `${reportName}_${MOIS.find(m => m.value === selectedMonth)?.label}_${selectedYear}.pdf`;
    
    // Simulation de téléchargement
    const link = document.createElement('a');
    link.href = '#';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Rapport ${reportName} téléchargé`);
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rapports et États</h1>
          <p className="text-muted-foreground">
            Générez et consultez les différents rapports de paie
          </p>
        </div>
      </div>

      {/* Sélecteurs */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
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
              <Label>Type de rapport</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => generateReport(selectedReportType)}
                  disabled={generating}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {generating ? 'Génération...' : 'Générer'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => downloadReport(selectedReportType)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques générales */}
      {statistics && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{statistics.total_employes}</div>
                  <div className="text-sm text-muted-foreground">Employés</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{formatAmount(statistics.total_masse_salariale)}</div>
                  <div className="text-sm text-muted-foreground">Masse salariale</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{formatAmount(statistics.total_cotisations_salariales)}</div>
                  <div className="text-sm text-muted-foreground">Cotisations salariales</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{formatAmount(statistics.moyenne_salaire)}</div>
                  <div className="text-sm text-muted-foreground">Salaire moyen</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets des rapports */}
      <Tabs defaultValue="livre-paie" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="livre-paie">Livre de paie</TabsTrigger>
          <TabsTrigger value="cotisations">Cotisations</TabsTrigger>
          <TabsTrigger value="cnss">CNSS</TabsTrigger>
          <TabsTrigger value="ipres">IPRES</TabsTrigger>
          <TabsTrigger value="ir">IR</TabsTrigger>
        </TabsList>

        <TabsContent value="livre-paie" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Livre de paie - {MOIS.find(m => m.value === selectedMonth)?.label} {selectedYear}</CardTitle>
              <CardDescription>
                Vue consolidée de toutes les paies du mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Chargement...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matricule</TableHead>
                      <TableHead>Employé</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>Salaire brut</TableHead>
                      <TableHead>Cotisations</TableHead>
                      <TableHead>Salaire net</TableHead>
                      <TableHead>Coût employeur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => {
                      const payroll = payrolls.find(p => p.employe_id === employee.id);
                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.matricule}</TableCell>
                          <TableCell>{employee.prenom} {employee.nom}</TableCell>
                          <TableCell>{employee.poste}</TableCell>
                          <TableCell>{payroll ? formatAmount(payroll.salaire_brut) : '-'}</TableCell>
                          <TableCell>{payroll ? formatAmount(payroll.total_retenues_salariales) : '-'}</TableCell>
                          <TableCell>{payroll ? formatAmount(payroll.salaire_net) : '-'}</TableCell>
                          <TableCell>{payroll ? formatAmount(payroll.cout_total_employeur) : '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cotisations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif des cotisations</CardTitle>
              <CardDescription>
                Détail des cotisations salariales et patronales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Cotisations salariales</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>CNSS (7%)</TableCell>
                        <TableCell className="text-right">{statistics ? formatAmount(statistics.total_cotisations_salariales * 0.54) : '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>IPRES (6%)</TableCell>
                        <TableCell className="text-right">{statistics ? formatAmount(statistics.total_cotisations_salariales * 0.46) : '-'}</TableCell>
                      </TableRow>
                      <TableRow className="font-medium">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{statistics ? formatAmount(statistics.total_cotisations_salariales) : '-'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Cotisations patronales</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>CNSS (14%)</TableCell>
                        <TableCell className="text-right">{statistics ? formatAmount(statistics.total_cotisations_patronales * 0.65) : '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>IPRES (7.5%)</TableCell>
                        <TableCell className="text-right">{statistics ? formatAmount(statistics.total_cotisations_patronales * 0.35) : '-'}</TableCell>
                      </TableRow>
                      <TableRow className="font-medium">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{statistics ? formatAmount(statistics.total_cotisations_patronales) : '-'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cnss" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>État CNSS</CardTitle>
              <CardDescription>
                Déclaration des cotisations CNSS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Cotisations salariales</div>
                    <div className="text-lg font-semibold">
                      {statistics ? formatAmount(statistics.total_cotisations_salariales * 0.54) : '-'}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Cotisations patronales</div>
                    <div className="text-lg font-semibold">
                      {statistics ? formatAmount(statistics.total_cotisations_patronales * 0.65) : '-'}
                    </div>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employé</TableHead>
                      <TableHead>Salaire brut</TableHead>
                      <TableHead>Base CNSS</TableHead>
                      <TableHead>Cotisation salarié</TableHead>
                      <TableHead>Cotisation employeur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => {
                      const payroll = payrolls.find(p => p.employe_id === employee.id);
                      const baseCNSS = payroll ? Math.min(payroll.salaire_brut, 600000) : 0;
                      return (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.prenom} {employee.nom}</TableCell>
                          <TableCell>{payroll ? formatAmount(payroll.salaire_brut) : '-'}</TableCell>
                          <TableCell>{formatAmount(baseCNSS)}</TableCell>
                          <TableCell>{formatAmount(baseCNSS * 0.07)}</TableCell>
                          <TableCell>{formatAmount(baseCNSS * 0.14)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ipres" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>État IPRES</CardTitle>
              <CardDescription>
                Déclaration des cotisations IPRES
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Cotisations salariales</div>
                    <div className="text-lg font-semibold">
                      {statistics ? formatAmount(statistics.total_cotisations_salariales * 0.46) : '-'}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Cotisations patronales</div>
                    <div className="text-lg font-semibold">
                      {statistics ? formatAmount(statistics.total_cotisations_patronales * 0.35) : '-'}
                    </div>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employé</TableHead>
                      <TableHead>Salaire brut</TableHead>
                      <TableHead>Base IPRES</TableHead>
                      <TableHead>Cotisation salarié</TableHead>
                      <TableHead>Cotisation employeur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => {
                      const payroll = payrolls.find(p => p.employe_id === employee.id);
                      const baseIPRES = payroll ? Math.min(payroll.salaire_brut, 600000) : 0;
                      return (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.prenom} {employee.nom}</TableCell>
                          <TableCell>{payroll ? formatAmount(payroll.salaire_brut) : '-'}</TableCell>
                          <TableCell>{formatAmount(baseIPRES)}</TableCell>
                          <TableCell>{formatAmount(baseIPRES * 0.06)}</TableCell>
                          <TableCell>{formatAmount(baseIPRES * 0.075)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ir" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>État Impôt sur le Revenu</CardTitle>
              <CardDescription>
                Déclaration de l'impôt sur le revenu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Total IR retenu</div>
                  <div className="text-lg font-semibold">
                    {statistics ? formatAmount(statistics.total_cotisations_salariales * 0.3) : '-'}
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employé</TableHead>
                      <TableHead>Salaire brut</TableHead>
                      <TableHead>Base imposable</TableHead>
                      <TableHead>IR retenu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => {
                      const payroll = payrolls.find(p => p.employe_id === employee.id);
                      const baseImposable = payroll ? payroll.salaire_brut - (payroll.cnss_salarie + payroll.ipres_salarie) : 0;
                      return (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.prenom} {employee.nom}</TableCell>
                          <TableCell>{payroll ? formatAmount(payroll.salaire_brut) : '-'}</TableCell>
                          <TableCell>{formatAmount(baseImposable)}</TableCell>
                          <TableCell>{payroll ? formatAmount(payroll.ir_salarie) : '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 