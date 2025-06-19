
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, FileText } from 'lucide-react';

export const PayrollCalculator = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Calcul Automatique</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Calculez automatiquement les salaires de tous les employés pour le mois en cours.
          </p>
          <Button className="w-full">
            Calculer les Salaires
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Calcul Manuel</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Calculez manuellement le salaire d'un employé spécifique.
          </p>
          <Button variant="outline" className="w-full">
            Calcul Manuel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
