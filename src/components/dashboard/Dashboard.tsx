
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, FileText, TrendingUp } from 'lucide-react';
import { EmployeeStats } from './EmployeeStats';
import { RecentPayslips } from './RecentPayslips';
import { PayrollSummary } from './PayrollSummary';
import { PalettePreview } from '../PalettePreview';

const stats = [
  {
    title: "Total Employés",
    value: "156",
    change: "+12% ce mois",
    icon: Users,
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    iconBg: "from-blue-500 to-green-500"
  },
  {
    title: "Masse Salariale",
    value: "45.2M FCFA",
    change: "+5% ce mois",
    icon: CreditCard,
    color: "text-green-700",
    bgColor: "bg-green-100",
    iconBg: "from-blue-500 to-green-500"
  },
  {
    title: "Bulletins Générés",
    value: "156",
    change: "100% traités",
    icon: FileText,
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    iconBg: "from-blue-500 to-green-500"
  },
  {
    title: "Cotisations CNSS",
    value: "3.2M FCFA",
    change: "En cours",
    icon: TrendingUp,
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    iconBg: "from-blue-500 to-green-500"
  }
];

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="space-y-6 p-6">
        <div className="text-center py-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent mb-4">
            Dashboard RH & Paie
          </h2>
          <p className="text-gray-600 text-lg">Vue d'ensemble de votre système RH</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${stat.bgColor} ${stat.color} mb-2`}>
                      {stat.title}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-4 rounded-full bg-gradient-to-r ${stat.iconBg} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg">
            <EmployeeStats />
          </div>
          <div className="bg-white rounded-xl shadow-lg">
            <PayrollSummary />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          <RecentPayslips />
        </div>
      </div>
      <div className="mt-10">
        <PalettePreview />
      </div>
    </div>
  );
};
