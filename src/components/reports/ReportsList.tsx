
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart, TrendingUp, Users } from 'lucide-react';
import { ReportGenerator } from './ReportGenerator';

export const ReportsList = () => {
  const reports = [
    {
      title: 'Rapport de Paie Mensuel',
      description: 'Synthèse des salaires du mois',
      icon: BarChart3,
      color: 'text-blue-600',
      type: 'monthly' as const
    },
    {
      title: 'Analyse des Coûts',
      description: 'Répartition des coûts par département',
      icon: PieChart,
      color: 'text-green-600',
      type: 'costs' as const
    },
    {
      title: 'Évolution des Salaires',
      description: 'Tendances sur les 12 derniers mois',
      icon: TrendingUp,
      color: 'text-purple-600',
      type: 'evolution' as const
    },
    {
      title: 'Statistiques Employés',
      description: 'Effectifs et répartition',
      icon: Users,
      color: 'text-orange-600',
      type: 'statistics' as const
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {reports.map((report, index) => (
        <Card key={index} className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <report.icon className={`h-6 w-6 ${report.color}`} />
              <span>{report.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{report.description}</p>
            <ReportGenerator reportType={report.type} title={report.title} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
