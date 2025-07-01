
import React from 'react';
import { CompanyInfoForm } from './CompanyInfoForm';
import { PayrollParametersForm } from './PayrollParametersForm';
import { ConventionsSection } from './ConventionsSection';

export const SettingsPanel = () => {
  return (
    <div className="space-y-6">
      <CompanyInfoForm />
      <PayrollParametersForm />
      <ConventionsSection />
    </div>
  );
};
