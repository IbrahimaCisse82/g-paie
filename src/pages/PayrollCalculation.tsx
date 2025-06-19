
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PayrollCalculator } from '@/components/payroll/PayrollCalculator';

const PayrollCalculation = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Calcul de Paie</h1>
        <PayrollCalculator />
      </div>
    </MainLayout>
  );
};

export default PayrollCalculation;
