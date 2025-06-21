
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generatePeriodicReports } from '@/utils/payrollCalculations';
import { Calendar, FileText, TrendingUp } from 'lucide-react';

export const PeriodicReportsGenerator = () => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    periodType: 'monthly' as 'monthly' | 'quarterly' | 'semiannually' | 'annually' | 'custom',
    startDate: '',
    endDate: ''
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      return generatePeriodicReports(
        formData.periodType,
        formData.startDate || undefined,
        formData.endDate || undefined
      );
    },
    onSuccess: (result) => {
      // Générer un fichier CSV avec les résultats
      const csvContent = [
        'Type de Rapport,Période,Montant Brut Total,Total Cotisations,Salaire Net Total,Charges Patronales,Nombre de Bulletins',
        `${formData.periodType},${formData.startDate || 'Auto'} - ${formData.endDate || 'Auto'},${result.totalBrut},${result.totalCotisations},${result.totalNet},${result.totalChargesPatronales},${result.payslipsCount}`
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rapport_${formData.periodType}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Rapport généré",
        description: `Rapport ${formData.periodType} téléchargé avec succès. Total net: ${result.totalNet.toLocaleString()} FCFA`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateReportMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Rapports Périodiques</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="periodType">Type de Période</Label>
            <Select 
              value={formData.periodType} 
              onValueChange={(value: any) => setFormData(prev => ({...prev, periodType: value}))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensuel</SelectItem>
                <SelectItem value="quarterly">Trimestriel</SelectItem>
                <SelectItem value="semiannually">Semestriel</SelectItem>
                <SelectItem value="annually">Annuel</SelectItem>
                <SelectItem value="custom">Personnalisé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.periodType === 'custom' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de Début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))}
                  required={formData.periodType === 'custom'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))}
                  required={formData.periodType === 'custom'}
                />
              </div>
            </div>
          )}

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Le rapport inclura :</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Total des salaires bruts</li>
              <li>• Total des cotisations salariales</li>
              <li>• Total des charges patronales (CSS + CFCE)</li>
              <li>• Nombre de bulletins de paie</li>
              <li>• Détail par employé</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={generateReportMutation.isPending}
          >
            <FileText className="h-4 w-4 mr-2" />
            {generateReportMutation.isPending ? 'Génération en cours...' : 'Générer le Rapport'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
