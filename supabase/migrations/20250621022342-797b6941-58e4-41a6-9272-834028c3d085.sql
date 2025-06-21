
-- Ajout des colonnes manquantes à la table employees pour une fiche de personnel complète
ALTER TABLE public.employees 
ADD COLUMN telephone text,
ADD COLUMN email text,
ADD COLUMN adresse text,
ADD COLUMN ville text,
ADD COLUMN code_postal text,
ADD COLUMN situation_familiale text CHECK (situation_familiale IN ('Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf(ve)', 'Union libre')),
ADD COLUMN nombre_enfants integer DEFAULT 0,
ADD COLUMN numero_cnss text,
ADD COLUMN numero_ipres text,
ADD COLUMN salaire_base numeric DEFAULT 0,
ADD COLUMN sur_salaire numeric DEFAULT 0,
ADD COLUMN prime_anciennete_taux numeric DEFAULT 0,
ADD COLUMN indemnite_transport numeric DEFAULT 0,
ADD COLUMN diplomes text,
ADD COLUMN contact_urgence_nom text,
ADD COLUMN contact_urgence_telephone text,
ADD COLUMN rib text,
ADD COLUMN photo_url text;

-- Mise à jour des contraintes pour le sexe (pour correspondre aux valeurs utilisées dans le formulaire)
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_sexe_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_sexe_check CHECK (sexe IN ('M', 'F'));

-- Ajout de nouvelles options pour le type de contrat
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_type_contrat_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_type_contrat_check CHECK (type_contrat IN ('CDI', 'CDD', 'Stage', 'Freelance', 'Consultant', 'Apprentissage'));
