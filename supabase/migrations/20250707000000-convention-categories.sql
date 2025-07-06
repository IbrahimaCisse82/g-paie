
-- Table pour les catégories par convention collective
CREATE TABLE IF NOT EXISTS public.convention_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  convention_collective TEXT NOT NULL,
  categorie TEXT NOT NULL,
  taux_horaire DECIMAL(10,2) NOT NULL DEFAULT 0,
  salaire_base DECIMAL(10,2) NOT NULL DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'Ouvrier',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(convention_collective, categorie)
);

-- Activation de la sécurité RLS
ALTER TABLE public.convention_categories ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Enable read access for all users" ON public.convention_categories FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.convention_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.convention_categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.convention_categories FOR DELETE USING (true);

-- Insertion de données par défaut pour la convention interprofessionnelle
INSERT INTO public.convention_categories (convention_collective, categorie, taux_horaire, salaire_base, statut) VALUES
('Convention collective interprofessionnelle', 'Manœuvre', 500.00, 100000, 'Ouvrier'),
('Convention collective interprofessionnelle', 'Ouvrier Spécialisé', 650.00, 130000, 'Ouvrier'),
('Convention collective interprofessionnelle', 'Ouvrier Qualifié', 800.00, 160000, 'Ouvrier'),
('Convention collective interprofessionnelle', 'Agent de Maîtrise', 1200.00, 240000, 'Agent de Maîtrise'),
('Convention collective interprofessionnelle', 'Technicien', 1000.00, 200000, 'Technicien'),
('Convention collective interprofessionnelle', 'Cadre', 2000.00, 400000, 'Cadre'),
('Convention collective interprofessionnelle', 'Cadre Supérieur', 3000.00, 600000, 'Cadre');

-- Pour d'autres conventions
INSERT INTO public.convention_categories (convention_collective, categorie, taux_horaire, salaire_base, statut) VALUES
('Convention collective du commerce', 'Vendeur', 550.00, 110000, 'Employé'),
('Convention collective du commerce', 'Chef de Rayon', 1100.00, 220000, 'Agent de Maîtrise'),
('Convention collective du commerce', 'Responsable Commercial', 1800.00, 360000, 'Cadre'),
('Convention collective de l''industrie', 'Opérateur', 600.00, 120000, 'Ouvrier'),
('Convention collective de l''industrie', 'Contremaître', 1300.00, 260000, 'Agent de Maîtrise'),
('Convention collective de l''industrie', 'Ingénieur', 2500.00, 500000, 'Cadre');
