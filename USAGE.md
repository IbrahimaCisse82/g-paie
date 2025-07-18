# Documentation d'utilisation du système G-Paie

## Installation et configuration

### 1. Cloner le projet et installer les dépendances

```bash
git clone <repository-url>
cd g-paie-1
npm install
```

### 2. Configuration Supabase

Le projet est configuré avec la base de données Supabase :
- URL: https://mapgvicilfoblqngqlfr.supabase.co
- Les variables d'environnement sont dans le fichier `.env`

### 3. Structure de la base de données

Le système utilise les tables suivantes :

**employees** - Gestion des employés
- `id` (UUID) - Identifiant unique
- `employee_number` - Numéro d'employé
- `first_name`, `last_name` - Nom et prénom
- `email`, `phone` - Coordonnées
- `hire_date` - Date d'embauche
- `position` - Poste
- `base_salary` - Salaire de base
- `collective_agreement_id` - Référence à la convention collective
- `status` - Statut (active/inactive)

**collective_agreements** - Conventions collectives
- `id` (UUID) - Identifiant unique
- `name` - Nom de la convention
- `code` - Code de la convention
- `base_salary_min/max` - Fourchette salariale
- `social_charge_rate` - Taux des charges sociales
- `tax_rate` - Taux d'imposition

**payroll_periods** - Périodes de paie
- `id` (UUID) - Identifiant unique
- `name` - Nom de la période
- `start_date`, `end_date` - Dates de début et fin
- `status` - Statut (open/closed/processing)

**payroll_elements** - Éléments de paie
- `id` (UUID) - Identifiant unique
- `employee_id` - Référence à l'employé
- `period_id` - Référence à la période
- `element_type` - Type d'élément
- `amount` - Montant
- `is_taxable` - Soumis à l'impôt
- `is_social_chargeable` - Soumis aux charges sociales

**payroll_calculations** - Calculs de paie
- `id` (UUID) - Identifiant unique
- `employee_id` - Référence à l'employé
- `period_id` - Référence à la période
- `gross_salary` - Salaire brut
- `social_charges` - Charges sociales
- `tax_charges` - Charges fiscales
- `net_salary` - Salaire net
- `calculation_date` - Date du calcul

**pay_slips** - Bulletins de paie
- `id` (UUID) - Identifiant unique
- `employee_id` - Référence à l'employé
- `period_id` - Référence à la période
- `calculation_id` - Référence au calcul
- `status` - Statut du bulletin
- `generated_at` - Date de génération

## Utilisation du système

### 1. Accès au système

Lancez le serveur de développement :
```bash
npm run dev
```

L'application sera disponible à l'adresse : http://localhost:8081/

### 2. Fonctionnalités principales

#### Gestion des employés
- Ajouter/modifier/supprimer des employés
- Gestion des informations personnelles et professionnelles
- Attribution d'une convention collective

#### Calcul de paie
- Calcul automatique pour un employé ou tous les employés
- Prise en compte des éléments variables (primes, heures supplémentaires, etc.)
- Validation des calculs

#### Génération de bulletins
- Génération automatique des bulletins de paie
- Export en PDF
- Envoi par email

#### Rapports
- Livre de paie mensuel
- Récapitulatif des cotisations
- États pour les organismes sociaux (CNSS, IPRES, IR)

### 3. API du service de paie

Le système fournit une API robuste :

```typescript
// Récupération des employés
const employees = await PayrollService.getEmployees();

// Calcul de paie pour un employé
const result = await PayrollService.calculatePayroll(employeeId, month, year);

// Validation d'un calcul
await PayrollService.validatePayroll(payrollId);

// Génération d'un résumé
const summary = await PayrollService.getPayrollSummary(month, year);
```

### 4. Gestion des erreurs

Le système utilise des hooks personnalisés pour la gestion des erreurs :
- `useErrorHandler` - Gestion centralisée des erreurs
- `useLoading` - Gestion des états de chargement
- `usePagination` - Gestion de la pagination

### 5. Validation des calculs

Le système inclut une fonction de validation qui vérifie la cohérence des calculs :

```typescript
const validation = await validatePayrollCalculations(
  employeeId, 
  month, 
  year, 
  expectedAmount
);

if (validation.ok) {
  console.log('Calcul conforme');
} else {
  console.log(`Écart détecté: ${validation.ecart} FCFA`);
}
```

## Architecture technique

### Technologies utilisées
- **Frontend** : React 18 + TypeScript + Vite
- **UI** : Shadcn/ui + Tailwind CSS
- **Backend** : Supabase (PostgreSQL + API REST)
- **Authentification** : Supabase Auth
- **État** : React hooks + Context API

### Structure des dossiers
```
src/
├── components/          # Composants UI
│   ├── payroll/        # Composants spécifiques à la paie
│   ├── employees/      # Gestion des employés
│   ├── reports/        # Génération de rapports
│   └── ui/             # Composants UI génériques
├── constants/          # Constantes métier
├── hooks/              # Hooks personnalisés
├── lib/                # Services et utilitaires
├── types/              # Définitions TypeScript
└── utils/              # Fonctions utilitaires
```

### Bonnes pratiques implémentées
- **Typage strict** avec TypeScript
- **Gestion d'erreurs** centralisée
- **Cache** pour les requêtes fréquentes
- **Validation** des données métier
- **Séparation des responsabilités**
- **Documentation** complète du code

## Évolutions futures

### Fonctionnalités prévues
1. **Authentification** multi-utilisateurs
2. **Gestion des congés** et absences
3. **Calcul des charges patronales** détaillé
4. **Import/export** Excel
5. **Notifications** automatiques
6. **API REST** complète pour intégrations
7. **Multi-entreprise** support

### Améliorations techniques
1. **Tests unitaires** et d'intégration
2. **Performance** optimisée
3. **Monitoring** et logs
4. **Déploiement** automatisé
5. **Sécurité** renforcée

## Support et maintenance

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les logs de l'application
3. Utiliser les outils de debug intégrés
4. Contacter l'équipe de développement

## Licence

Ce projet est sous licence propriétaire. Tous droits réservés.
