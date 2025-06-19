
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ReportsList } from '@/components/reports/ReportsList';

const Reports = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
        <ReportsList />
      </div>
    </MainLayout>
  );
};

export default Reports;
