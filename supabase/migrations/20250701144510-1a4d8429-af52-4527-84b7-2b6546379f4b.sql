
-- Création de la table pour les informations de l'entreprise
CREATE TABLE IF NOT EXISTS public.company_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  adresse TEXT,
  ville TEXT,
  pays TEXT,
  telephone TEXT,
  email TEXT,
  ninea TEXT,
  rccm TEXT,
  convention_collective TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activation de la sécurité RLS
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour l'accès à toutes les données de l'entreprise
CREATE POLICY "Enable read access for all users" ON public.company_info FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.company_info FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.company_info FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.company_info FOR DELETE USING (true);

-- Insertion d'un enregistrement par défaut s'il n'en existe pas
INSERT INTO public.company_info (nom, convention_collective)
SELECT 'Nom de l''entreprise', 'Convention collective interprofessionnelle'
WHERE NOT EXISTS (SELECT 1 FROM public.company_info);
