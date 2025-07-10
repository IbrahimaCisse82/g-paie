
-- Création des tables pour le système RH

-- Table des conventions collectives
CREATE TABLE IF NOT EXISTS public.conventions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    intitule text NOT NULL,
    description text,
    date_entree_vigueur date,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des employés
CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    matricule text UNIQUE NOT NULL,
    prenom text NOT NULL,
    nom text NOT NULL,
    sexe text NOT NULL CHECK (sexe IN ('Masculin', 'Féminin')),
    date_naissance date,
    lieu_naissance text,
    nationalite text,
    poste text,
    convention_collective_id uuid REFERENCES public.conventions(id),
    categorie text,
    statut text NOT NULL CHECK (statut IN ('Actif', 'Inactif')),
    type_contrat text NOT NULL CHECK (type_contrat IN ('CDI', 'CDD')),
    date_entree date,
    date_sortie date,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des paramètres de paie
CREATE TABLE public.payroll_parameters (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    taux_cnss numeric NOT NULL,
    taux_ipres numeric NOT NULL,
    taux_ir numeric NOT NULL,
    taux_cotisation_patronale numeric NOT NULL,
    date_application date NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des éléments de salaires
CREATE TABLE public.salary_elements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employe_id uuid REFERENCES public.employees(id) NOT NULL,
    emploi text,
    contrat text,
    situation_contrat text,
    prime_anciennete numeric DEFAULT 0,
    prime_logement numeric DEFAULT 0,
    indemnite_transport numeric DEFAULT 0,
    salaire_brut numeric NOT NULL,
    cnss_salarie numeric DEFAULT 0,
    ipres_salarie numeric DEFAULT 0,
    ir numeric DEFAULT 0,
    salaire_net numeric DEFAULT 0,
    mois text,
    annee integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des bulletins de paie
CREATE TABLE public.pay_slips (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employe_id uuid REFERENCES public.employees(id) NOT NULL,
    mois text NOT NULL,
    annee integer NOT NULL,
    salaire_brut numeric DEFAULT 0,
    cotisations_salariales numeric DEFAULT 0,
    cotisations_patronales numeric DEFAULT 0,
    salaire_net numeric DEFAULT 0,
    date_generation date,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des cotisations sociales
CREATE TABLE public.social_contributions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employe_id uuid REFERENCES public.employees(id) NOT NULL,
    mois text NOT NULL,
    annee integer NOT NULL,
    cnss_salarie numeric DEFAULT 0,
    ipres_salarie numeric DEFAULT 0,
    ir numeric DEFAULT 0,
    cotisation_patronale numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activation de RLS (Row Level Security)
ALTER TABLE public.conventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_contributions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS de base (accès libre pour le moment)
CREATE POLICY "Enable read access for all users" ON public.conventions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.conventions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.conventions FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.conventions FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.employees FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.employees FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.payroll_parameters FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.payroll_parameters FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.payroll_parameters FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.payroll_parameters FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.salary_elements FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.salary_elements FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.salary_elements FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.salary_elements FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.pay_slips FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.pay_slips FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.pay_slips FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.pay_slips FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.social_contributions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.social_contributions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.social_contributions FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.social_contributions FOR DELETE USING (true);
