
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PaySlipList } from '@/components/payslips/PaySlipList';

const PaySlips = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Bulletins de Paie</h1>
        <PaySlipList />
      </div>
    </MainLayout>
  );
};

export default PaySlips;
