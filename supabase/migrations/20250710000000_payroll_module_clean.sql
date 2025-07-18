-- Migration complète du module RH-Paie
-- Création de toutes les tables, fonctions et politiques RLS

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des conventions collectives
CREATE TABLE IF NOT EXISTS public.collective_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    base_salary_min DECIMAL(10,2),
    base_salary_max DECIMAL(10,2),
    social_charge_rate DECIMAL(5,4) DEFAULT 0.20,
    tax_rate DECIMAL(5,4) DEFAULT 0.15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des employés
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    hire_date DATE NOT NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    base_salary DECIMAL(10,2) NOT NULL,
    collective_agreement_id UUID REFERENCES public.collective_agreements(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des périodes de paie
CREATE TABLE IF NOT EXISTS public.payroll_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des éléments de paie
CREATE TABLE IF NOT EXISTS public.payroll_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
    element_type VARCHAR(50) NOT NULL, -- 'base_salary', 'bonus', 'deduction', 'overtime', etc.
    description VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    is_taxable BOOLEAN DEFAULT true,
    is_social_chargeable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des calculs de paie
CREATE TABLE IF NOT EXISTS public.payroll_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
    gross_salary DECIMAL(10,2) NOT NULL,
    social_charges DECIMAL(10,2) NOT NULL,
    tax_charges DECIMAL(10,2) NOT NULL,
    net_salary DECIMAL(10,2) NOT NULL,
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des bulletins de paie
CREATE TABLE IF NOT EXISTS public.pay_slips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
    calculation_id UUID REFERENCES public.payroll_calculations(id),
    gross_salary DECIMAL(10,2) NOT NULL,
    social_charges DECIMAL(10,2) NOT NULL,
    tax_charges DECIMAL(10,2) NOT NULL,
    net_salary DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des rapports de paie
CREATE TABLE IF NOT EXISTS public.payroll_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- 'summary', 'detailed', 'tax', 'social'
    report_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_agreement ON public.employees(collective_agreement_id);
CREATE INDEX IF NOT EXISTS idx_payroll_elements_employee ON public.payroll_elements(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_elements_period ON public.payroll_elements(period_id);
CREATE INDEX IF NOT EXISTS idx_pay_slips_employee ON public.pay_slips(employee_id);
CREATE INDEX IF NOT EXISTS idx_pay_slips_period ON public.pay_slips(period_id);

-- Vues pour simplifier les requêtes
CREATE OR REPLACE VIEW public.employee_payroll_summary AS
SELECT 
    e.id,
    e.employee_number,
    e.first_name,
    e.last_name,
    e.email,
    e.base_salary,
    ca.name as agreement_name,
    COUNT(ps.id) as pay_slips_count,
    COALESCE(SUM(ps.net_salary), 0) as total_net_salary
FROM public.employees e
LEFT JOIN public.collective_agreements ca ON e.collective_agreement_id = ca.id
LEFT JOIN public.pay_slips ps ON e.id = ps.employee_id
GROUP BY e.id, e.employee_number, e.first_name, e.last_name, e.email, e.base_salary, ca.name;

CREATE OR REPLACE VIEW public.payroll_element_totals AS
SELECT 
    pe.period_id,
    pe.element_type,
    COUNT(*) as element_count,
    SUM(pe.amount) as total_amount
FROM public.payroll_elements pe
GROUP BY pe.period_id, pe.element_type;

-- Fonctions de calcul automatique
CREATE OR REPLACE FUNCTION public.calculate_gross_salary(employee_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_gross DECIMAL(10,2) := 0;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_gross
    FROM public.payroll_elements
    WHERE employee_id = $1;
    
    RETURN total_gross;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.calculate_social_charges(employee_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    gross_salary DECIMAL(10,2);
    social_rate DECIMAL(5,4);
BEGIN
    SELECT public.calculate_gross_salary($1) INTO gross_salary;
    
    SELECT ca.social_charge_rate INTO social_rate
    FROM public.employees e
    JOIN public.collective_agreements ca ON e.collective_agreement_id = ca.id
    WHERE e.id = $1;
    
    RETURN COALESCE(gross_salary * social_rate, 0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.calculate_tax_charges(employee_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    gross_salary DECIMAL(10,2);
    social_charges DECIMAL(10,2);
    taxable_amount DECIMAL(10,2);
    tax_rate DECIMAL(5,4);
BEGIN
    SELECT public.calculate_gross_salary($1) INTO gross_salary;
    SELECT public.calculate_social_charges($1) INTO social_charges;
    
    SELECT ca.tax_rate INTO tax_rate
    FROM public.employees e
    JOIN public.collective_agreements ca ON e.collective_agreement_id = ca.id
    WHERE e.id = $1;
    
    taxable_amount := gross_salary - social_charges;
    RETURN COALESCE(taxable_amount * tax_rate, 0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.calculate_net_salary(employee_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    gross_salary DECIMAL(10,2);
    social_charges DECIMAL(10,2);
    tax_charges DECIMAL(10,2);
BEGIN
    SELECT public.calculate_gross_salary($1) INTO gross_salary;
    SELECT public.calculate_social_charges($1) INTO social_charges;
    SELECT public.calculate_tax_charges($1) INTO tax_charges;
    
    RETURN gross_salary - social_charges - tax_charges;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_pay_slip(employee_id UUID, period_start DATE, period_end DATE)
RETURNS UUID AS $$
DECLARE
    period_id UUID;
    calculation_id UUID;
    pay_slip_id UUID;
    gross_salary DECIMAL(10,2);
    social_charges DECIMAL(10,2);
    tax_charges DECIMAL(10,2);
    net_salary DECIMAL(10,2);
BEGIN
    -- Créer ou récupérer la période
    SELECT id INTO period_id
    FROM public.payroll_periods
    WHERE start_date = period_start AND end_date = period_end;
    
    IF period_id IS NULL THEN
        INSERT INTO public.payroll_periods (name, start_date, end_date)
        VALUES (
            'Période ' || period_start || ' - ' || period_end,
            period_start,
            period_end
        ) RETURNING id INTO period_id;
    END IF;
    
    -- Calculer les montants
    SELECT public.calculate_gross_salary(employee_id) INTO gross_salary;
    SELECT public.calculate_social_charges(employee_id) INTO social_charges;
    SELECT public.calculate_tax_charges(employee_id) INTO tax_charges;
    SELECT public.calculate_net_salary(employee_id) INTO net_salary;
    
    -- Créer l'enregistrement de calcul
    INSERT INTO public.payroll_calculations (
        employee_id, period_id, gross_salary, social_charges, tax_charges, net_salary
    ) VALUES (
        employee_id, period_id, gross_salary, social_charges, tax_charges, net_salary
    ) RETURNING id INTO calculation_id;
    
    -- Créer le bulletin de paie
    INSERT INTO public.pay_slips (
        employee_id, period_id, calculation_id, gross_salary, social_charges, tax_charges, net_salary
    ) VALUES (
        employee_id, period_id, calculation_id, gross_salary, social_charges, tax_charges, net_salary
    ) RETURNING id INTO pay_slip_id;
    
    RETURN pay_slip_id;
END;
$$ LANGUAGE plpgsql;

-- Politiques RLS (Row Level Security)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collective_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_reports ENABLE ROW LEVEL SECURITY;

-- Politiques pour les employés
CREATE POLICY "Enable read access for all users" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.employees FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on email" ON public.employees FOR UPDATE USING (auth.email() = email);
CREATE POLICY "Enable delete for users based on email" ON public.employees FOR DELETE USING (auth.email() = email);

-- Politiques pour les conventions collectives
CREATE POLICY "Enable read access for all users" ON public.collective_agreements FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.collective_agreements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.collective_agreements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.collective_agreements FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques pour les périodes de paie
CREATE POLICY "Enable read access for all users" ON public.payroll_periods FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.payroll_periods FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.payroll_periods FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.payroll_periods FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques pour les éléments de paie
CREATE POLICY "Enable read access for all users" ON public.payroll_elements FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.payroll_elements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.payroll_elements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.payroll_elements FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques pour les calculs de paie
CREATE POLICY "Enable read access for all users" ON public.payroll_calculations FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.payroll_calculations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.payroll_calculations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.payroll_calculations FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques pour les bulletins de paie
CREATE POLICY "Enable read access for all users" ON public.pay_slips FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.pay_slips FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.pay_slips FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.pay_slips FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques pour les rapports de paie
CREATE POLICY "Enable read access for all users" ON public.payroll_reports FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.payroll_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.payroll_reports FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.payroll_reports FOR DELETE USING (auth.role() = 'authenticated');

-- Données de test pour les conventions collectives
INSERT INTO public.collective_agreements (name, code, description, base_salary_min, base_salary_max, social_charge_rate, tax_rate) VALUES
('Convention Cadres', 'CADRE', 'Convention collective pour les cadres', 50000.00, 150000.00, 0.25, 0.20),
('Convention Employés', 'EMPLOYE', 'Convention collective pour les employés', 25000.00, 80000.00, 0.20, 0.15),
('Convention Ouvriers', 'OUVRIER', 'Convention collective pour les ouvriers', 20000.00, 60000.00, 0.18, 0.12);

-- Données de test pour les employés
INSERT INTO public.employees (employee_number, first_name, last_name, email, phone, address, hire_date, position, department, base_salary, collective_agreement_id) VALUES
('EMP001', 'Jean', 'Dupont', 'jean.dupont@entreprise.com', '0123456789', '123 Rue de la Paix, Paris', '2023-01-15', 'Développeur Senior', 'IT', 65000.00, (SELECT id FROM public.collective_agreements WHERE code = 'CADRE')),
('EMP002', 'Marie', 'Martin', 'marie.martin@entreprise.com', '0987654321', '456 Avenue des Champs, Lyon', '2023-03-20', 'Comptable', 'Finance', 45000.00, (SELECT id FROM public.collective_agreements WHERE code = 'EMPLOYE')),
('EMP003', 'Pierre', 'Durand', 'pierre.durand@entreprise.com', '0555666777', '789 Boulevard Central, Marseille', '2023-06-10', 'Technicien', 'Production', 35000.00, (SELECT id FROM public.collective_agreements WHERE code = 'OUVRIER')); 