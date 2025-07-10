import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Search, Filter, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { PayrollService } from '@/lib/payroll-service';
import type { Employee, EmployeeFormData, EmployeeFilters } from '@/types/payroll';

// Schéma de validation pour le formulaire employé
const employeeSchema = z.object({
  matricule: z.string().min(1, 'Le matricule est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  sexe: z.enum(['Masculin', 'Féminin']),
  date_naissance: z.string().optional(),
  lieu_naissance: z.string().optional(),
  nationalite: z.string().optional(),
  adresse: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  poste: z.string().min(1, 'Le poste est requis'),
  convention_collective: z.string().min(1, 'La convention collective est requise'),
  categorie: z.string().min(1, 'La catégorie est requise'),
  type_contrat: z.enum(['CDI', 'CDD', 'Stage', 'Intérim']),
  date_embauche: z.string().min(1, 'La date d\'embauche est requise'),
  salaire_base: z.number().min(0, 'Le salaire de base doit être positif'),
  situation_familiale: z.enum(['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve']),
  nombre_enfants: z.number().min(0),
  nombre_conjoints: z.number().min(0),
  nombre_autres_charges: z.number().min(0)
});

type EmployeeFormSchema = z.infer<typeof employeeSchema>;

// Conventions collectives disponibles
const CONVENTIONS_COLLECTIVES = [
  'COMMERCE',
  'INDUSTRIES_ALIMENTAIRES',
  'MECANIQUE_GENERALE',
  'PRESTATIONS_DE_SERVICES',
  'INDUSTRIES_HOTELIERES',
  'BTP',
  'SECURITE_PRIVEE',
  'Convention collective interprofessionnelle'
];

// Catégories par convention
const CATEGORIES_PAR_CONVENTION: Record<string, string[]> = {
  'COMMERCE': ['1_er A', '1_er B', '2_ème', '3_ème', '4_ème', '5_ème', '6_ème', '7_ème A', '7_ème B', '8_ème A', '8_ème B', '8_ème C', '9_ème A', '9_ème B', '10_ème A', '10_ème B', '10_ème C', '11_ème'],
  'INDUSTRIES_ALIMENTAIRES': ['1ère Ouvriers', '2ème Ouvriers', '3ème Ouvriers', '4ème Ouvriers', '5ème Ouvriers', '6ème Ouvriers', '7ème Ouvriers', '1ère Employés', '2ème Employés', '3ème Employés', '4ème Employés', '5ème Employés', '6ème Employés', '7ème Employés', 'AM0', 'AM1', 'AM2', 'AM3', 'AM4', 'AM5'],
  'MECANIQUE_GENERALE': ['1ère M.O', '2ème M.S', '3ème O.S.1', '4ème O.S.2', '5ème O.P.1', '6ème O.P.2', '7ème O.P.3', '1ère', '2ème', '3ème', '4ème', '5ème', '6ème', '7ème', 'M.0', 'M.1', 'M.2', 'M.3', 'M.4', 'M.5', 'P1.A', 'P1.B', 'P2.A', 'P2.B', 'P3.A', 'P3.B'],
  'PRESTATIONS_DE_SERVICES': ['PRESTATION'],
  'INDUSTRIES_HOTELIERES': ['1-er', '2-ème', '3-ème', '4-ème', '5-ème', '6-ème A', '6-ème B', '7-ème', '8-ème A', '8-ème B', '9-ème A', '9-ème B', '10-ème A', '10-ème B', '11-ème A', '11-ème B'],
  'BTP': ['H1', 'H2', 'H3', '4 ème A', '4 ème B', '5 ème A', '5 ème B', '6 ème A', '6 ème B', '7 ème A', '7 ème B', '1 ère', '2 ème', '3 ème', '4 ème', '5 ème', '6 ème', '7 ème', 'AM 1', 'AM 2', 'AM 3', 'AM 4', 'AM 5', 'P1A', 'P1B', 'P2A', 'P2B', 'P3A', 'P3B', 'P4', 'P5'],
  'SECURITE_PRIVEE': ['1er', '2ème_A', '2ème_B', '2_èmeC', '3ème_A', '7ème_A', '9ème_A', '11ème_A'],
  'Convention collective interprofessionnelle': ['Manœuvre', 'Ouvrier Spécialisé', 'Ouvrier Qualifié', 'Agent de Maîtrise', 'Technicien', 'Cadre', 'Cadre Supérieur']
};

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [filters, setFilters] = useState<EmployeeFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<EmployeeFormSchema>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      sexe: 'Masculin',
      nationalite: 'Sénégalaise',
      type_contrat: 'CDI',
      situation_familiale: 'Célibataire',
      nombre_enfants: 0,
      nombre_conjoints: 0,
      nombre_autres_charges: 0,
      salaire_base: 0
    }
  });

  const selectedConvention = watch('convention_collective');

  // Charger les employés
  useEffect(() => {
    loadEmployees();
  }, [filters]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const filtersWithSearch = { ...filters, search: searchTerm };
      const data = await PayrollService.getEmployees(filtersWithSearch);
      setEmployees(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des employés');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Soumettre le formulaire
  const onSubmit = async (data: EmployeeFormSchema) => {
    try {
      if (editingEmployee) {
        await PayrollService.updateEmployee(editingEmployee.id, data);
        toast.success('Employé mis à jour avec succès');
      } else {
        await PayrollService.createEmployee(data);
        toast.success('Employé créé avec succès');
      }
      
      setIsDialogOpen(false);
      reset();
      setEditingEmployee(null);
      loadEmployees();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    }
  };

  // Éditer un employé
  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    reset({
      matricule: employee.matricule,
      prenom: employee.prenom,
      nom: employee.nom,
      sexe: employee.sexe,
      date_naissance: employee.date_naissance,
      lieu_naissance: employee.lieu_naissance,
      nationalite: employee.nationalite,
      adresse: employee.adresse,
      telephone: employee.telephone,
      email: employee.email,
      poste: employee.poste,
      convention_collective: employee.convention_collective,
      categorie: employee.categorie,
      type_contrat: employee.type_contrat,
      date_embauche: employee.date_embauche,
      salaire_base: employee.salaire_base,
      situation_familiale: employee.situation_familiale,
      nombre_enfants: employee.nombre_enfants,
      nombre_conjoints: employee.nombre_conjoints,
      nombre_autres_charges: employee.nombre_autres_charges
    });
    setIsDialogOpen(true);
  };

  // Supprimer un employé
  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await PayrollService.deleteEmployee(id);
        toast.success('Employé supprimé avec succès');
        loadEmployees();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error(error);
      }
    }
  };

  // Ouvrir le formulaire pour un nouvel employé
  const handleNewEmployee = () => {
    setEditingEmployee(null);
    reset();
    setIsDialogOpen(true);
  };

  // Formater le salaire
  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(salary);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Personnel</h1>
          <p className="text-muted-foreground">
            Gérez les employés et leurs informations de base
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewEmployee}>
              <UserPlus className="mr-2 h-4 w-4" />
              Nouvel Employé
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'Modifier l\'employé' : 'Nouvel employé'}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations de l'employé
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations personnelles */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="matricule">Matricule *</Label>
                    <Input
                      id="matricule"
                      {...register('matricule')}
                      placeholder="MAT001"
                    />
                    {errors.matricule && (
                      <p className="text-sm text-red-500">{errors.matricule.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      {...register('prenom')}
                      placeholder="Prénom"
                    />
                    {errors.prenom && (
                      <p className="text-sm text-red-500">{errors.prenom.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      {...register('nom')}
                      placeholder="Nom"
                    />
                    {errors.nom && (
                      <p className="text-sm text-red-500">{errors.nom.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sexe">Sexe *</Label>
                    <Select onValueChange={(value) => setValue('sexe', value as 'Masculin' | 'Féminin')} defaultValue="Masculin">
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le sexe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculin">Masculin</SelectItem>
                        <SelectItem value="Féminin">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date_naissance">Date de naissance</Label>
                    <Input
                      id="date_naissance"
                      type="date"
                      {...register('date_naissance')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lieu_naissance">Lieu de naissance</Label>
                    <Input
                      id="lieu_naissance"
                      {...register('lieu_naissance')}
                      placeholder="Dakar"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nationalite">Nationalité</Label>
                    <Input
                      id="nationalite"
                      {...register('nationalite')}
                      placeholder="Sénégalaise"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      {...register('telephone')}
                      placeholder="+221 77 123 45 67"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="employe@entreprise.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input
                      id="adresse"
                      {...register('adresse')}
                      placeholder="Adresse complète"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Informations professionnelles */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations professionnelles</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="poste">Poste *</Label>
                    <Input
                      id="poste"
                      {...register('poste')}
                      placeholder="Développeur"
                    />
                    {errors.poste && (
                      <p className="text-sm text-red-500">{errors.poste.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type_contrat">Type de contrat *</Label>
                    <Select onValueChange={(value) => setValue('type_contrat', value as any)} defaultValue="CDI">
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type de contrat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CDI">CDI</SelectItem>
                        <SelectItem value="CDD">CDD</SelectItem>
                        <SelectItem value="Stage">Stage</SelectItem>
                        <SelectItem value="Intérim">Intérim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date_embauche">Date d'embauche *</Label>
                    <Input
                      id="date_embauche"
                      type="date"
                      {...register('date_embauche')}
                    />
                    {errors.date_embauche && (
                      <p className="text-sm text-red-500">{errors.date_embauche.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salaire_base">Salaire de base (FCFA) *</Label>
                    <Input
                      id="salaire_base"
                      type="number"
                      {...register('salaire_base', { valueAsNumber: true })}
                      placeholder="200000"
                    />
                    {errors.salaire_base && (
                      <p className="text-sm text-red-500">{errors.salaire_base.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="convention_collective">Convention collective *</Label>
                    <Select onValueChange={(value) => setValue('convention_collective', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la convention" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONVENTIONS_COLLECTIVES.map(convention => (
                          <SelectItem key={convention} value={convention}>
                            {convention}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.convention_collective && (
                      <p className="text-sm text-red-500">{errors.convention_collective.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="categorie">Catégorie *</Label>
                    <Select onValueChange={(value) => setValue('categorie', value)} disabled={!selectedConvention}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedConvention && CATEGORIES_PAR_CONVENTION[selectedConvention]?.map(categorie => (
                          <SelectItem key={categorie} value={categorie}>
                            {categorie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categorie && (
                      <p className="text-sm text-red-500">{errors.categorie.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Situation familiale */}
              <Card>
                <CardHeader>
                  <CardTitle>Situation familiale</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="situation_familiale">Situation familiale</Label>
                    <Select onValueChange={(value) => setValue('situation_familiale', value as any)} defaultValue="Célibataire">
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la situation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Célibataire">Célibataire</SelectItem>
                        <SelectItem value="Marié(e)">Marié(e)</SelectItem>
                        <SelectItem value="Divorcé(e)">Divorcé(e)</SelectItem>
                        <SelectItem value="Veuf/Veuve">Veuf/Veuve</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nombre_conjoints">Nombre de conjoints</Label>
                    <Input
                      id="nombre_conjoints"
                      type="number"
                      min="0"
                      {...register('nombre_conjoints', { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nombre_enfants">Nombre d'enfants</Label>
                    <Input
                      id="nombre_enfants"
                      type="number"
                      min="0"
                      {...register('nombre_enfants', { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nombre_autres_charges">Autres charges</Label>
                    <Input
                      id="nombre_autres_charges"
                      type="number"
                      min="0"
                      {...register('nombre_autres_charges', { valueAsNumber: true })}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sauvegarde...' : editingEmployee ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, prénom ou matricule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select onValueChange={(value) => setFilters(prev => ({ ...prev, statut: value as any }))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Inactif">Inactif</SelectItem>
                <SelectItem value="En congé">En congé</SelectItem>
                <SelectItem value="Licencié">Licencié</SelectItem>
              </SelectContent>
            </Select>
            
            <Select onValueChange={(value) => setFilters(prev => ({ ...prev, convention_collective: value }))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Convention" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les conventions</SelectItem>
                {CONVENTIONS_COLLECTIVES.map(convention => (
                  <SelectItem key={convention} value={convention}>
                    {convention}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={loadEmployees} variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des employés */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des employés ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matricule</TableHead>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Convention</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Salaire de base</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.matricule}</TableCell>
                    <TableCell>{employee.prenom} {employee.nom}</TableCell>
                    <TableCell>{employee.poste}</TableCell>
                    <TableCell>{employee.convention_collective}</TableCell>
                    <TableCell>{employee.categorie}</TableCell>
                    <TableCell>{formatSalary(employee.salaire_base)}</TableCell>
                    <TableCell>
                      <Badge variant={employee.statut === 'Actif' ? 'default' : 'secondary'}>
                        {employee.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(employee.id)}
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
    </div>
  );
} 