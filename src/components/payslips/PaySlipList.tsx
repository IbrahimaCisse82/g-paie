
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { PaySlipGenerator } from './PaySlipGenerator';

export const PaySlipList = () => {
  const { data: paySlips, isLoading } = useQuery({
    queryKey: ['paySlips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pay_slips')
        .select(`
          *,
          employees (prenom, nom, matricule)
        `)
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
      {/* Générateur de bulletins PDF */}
      <PaySlipGenerator />

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6" />
          <span className="text-lg font-medium">
            {paySlips?.length || 0} bulletin(s) de paie
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        {paySlips?.map((paySlip) => (
          <Card key={paySlip.id} className="card-hover">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="font-semibold">
                    {paySlip.employees?.prenom} {paySlip.employees?.nom}
                  </h3>
                  <p className="text-gray-600">
                    {paySlip.mois} {paySlip.annee}
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {paySlip.salaire_net?.toLocaleString()} FCFA
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Matricule: {paySlip.employees?.matricule}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {(!paySlips || paySlips.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun bulletin de paie
              </h3>
              <p className="text-gray-600">
                Les bulletins de paie apparaîtront ici une fois générés
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
