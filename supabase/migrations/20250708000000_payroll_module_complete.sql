-- Migration complète pour le module RH-Paie
-- Reproduit fidèlement la logique du fichier Excel SENEXCELPAIE

-- Table des employés (améliorée)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    matricule TEXT UNIQUE NOT NULL,
    prenom TEXT NOT NULL,
    nom TEXT NOT NULL,
    sexe TEXT NOT NULL CHECK (sexe IN ('Masculin', 'Féminin')),
    date_naissance DATE,
    lieu_naissance TEXT,
    nationalite TEXT DEFAULT 'Sénégalaise',
    adresse TEXT,
    telephone TEXT,
    email TEXT,
    poste TEXT NOT NULL,
    convention_collective TEXT NOT NULL,
    categorie TEXT NOT NULL,
    statut TEXT NOT NULL DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Inactif', 'En congé', 'Licencié')),
    type_contrat TEXT NOT NULL DEFAULT 'CDI' CHECK (type_contrat IN ('CDI', 'CDD', 'Stage', 'Intérim')),
    date_embauche DATE NOT NULL,
    date_sortie DATE,
    salaire_base DECIMAL(12,2) NOT NULL DEFAULT 0,
    situation_familiale TEXT DEFAULT 'Célibataire' CHECK (situation_familiale IN ('Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve')),
    nombre_enfants INTEGER DEFAULT 0,
    nombre_conjoints INTEGER DEFAULT 0,
    nombre_autres_charges INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des paramètres de paie (améliorée)
CREATE TABLE IF NOT EXISTS public.payroll_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom_parametre TEXT NOT NULL,
    valeur DECIMAL(10,4) NOT NULL,
    type_parametre TEXT NOT NULL CHECK (type_parametre IN ('CNSS', 'IPRES', 'IR', 'COTISATION_PATRONALE', 'AUTRE')),
    date_debut_application DATE NOT NULL,
    date_fin_application DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des éléments variables de paie mensuels
CREATE TABLE IF NOT EXISTS public.pay_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employe_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    mois INTEGER NOT NULL CHECK (mois >= 1 AND mois <= 12),
    annee INTEGER NOT NULL,
    type_element TEXT NOT NULL CHECK (type_element IN ('HEURES_SUPPLEMENTAIRES', 'ABSENCES', 'PRIMES', 'INDEMNITES', 'RETENUES', 'AVANCES', 'AUTRES')),
    libelle TEXT NOT NULL,
    montant DECIMAL(12,2) NOT NULL DEFAULT 0,
    nombre_heures DECIMAL(5,2) DEFAULT 0,
    taux_horaire DECIMAL(8,2) DEFAULT 0,
    statut TEXT DEFAULT 'En attente' CHECK (statut IN ('En attente', 'Validé', 'Rejeté')),
    date_saisie DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(employe_id, mois, annee, type_element, libelle)
);

