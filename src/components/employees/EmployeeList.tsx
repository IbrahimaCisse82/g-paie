
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
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
                  <p className="text-gray-600">
                    Poste: {employee.poste || 'Non spécifié'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant={employee.statut === 'Actif' ? 'default' : 'secondary'}>
                    {employee.statut}
                  </Badge>
                  <Badge variant="outline">
                    {employee.type_contrat}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {employee.telephone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{employee.telephone}</span>
                  </div>
                )}
                
                {employee.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                )}
                
                {employee.ville && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{employee.ville}</span>
                  </div>
                )}
                
                {employee.salaire_base && employee.salaire_base > 0 && (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span>{employee.salaire_base.toLocaleString()} FCFA</span>
                  </div>
                )}
              </div>

              {(employee.situation_familiale || employee.nombre_enfants > 0) && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex space-x-4 text-sm text-gray-600">
                    {employee.situation_familiale && (
                      <span>Situation: {employee.situation_familiale}</span>
                    )}
                    {employee.nombre_enfants > 0 && (
                      <span>Enfants: {employee.nombre_enfants}</span>
                    )}
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
