
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ConventionsList } from '@/components/conventions/ConventionsList';
import { ConventionBareme } from '@/components/conventions/ConventionBareme';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Conventions = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Conventions Collectives</h1>
        
        <Tabs defaultValue="bareme" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bareme">Barème 2023</TabsTrigger>
            <TabsTrigger value="conventions">Mes Conventions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bareme">
            <ConventionBareme />
          </TabsContent>
          
          <TabsContent value="conventions">
            <ConventionsList />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Conventions;
