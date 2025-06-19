
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { PaySlipPDF } from './PaySlipPDF';

export const PaySlipGenerator = () => {
  const [selectedPaySlip, setSelectedPaySlip] = useState<string>('');

  const { data: paySlips } = useQuery({
    queryKey: ['allPaySlips'],
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Générateur de Bulletins PDF</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payslip-select">Sélectionner un bulletin</Label>
            <Select value={selectedPaySlip} onValueChange={setSelectedPaySlip}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un bulletin de paie" />
              </SelectTrigger>
              <SelectContent>
                {paySlips?.map((paySlip) => (
                  <SelectItem key={paySlip.id} value={paySlip.id}>
                    {paySlip.employees?.matricule} - {paySlip.employees?.prenom} {paySlip.employees?.nom} ({paySlip.mois} {paySlip.annee})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPaySlip && (
            <div className="mt-6">
              <PaySlipPDF paySlipId={selectedPaySlip} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
