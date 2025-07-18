# G-Paie - Application de Gestion de Paie

## 📋 Description

G-Paie est une application web moderne de gestion de paie développée pour les entreprises sénégalaises. Elle permet de gérer facilement les employés, calculer les salaires selon les conventions collectives locales, et générer les bulletins de paie conformément à la législation sénégalaise.

## 🚀 Fonctionnalités

### 👥 Gestion des Employés
- Ajout, modification et suppression d'employés
- Gestion des informations personnelles et professionnelles
- Suivi des contrats et statuts
- Catégorisation selon les conventions collectives

### 💰 Calcul de Paie
- Calcul automatique des salaires selon les barèmes
- Gestion des heures supplémentaires
- Calcul des cotisations sociales (CNSS, IPRES, IR)
- Primes et indemnités
- Validation des calculs avec vérification automatique

### 📊 Bulletins de Paie
- Génération automatique des bulletins
- Export PDF personnalisé
- Envoi par email
- Historique des bulletins

### 📈 Rapports et Statistiques
- Livre de paie mensuel
- Récapitulatif des cotisations
- États CNSS, IPRES et IR
- Statistiques de masse salariale

### ⚙️ Paramétrage
- Configuration des conventions collectives
- Gestion des taux de cotisation
- Paramètres de l'entreprise
- Barèmes et grilles salariales

## 🛠️ Technologies Utilisées

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Backend**: Supabase (BaaS)
- **Database**: PostgreSQL
- **Validation**: Zod
- **Routing**: React Router DOM
- **Notifications**: Sonner
- **Charts**: Recharts
- **Forms**: React Hook Form

## 📦 Installation

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Compte Supabase

### Configuration

1. **Cloner le repository**
```bash
git clone <YOUR_GIT_URL>
cd g-paie-1
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
```

3. **Configuration de l'environnement**
Créer un fichier `.env` à la racine du projet :
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Configuration Supabase**
- Créer un nouveau projet Supabase
- Exécuter les migrations SQL depuis le dossier `supabase/migrations/`
- Configurer les variables d'environnement

### Démarrage

```bash
npm run dev
# ou
yarn dev
```

L'application sera disponible sur `http://localhost:8080`

## 🏗️ Architecture

### Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base (shadcn/ui)
│   ├── layout/         # Composants de mise en page
│   ├── employees/      # Composants gestion employés
│   ├── payroll/        # Composants gestion paie
│   └── reports/        # Composants rapports
├── constants/          # Constantes et configurations
├── hooks/             # Hooks personnalisés
├── lib/               # Utilitaires et services
├── pages/             # Pages principales
├── types/             # Définitions TypeScript
└── utils/             # Fonctions utilitaires
```

### Hooks Personnalisés

- `useErrorHandler`: Gestion centralisée des erreurs
- `useLoading`: Gestion des états de chargement
- `usePagination`: Pagination des données
- `useCompanyInfo`: Informations de l'entreprise
- `useConventionCategories`: Catégories des conventions

### Services

- `PayrollService`: Service principal pour les calculs de paie
- `supabase`: Configuration et utilitaires Supabase
- `payrollCalculations`: Fonctions de calcul avancées

## 📊 Base de Données

### Tables Principales

- `employees`: Informations des employés
- `company_info`: Informations de l'entreprise
- `conventions`: Conventions collectives
- `payroll_parameters`: Paramètres de paie
- `salary_elements`: Éléments de salaire calculés
- `pay_slips`: Bulletins de paie
- `social_contributions`: Cotisations sociales

## 🔧 Scripts Disponibles

- `npm run dev`: Démarrage en mode développement
- `npm run build`: Build de production
- `npm run preview`: Aperçu du build
- `npm run lint`: Vérification du code

## 🎨 Personnalisation

### Thèmes
L'application utilise un système de thèmes avec CSS variables et Tailwind CSS.

### Composants
Les composants UI sont basés sur shadcn/ui et entièrement personnalisables.

## 📝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🔒 Sécurité

- Authentification via Supabase Auth
- Validation des données côté client et serveur
- Gestion sécurisée des permissions
- Chiffrement des données sensibles

## 🌍 Localisation

L'application est développée en français et adaptée aux spécificités du Sénégal :
- Conventions collectives sénégalaises
- Calculs selon la législation locale
- Formats de dates et devises (FCFA)

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement

## 🔄 Changelog

Voir le fichier `CHANGELOG.md` pour l'historique des versions.

---

Développé avec ❤️ pour la gestion de paie au Sénégal
