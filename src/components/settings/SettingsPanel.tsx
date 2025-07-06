
import React from 'react';
import { CompanyInfoForm } from './CompanyInfoForm';
import { PayrollParametersForm } from './PayrollParametersForm';
import { ConventionsSection } from './ConventionsSection';

export const SettingsPanel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent mb-2">
            Paramètres du Système
          </h1>
          <p className="text-gray-600">Configurez votre système RH et de paie</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg">
            <CompanyInfoForm />
          </div>
          <div className="bg-white rounded-xl shadow-lg">
            <PayrollParametersForm />
          </div>
          <div className="bg-white rounded-xl shadow-lg">
            <ConventionsSection />
          </div>
        </div>
      </div>
    </div>
  );
};
