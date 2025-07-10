import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Calendar, Calculator } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

import { PayrollService } from '@/lib/payroll-service';
import type { Employee, PayItem, PayItemFormData } from '@/types/payroll';

// Schéma de validation pour les éléments de paie
const payItemSchema = z.object({
  employe_id: z.string().min(1, 'L\'employé est requis'),
  mois: z.number().min(1).max(12),
  annee: z.number().min(2020).max(2030),
  type_element: z.enum(['HEURES_SUPPLEMENTAIRES', 'ABSENCES', 'PRIMES', 'INDEMNITES', 'RETENUES', 'AVANCES', 'AUTRES']),
  libelle: z.string().min(1, 'Le libellé est requis'),
  montant: z.number().min(0, 'Le montant doit être positif'),
  nombre_heures: z.number().min(0).optional(),
  taux_horaire: z.number().min(0).optional()
});

type PayItemFormSchema = z.infer<typeof payItemSchema>;

// Types d'éléments de paie
const PAY_ITEM_TYPES = [
  { value: 'HEURES_SUPPLEMENTAIRES', label: 'Heures supplémentaires' },
  { value: 'ABSENCES', label: 'Absences' },
  { value: 'PRIMES', label: 'Primes' },
  { value: 'INDEMNITES', label: 'Indemnités' },
  { value: 'RETENUES', label: 'Retenues' },
  { value: 'AVANCES', label: 'Avances' },
  { value: 'AUTRES', label: 'Autres' }
];

// Mois de l'année
const MOIS = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' }
];

