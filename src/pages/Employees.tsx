
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { EmployeeList } from '@/components/employees/EmployeeList';

const Employees = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Employés</h1>
        <EmployeeList />
      </div>
    </MainLayout>
  );
};

export default Employees;
