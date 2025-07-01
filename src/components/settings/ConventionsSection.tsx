
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export const ConventionsSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Conventions Collectives</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          Gérez les conventions collectives de votre entreprise
        </p>
        <Button variant="outline">
          Gérer les Conventions
        </Button>
      </CardContent>
    </Card>
  );
};
