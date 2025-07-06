
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface CategoryInfoProps {
  tauxHoraire: number;
  salaireBase: number;
  statut: string;
}

export const CategoryInfo = ({ tauxHoraire, salaireBase, statut }: CategoryInfoProps) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-blue-700">
          <Info className="h-4 w-4" />
          <span>Informations automatiques</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="text-center">
            <Badge className="bg-green-100 text-green-700 px-3 py-1">
              Taux Horaire
            </Badge>
            <p className="font-semibold text-lg mt-1">{tauxHoraire.toLocaleString()} FCFA</p>
          </div>
          
          <div className="text-center">
            <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
              Salaire de Base
            </Badge>
            <p className="font-semibold text-lg mt-1">{salaireBase.toLocaleString()} FCFA</p>
          </div>
          
          <div className="text-center">
            <Badge className="bg-purple-100 text-purple-700 px-3 py-1">
              Statut
            </Badge>
            <p className="font-semibold text-lg mt-1">{statut}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
