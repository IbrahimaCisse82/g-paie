
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, FileText, TrendingUp } from 'lucide-react';
import { EmployeeStats } from './EmployeeStats';
import { RecentPayslips } from './RecentPayslips';
import { PayrollSummary } from './PayrollSummary';

const stats = [
  {
    title: "Total Employés",
    value: "156",
    change: "+12% ce mois",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Masse Salariale",
    value: "45.2M FCFA",
    change: "+5% ce mois",
    icon: CreditCard,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "Bulletins Générés",
    value: "156",
    change: "100% traités",
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    title: "Cotisations CNSS",
    value: "3.2M FCFA",
    change: "En cours",
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  }
];

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Vue d'ensemble de votre système RH</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmployeeStats />
        <PayrollSummary />
      </div>

      <RecentPayslips />
    </div>
  );
};
