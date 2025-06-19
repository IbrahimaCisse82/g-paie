
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Salaire Net', value: 38500000, color: '#3B82F6' },
  { name: 'CNSS', value: 3200000, color: '#10B981' },
  { name: 'IPRES', value: 2100000, color: '#F59E0B' },
  { name: 'IR', value: 1400000, color: '#EF4444' },
];

export const PayrollSummary = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Répartition de la Masse Salariale</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-center">
          <div className="w-1/2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${(value as number / 1000000).toFixed(1)}M FCFA`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{(item.value / 1000000).toFixed(1)}M FCFA</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
