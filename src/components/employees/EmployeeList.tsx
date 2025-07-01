
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Phone, Mail, MapPin, Calendar, User, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddEmployeeDialog } from './AddEmployeeDialog';

export const EmployeeList = () => {
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <span className="text-lg font-medium">
            {employees?.length || 0} employé(s)
          </span>
        </div>
        <AddEmployeeDialog />
      </div>

      <div className="grid gap-4">
        {employees?.map((employee) => (
          <Card key={employee.id} className="card-hover">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {employee.prenom} {employee.nom}
                  </h3>
                  <p className="text-gray-600">
                    Matricule: {employee.matricule}
                  </p>
                  {employee.poste && (
                    <p className="text-gray-600">
                      Poste: {employee.poste}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Badge variant={employee.statut === 'Actif' ? 'default' : 'secondary'}>
                    {employee.statut}
                  </Badge>
                  <Badge variant="outline">
                    {employee.type_contrat}
                  </Badge>
                  {employee.categorie && (
                    <Badge variant="outline">
                      {employee.categorie}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {employee.sexe && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{employee.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
                  </div>
                )}

                {employee.date_naissance && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(employee.date_naissance).toLocaleDateString()}</span>
                  </div>
                )}

                {employee.lieu_naissance && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{employee.lieu_naissance}</span>
                  </div>
                )}

                {employee.nationalite && (
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span>{employee.nationalite}</span>
                  </div>
                )}

                {employee.date_entree && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Entrée: {new Date(employee.date_entree).toLocaleDateString()}</span>
                  </div>
                )}

                {employee.date_sortie && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Sortie: {new Date(employee.date_sortie).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {employee.motif_sortie && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    <strong>Motif de sortie:</strong> {employee.motif_sortie}
                  </div>
                </div>
              )}

              {employee.date_retour_conge && (
                <div className="mt-2">
                  <div className="text-sm text-gray-600">
                    <strong>Retour de congé:</strong> {new Date(employee.date_retour_conge).toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {(!employees || employees.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun employé
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par ajouter votre premier employé
              </p>
              <AddEmployeeDialog />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