-- Table des calculs de paie mensuels
CREATE TABLE IF NOT EXISTS public.payrolls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employe_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    mois INTEGER NOT NULL CHECK (mois >= 1 AND mois <= 12),
    annee INTEGER NOT NULL,
    
    -- Éléments de base
    salaire_base DECIMAL(12,2) NOT NULL DEFAULT 0,
    heures_normales DECIMAL(5,2) DEFAULT 173.33,
    heures_supplementaires DECIMAL(5,2) DEFAULT 0,
    taux_horaire_normal DECIMAL(8,2) DEFAULT 0,
    taux_horaire_supplementaire DECIMAL(8,2) DEFAULT 0,
    
    -- Gains
    salaire_brut DECIMAL(12,2) NOT NULL DEFAULT 0,
    prime_anciennete DECIMAL(12,2) DEFAULT 0,
    prime_logement DECIMAL(12,2) DEFAULT 0,
    indemnite_transport DECIMAL(12,2) DEFAULT 0,
    indemnite_fonction DECIMAL(12,2) DEFAULT 0,
    autres_primes DECIMAL(12,2) DEFAULT 0,
    total_gains DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Retenues salariales
    cnss_salarie DECIMAL(12,2) DEFAULT 0,
    ipres_salarie DECIMAL(12,2) DEFAULT 0,
    ir_salarie DECIMAL(12,2) DEFAULT 0,
    autres_retenues DECIMAL(12,2) DEFAULT 0,
    total_retenues_salariales DECIMAL(12,2) DEFAULT 0,
    
    -- Cotisations patronales
    cnss_patronal DECIMAL(12,2) DEFAULT 0,
    ipres_patronal DECIMAL(12,2) DEFAULT 0,
    accident_travail DECIMAL(12,2) DEFAULT 0,
    autres_cotisations_patronales DECIMAL(12,2) DEFAULT 0,
    total_cotisations_patronales DECIMAL(12,2) DEFAULT 0,
    
    -- Résultats
    salaire_net DECIMAL(12,2) NOT NULL DEFAULT 0,
    cout_total_employeur DECIMAL(12,2) DEFAULT 0,
    
    -- Statut et validation
    statut TEXT DEFAULT 'Brouillon' CHECK (statut IN ('Brouillon', 'Calculé', 'Validé', 'Payé')),
    date_calcul TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    date_validation TIMESTAMP WITH TIME ZONE,
    date_paiement DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(employe_id, mois, annee)
);

-- Table des bulletins de paie générés
CREATE TABLE IF NOT EXISTS public.pay_slips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payroll_id UUID REFERENCES public.payrolls(id) ON DELETE CASCADE NOT NULL,
    employe_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
    numero_bulletin TEXT UNIQUE NOT NULL,
    mois INTEGER NOT NULL,
    annee INTEGER NOT NULL,
    contenu_html TEXT,
    contenu_pdf BYTEA,
    statut TEXT DEFAULT 'Généré' CHECK (statut IN ('Généré', 'Envoyé', 'Lu')),
    date_generation TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    date_envoi TIMESTAMP WITH TIME ZONE,
    email_destinataire TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des états récapitulatifs
CREATE TABLE IF NOT EXISTS public.payroll_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mois INTEGER NOT NULL,
    annee INTEGER NOT NULL,
    type_rapport TEXT NOT NULL CHECK (type_rapport IN ('LIVRE_PAIE', 'RECAPITULATIF_COTISATIONS', 'ETAT_CNSS', 'ETAT_IPRES', 'ETAT_IR')),
    contenu_json JSONB,
    fichier_pdf BYTEA,
    statut TEXT DEFAULT 'Généré' CHECK (statut IN ('Généré', 'Validé', 'Transmis')),
    date_generation TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(mois, annee, type_rapport)
);

-- Table des périodes de paie
CREATE TABLE IF NOT EXISTS public.payroll_periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mois INTEGER NOT NULL CHECK (mois >= 1 AND mois <= 12),
    annee INTEGER NOT NULL,
    statut TEXT DEFAULT 'Ouverte' CHECK (statut IN ('Ouverte', 'En cours de calcul', 'Calculée', 'Validée', 'Fermée')),
    date_ouverture DATE DEFAULT CURRENT_DATE,
    date_fermeture DATE,
    nombre_employes INTEGER DEFAULT 0,
    total_masse_salariale DECIMAL(15,2) DEFAULT 0,
    total_cotisations DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(mois, annee)
);

-- Activation de RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Enable read access for all users" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.employees FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.employees FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.payroll_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.payroll_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.payroll_settings FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.payroll_settings FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.pay_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.pay_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.pay_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.pay_items FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.payrolls FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.payrolls FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.payrolls FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.payrolls FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.pay_slips FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.pay_slips FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.pay_slips FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.pay_slips FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.payroll_reports FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.payroll_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.payroll_reports FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.payroll_reports FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.payroll_periods FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.payroll_periods FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.payroll_periods FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.payroll_periods FOR DELETE USING (true);

