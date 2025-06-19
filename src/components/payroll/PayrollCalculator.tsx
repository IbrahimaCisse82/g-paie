
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, FileText, Users } from 'lucide-react';
import { PayrollForm } from './PayrollForm';
import { BulkPayrollCalculator } from './BulkPayrollCalculator';

export const PayrollCalculator = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Calcul Manuel</span>
          </TabsTrigger>
          <TabsTrigger value="automatic" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Calcul Automatique</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual">
          <PayrollForm />
        </TabsContent>
        
        <TabsContent value="automatic">
          <BulkPayrollCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
};
