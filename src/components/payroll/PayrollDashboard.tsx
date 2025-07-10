import React, { useState } from 'react';
import { Users, Calculator, FileText, BarChart3, Settings, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { EmployeeManagement } from './EmployeeManagement';
import { PayItemsManagement } from './PayItemsManagement';
import { PayrollCalculation } from './PayrollCalculation';
import { PaySlipGeneration } from './PaySlipGeneration';
import { PayrollReports } from './PayrollReports';

export function PayrollDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Module RH-Paie</h1>
          <p className="text-muted-foreground">
            Gestion complète de la paie et des ressources humaines
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Version 1.0
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Tableau de bord</span>
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Personnel</span>
          </TabsTrigger>
          <TabsTrigger value="pay-items" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Éléments variables</span>
          </TabsTrigger>
          <TabsTrigger value="calculation" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Calcul de paie</span>
          </TabsTrigger>
          <TabsTrigger value="pay-slips" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Bulletins</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Rapports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Statistiques rapides */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employés actifs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  +0% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Masse salariale</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 FCFA</div>
                <p className="text-xs text-muted-foreground">
                  Ce mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paies calculées</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Ce mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bulletins générés</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Ce mois
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Accédez rapidement aux fonctionnalités principales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('employees')}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <Users className="h-6 w-6 mb-2" />
                    <div className="font-medium">Gérer le personnel</div>
                    <div className="text-sm text-muted-foreground">Ajouter, modifier, supprimer des employés</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('pay-items')}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    <div className="font-medium">Éléments variables</div>
                    <div className="text-sm text-muted-foreground">Saisir heures supplémentaires, primes</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('calculation')}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <Calculator className="h-6 w-6 mb-2" />
                    <div className="font-medium">Calculer les paies</div>
                    <div className="text-sm text-muted-foreground">Lancer le calcul automatique</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('pay-slips')}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    <div className="font-medium">Générer bulletins</div>
                    <div className="text-sm text-muted-foreground">Créer et envoyer les bulletins</div>
                  </button>

                  <button
                    onClick={() => navigate('/simulateur-salaire')}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <Calculator className="h-6 w-6 mb-2" />
                    <div className="font-medium">Simulateur de salaire</div>
                    <div className="text-sm text-muted-foreground">Estimez un net à partir d'un brut</div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations système</CardTitle>
                <CardDescription>
                  État du système et paramètres
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Période actuelle</span>
                    <span className="text-sm font-medium">Janvier 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Statut des calculs</span>
                    <Badge variant="outline">En attente</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Dernière validation</span>
                    <span className="text-sm text-muted-foreground">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Paramètres actifs</span>
                    <Badge variant="outline">2024</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guide d'utilisation */}
          <Card>
            <CardHeader>
              <CardTitle>Guide d'utilisation</CardTitle>
              <CardDescription>
                Étapes pour utiliser le module RH-Paie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Gérer le personnel</h4>
                    <p className="text-sm text-muted-foreground">
                      Commencez par ajouter vos employés avec leurs informations de base, 
                      leur convention collective et leur catégorie.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Saisir les éléments variables</h4>
                    <p className="text-sm text-muted-foreground">
                      Pour chaque employé, saisissez les heures supplémentaires, 
                      primes, indemnités et autres éléments variables du mois.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Calculer les paies</h4>
                    <p className="text-sm text-muted-foreground">
                      Lancez le calcul automatique des paies. Le système appliquera 
                      les règles de calcul selon la convention collective.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Valider et générer</h4>
                    <p className="text-sm text-muted-foreground">
                      Validez les calculs et générez les bulletins de paie. 
                      Vous pouvez les envoyer par email aux employés.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                    5
                  </div>
                  <div>
                    <h4 className="font-medium">Générer les rapports</h4>
                    <p className="text-sm text-muted-foreground">
                      Créez les états récapitulatifs : livre de paie, 
                      déclarations CNSS, IPRES et IR.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeManagement />
        </TabsContent>

        <TabsContent value="pay-items">
          <PayItemsManagement />
        </TabsContent>

        <TabsContent value="calculation">
          <PayrollCalculation />
        </TabsContent>

        <TabsContent value="pay-slips">
          <PaySlipGeneration />
        </TabsContent>

        <TabsContent value="reports">
          <PayrollReports />
        </TabsContent>
      </Tabs>
    </div>
  );
} 