-- Insertion des paramètres de paie par défaut (2024)
INSERT INTO public.payroll_settings (nom_parametre, valeur, type_parametre, date_debut_application, description) VALUES
-- CNSS
('CNSS_SALARIE', 0.07, 'CNSS', '2024-01-01', 'Taux CNSS salarié (7%)'),
('CNSS_PATRONAL', 0.14, 'CNSS', '2024-01-01', 'Taux CNSS patronal (14%)'),
('CNSS_PLAFOND', 600000, 'CNSS', '2024-01-01', 'Plafond CNSS'),

-- IPRES
('IPRES_SALARIE', 0.06, 'IPRES', '2024-01-01', 'Taux IPRES salarié (6%)'),
('IPRES_PATRONAL', 0.075, 'IPRES', '2024-01-01', 'Taux IPRES patronal (7.5%)'),
('IPRES_PLAFOND', 600000, 'IPRES', '2024-01-01', 'Plafond IPRES'),

-- IR
('IR_SEUIL_1', 630000, 'IR', '2024-01-01', 'Seuil IR 1er tranche'),
('IR_SEUIL_2', 1500000, 'IR', '2024-01-01', 'Seuil IR 2ème tranche'),
('IR_SEUIL_3', 4000000, 'IR', '2024-01-01', 'Seuil IR 3ème tranche'),
('IR_TAUX_1', 0.00, 'IR', '2024-01-01', 'Taux IR 1er tranche (0%)'),
('IR_TAUX_2', 0.20, 'IR', '2024-01-01', 'Taux IR 2ème tranche (20%)'),
('IR_TAUX_3', 0.30, 'IR', '2024-01-01', 'Taux IR 3ème tranche (30%)'),
('IR_TAUX_4', 0.40, 'IR', '2024-01-01', 'Taux IR 4ème tranche (40%)'),

-- Autres cotisations
('ACCIDENT_TRAVAIL', 0.015, 'COTISATION_PATRONALE', '2024-01-01', 'Taux accident de travail (1.5%)'),
('FAMILLE', 0.05, 'COTISATION_PATRONALE', '2024-01-01', 'Taux allocation familiale (5%)'),

-- Paramètres de calcul
('HEURES_NORMALES_MOIS', 173.33, 'AUTRE', '2024-01-01', 'Nombre d''heures normales par mois'),
('TAUX_HEURES_SUPPLEMENTAIRES', 1.25, 'AUTRE', '2024-01-01', 'Majoration heures supplémentaires (25%)'),
('PRIME_ANCIENNETE_TAUX', 0.05, 'AUTRE', '2024-01-01', 'Taux prime d''ancienneté (5% par an)'),
('PRIME_LOGEMENT_MONTANT', 25000, 'AUTRE', '2024-01-01', 'Montant prime de logement'),
('INDEMNITE_TRANSPORT_MONTANT', 15000, 'AUTRE', '2024-01-01', 'Montant indemnité de transport')
ON CONFLICT DO NOTHING;

-- Création des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_employees_matricule ON public.employees(matricule);
CREATE INDEX IF NOT EXISTS idx_employees_statut ON public.employees(statut);
CREATE INDEX IF NOT EXISTS idx_pay_items_employe_mois_annee ON public.pay_items(employe_id, mois, annee);
CREATE INDEX IF NOT EXISTS idx_payrolls_employe_mois_annee ON public.payrolls(employe_id, mois, annee);
CREATE INDEX IF NOT EXISTS idx_payrolls_statut ON public.payrolls(statut);
CREATE INDEX IF NOT EXISTS idx_pay_slips_employe_mois_annee ON public.pay_slips(employe_id, mois, annee);
CREATE INDEX IF NOT EXISTS idx_payroll_periods_mois_annee ON public.payroll_periods(mois, annee); 