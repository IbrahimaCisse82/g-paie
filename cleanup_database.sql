-- Script de nettoyage complet de la base Supabase
-- Supprime toutes les tables, vues, fonctions, séquences, policies et triggers du schéma public

-- Supprimer toutes les policies RLS
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Enable update for users based on email" ON public.' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Supprimer toutes les tables
DROP TABLE IF EXISTS public.pay_slips CASCADE;
DROP TABLE IF EXISTS public.payroll_elements CASCADE;
DROP TABLE IF EXISTS public.payroll_calculations CASCADE;
DROP TABLE IF EXISTS public.collective_agreements CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.payroll_periods CASCADE;
DROP TABLE IF EXISTS public.payroll_reports CASCADE;

-- Supprimer toutes les vues
DROP VIEW IF EXISTS public.employee_payroll_summary CASCADE;
DROP VIEW IF EXISTS public.payroll_element_totals CASCADE;

-- Supprimer toutes les fonctions
DROP FUNCTION IF EXISTS public.calculate_gross_salary(employee_id UUID);
DROP FUNCTION IF EXISTS public.calculate_net_salary(employee_id UUID);
DROP FUNCTION IF EXISTS public.calculate_social_charges(employee_id UUID);
DROP FUNCTION IF EXISTS public.calculate_tax_charges(employee_id UUID);
DROP FUNCTION IF EXISTS public.generate_pay_slip(employee_id UUID, period_start DATE, period_end DATE);

-- Supprimer toutes les séquences
DROP SEQUENCE IF EXISTS public.employees_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.pay_slips_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.payroll_elements_id_seq CASCADE;

-- Réinitialiser les permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Vider l'historique des migrations
DELETE FROM supabase_migrations.schema_migrations; 