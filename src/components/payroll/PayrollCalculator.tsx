
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, FileText, Users, TrendingUp } from 'lucide-react';
import { PayrollForm } from './PayrollForm';
import { AdvancedPayrollForm } from './AdvancedPayrollForm';
import { BulkPayrollCalculator } from './BulkPayrollCalculator';
import { PeriodicReportsGenerator } from '../reports/PeriodicReportsGenerator';

export const PayrollCalculator = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Manuel</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Avancé</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Automatique</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Rapports</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual">
          <PayrollForm />
        </TabsContent>
        
        <TabsContent value="advanced">
          <AdvancedPayrollForm />
        </TabsContent>
        
        <TabsContent value="bulk">
          <BulkPayrollCalculator />
        </TabsContent>
        
        <TabsContent value="reports">
          <PeriodicReportsGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};
