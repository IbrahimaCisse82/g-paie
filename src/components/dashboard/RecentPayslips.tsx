
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye } from 'lucide-react';

const recentPayslips = [
  {
    id: 1,
    employee: "Amadou Diallo",
    matricule: "EMP001",
    month: "Juin 2024",
    amount: "385,000 FCFA",
    status: "Généré",
    date: "2024-06-30"
  },
  {
    id: 2,
    employee: "Fatou Sall",
    matricule: "EMP002", 
    month: "Juin 2024",
    amount: "420,000 FCFA",
    status: "Généré",
    date: "2024-06-30"
  },
  {
    id: 3,
    employee: "Moussa Kane",
    matricule: "EMP003",
    month: "Juin 2024",
    amount: "350,000 FCFA",
    status: "En cours",
    date: "2024-06-30"
  },
  {
    id: 4,
    employee: "Aïcha Ba",
    matricule: "EMP004",
    month: "Juin 2024",
    amount: "475,000 FCFA",
    status: "Généré",
    date: "2024-06-30"
  }
];

export const RecentPayslips = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Bulletins de Paie Récents</CardTitle>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Voir tout
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Employé</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Matricule</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Période</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Montant</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPayslips.map((payslip) => (
                <tr key={payslip.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{payslip.employee}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{payslip.matricule}</td>
                  <td className="py-3 px-4 text-gray-600">{payslip.month}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{payslip.amount}</td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={payslip.status === 'Généré' ? 'default' : 'secondary'}
                      className={payslip.status === 'Généré' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {payslip.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
