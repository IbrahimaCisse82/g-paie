
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ConventionsList } from '@/components/conventions/ConventionsList';

const Conventions = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Conventions Collectives</h1>
        <ConventionsList />
      </div>
    </MainLayout>
  );
};

export default Conventions;
