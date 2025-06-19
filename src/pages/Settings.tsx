
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

const Settings = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <SettingsPanel />
      </div>
    </MainLayout>
  );
};

export default Settings;
