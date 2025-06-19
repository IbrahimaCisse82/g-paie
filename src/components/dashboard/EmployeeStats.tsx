
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', employes: 142 },
  { name: 'Fév', employes: 145 },
  { name: 'Mar', employes: 148 },
  { name: 'Avr', employes: 151 },
  { name: 'Mai', employes: 153 },
  { name: 'Juin', employes: 156 },
];

export const EmployeeStats = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Évolution des Employés</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="employes" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
