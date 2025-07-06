
import React, { useState } from 'react';
import { useAllConventionCategories } from '@/hooks/useConventionCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, FileText } from 'lucide-react';

export const ConventionBareme = () => {
  const { data: categories = [], isLoading } = useAllConventionCategories();
  const [selectedConvention, setSelectedConvention] = useState<string>('all');

  // Grouper par convention collective
  const conventionGroups = categories.reduce((acc, category) => {
    if (!acc[category.convention_collective]) {
      acc[category.convention_collective] = [];
    }
    acc[category.convention_collective].push(category);
    return acc;
  }, {} as Record<string, typeof categories>);

  const conventionNames = Object.keys(conventionGroups);

  // Filtrer les données selon la sélection
  const filteredCategories = selectedConvention === 'all' 
    ? categories 
    : categories.filter(cat => cat.convention_collective === selectedConvention);

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Chargement du barème...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Barème des Conventions Collectives 2023</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Filtrer par convention :</label>
            <Select value={selectedConvention} onValueChange={setSelectedConvention}>
              <SelectTrigger className="w-full md:w-96">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les conventions</SelectItem>
                {conventionNames.map((convention) => (
                  <SelectItem key={convention} value={convention}>
                    {convention.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedConvention === 'all' ? (
            // Affichage groupé par convention
            <div className="space-y-6">
              {Object.entries(conventionGroups).map(([convention, cats]) => (
                <div key={convention} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>{convention.replace(/_/g, ' ')}</span>
                    <Badge variant="secondary">{cats.length} catégories</Badge>
                  </h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Taux Horaire (FCFA)</TableHead>
                          <TableHead className="text-right">Salaire Base (FCFA)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cats.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.categorie}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{category.statut}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {category.taux_horaire.toLocaleString('fr-FR', { 
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 3 
                              })}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {category.salaire_base.toLocaleString('fr-FR')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Affichage pour une convention spécifique
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Taux Horaire (FCFA)</TableHead>
                    <TableHead className="text-right">Salaire Base (FCFA)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.categorie}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.statut}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {category.taux_horaire.toLocaleString('fr-FR', { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 3 
                        })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {category.salaire_base.toLocaleString('fr-FR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune catégorie trouvée pour cette convention.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
