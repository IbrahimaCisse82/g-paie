
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Calendar } from 'lucide-react';

export const ConventionsList = () => {
  const { data: conventions, isLoading } = useQuery({
    queryKey: ['conventions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conventions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Chargement des conventions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Gérez les conventions collectives de votre entreprise
        </p>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nouvelle Convention</span>
        </Button>
      </div>

      <div className="grid gap-4">
        {conventions && conventions.length > 0 ? (
          conventions.map((convention) => (
            <Card key={convention.id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>{convention.intitule}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {convention.description && (
                    <p className="text-gray-600">{convention.description}</p>
                  )}
                  {convention.date_entree_vigueur && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Entrée en vigueur : {new Date(convention.date_entree_vigueur).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">Aucune convention collective trouvée</p>
              <Button className="flex items-center space-x-2 mx-auto">
                <Plus className="h-4 w-4" />
                <span>Ajouter une convention</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