export function PayItemsManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payItems, setPayItems] = useState<PayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayItem, setEditingPayItem] = useState<PayItem | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PayItemFormSchema>({
    resolver: zodResolver(payItemSchema),
    defaultValues: {
      mois: new Date().getMonth() + 1,
      annee: new Date().getFullYear(),
      montant: 0,
      nombre_heures: 0,
      taux_horaire: 0
    }
  });

  const selectedType = watch('type_element');

  // Charger les employés
  useEffect(() => {
    loadEmployees();
  }, []);

  // Charger les éléments de paie
  useEffect(() => {
    if (selectedEmployee && selectedMonth && selectedYear) {
      loadPayItems();
    }
  }, [selectedEmployee, selectedMonth, selectedYear]);

  const loadEmployees = async () => {
    try {
      const data = await PayrollService.getEmployees({ statut: 'Actif' });
      setEmployees(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des employés');
      console.error(error);
    }
  };

  const loadPayItems = async () => {
    try {
      setLoading(true);
      const data = await PayrollService.getPayItems(selectedEmployee, selectedMonth, selectedYear);
      setPayItems(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des éléments de paie');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Soumettre le formulaire
  const onSubmit = async (data: PayItemFormSchema) => {
    try {
      if (editingPayItem) {
        await PayrollService.updatePayItem(editingPayItem.id, data);
        toast.success('Élément de paie mis à jour avec succès');
      } else {
        await PayrollService.addPayItem(data);
        toast.success('Élément de paie ajouté avec succès');
      }
      
      setIsDialogOpen(false);
      reset();
      setEditingPayItem(null);
      loadPayItems();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    }
  };

  // Éditer un élément de paie
  const handleEdit = (payItem: PayItem) => {
    setEditingPayItem(payItem);
    reset({
      employe_id: payItem.employe_id,
      mois: payItem.mois,
      annee: payItem.annee,
      type_element: payItem.type_element,
      libelle: payItem.libelle,
      montant: payItem.montant,
      nombre_heures: payItem.nombre_heures || 0,
      taux_horaire: payItem.taux_horaire || 0
    });
    setIsDialogOpen(true);
  };

  // Supprimer un élément de paie
  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément de paie ?')) {
      try {
        await PayrollService.deletePayItem(id);
        toast.success('Élément de paie supprimé avec succès');
        loadPayItems();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error(error);
      }
    }
  };

  // Ouvrir le formulaire pour un nouvel élément
  const handleNewPayItem = () => {
    if (!selectedEmployee) {
      toast.error('Veuillez sélectionner un employé');
      return;
    }
    
    setEditingPayItem(null);
    reset({
      employe_id: selectedEmployee,
      mois: selectedMonth,
      annee: selectedYear,
      montant: 0,
      nombre_heures: 0,
      taux_horaire: 0
    });
    setIsDialogOpen(true);
  };

  // Calculer automatiquement le montant pour les heures supplémentaires
  const calculateAmount = () => {
    const heures = watch('nombre_heures') || 0;
    const taux = watch('taux_horaire') || 0;
    const montant = heures * taux;
    setValue('montant', montant);
  };

  // Formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  // Obtenir le nom complet de l'employé
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.prenom} ${employee.nom}` : 'Employé inconnu';
  };

  // Calculer le total par type
  const getTotalByType = (type: string) => {
    return payItems
      .filter(item => item.type_element === type)
      .reduce((total, item) => total + item.montant, 0);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Éléments Variables de Paie</h1>
          <p className="text-muted-foreground">
            Saisissez les éléments variables de paie pour chaque employé
          </p>
        </div>
      </div>

      {/* Sélecteurs */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employé</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.matricule} - {employee.prenom} {employee.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Mois</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le mois" />
                </SelectTrigger>
                <SelectContent>
                  {MOIS.map(mois => (
                    <SelectItem key={mois.value} value={mois.value.toString()}>
                      {mois.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Année</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'année" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={handleNewPayItem} disabled={!selectedEmployee} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Nouvel élément
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé par type */}
      {payItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résumé par type d'élément</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {PAY_ITEM_TYPES.map(type => {
                const total = getTotalByType(type.value);
                if (total === 0) return null;
                
                return (
                  <div key={type.value} className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">{type.label}</div>
                    <div className="text-lg font-semibold">{formatAmount(total)}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des éléments de paie */}
      <Card>
        <CardHeader>
          <CardTitle>
            Éléments de paie - {selectedEmployee ? getEmployeeName(selectedEmployee) : 'Aucun employé sélectionné'}
          </CardTitle>
          <CardDescription>
            {MOIS.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : payItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun élément de paie pour cette période
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Heures</TableHead>
                  <TableHead>Taux horaire</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payItems.map((payItem) => (
                  <TableRow key={payItem.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {PAY_ITEM_TYPES.find(t => t.value === payItem.type_element)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{payItem.libelle}</TableCell>
                    <TableCell>{payItem.nombre_heures || '-'}</TableCell>
                    <TableCell>
                      {payItem.taux_horaire ? formatAmount(payItem.taux_horaire) : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{formatAmount(payItem.montant)}</TableCell>
                    <TableCell>
                      <Badge variant={payItem.statut === 'Validé' ? 'default' : 'secondary'}>
                        {payItem.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(payItem)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(payItem.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Formulaire d'ajout/modification */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPayItem ? 'Modifier l\'élément de paie' : 'Nouvel élément de paie'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de l'élément de paie
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type_element">Type d'élément *</Label>
                <Select onValueChange={(value) => setValue('type_element', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAY_ITEM_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type_element && (
                  <p className="text-sm text-red-500">{errors.type_element.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="libelle">Libellé *</Label>
                <Input
                  id="libelle"
                  {...register('libelle')}
                  placeholder="Description de l'élément"
                />
                {errors.libelle && (
                  <p className="text-sm text-red-500">{errors.libelle.message}</p>
                )}
              </div>
            </div>

            {selectedType === 'HEURES_SUPPLEMENTAIRES' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre_heures">Nombre d'heures</Label>
                  <Input
                    id="nombre_heures"
                    type="number"
                    step="0.5"
                    {...register('nombre_heures', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taux_horaire">Taux horaire (FCFA)</Label>
                  <Input
                    id="taux_horaire"
                    type="number"
                    step="0.01"
                    {...register('taux_horaire', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button type="button" variant="outline" onClick={calculateAmount}>
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculer
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="montant">Montant (FCFA) *</Label>
              <Input
                id="montant"
                type="number"
                step="0.01"
                {...register('montant', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.montant && (
                <p className="text-sm text-red-500">{errors.montant.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sauvegarde...' : editingPayItem ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 