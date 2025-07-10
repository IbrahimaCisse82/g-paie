
-- Ajout des colonnes manquantes à la table employees
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS motif_sortie text,
ADD COLUMN IF NOT EXISTS date_retour_conge date;

-- Mise à jour de la contrainte pour la catégorie si elle n'existe pas déjà
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS categorie text;
