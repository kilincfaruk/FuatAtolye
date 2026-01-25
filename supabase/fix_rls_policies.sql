-- FuatAtolye RLS Politikaları Düzeltme
-- Bu script'i Supabase Dashboard > SQL Editor'de çalıştırın

-- 1. Önce tabloların var olup olmadığını kontrol et
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customers', 'transactions', 'payments', 'expenses', 'work_types');

-- 2. Mevcut RLS politikalarını kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- 3. Eğer tablolar yoksa, önce schema.sql'i çalıştırın
-- Eğer tablolar var ama politikalar yoksa, aşağıdaki politikaları ekleyin:

-- ============================================
-- ANON (Giriş yapmamış) kullanıcılar için politikalar
-- Test amaçlı - üretimde kaldırılabilir
-- ============================================

-- Customers tablosu için anon politikaları
DROP POLICY IF EXISTS "customers_anon_select" ON public.customers;
DROP POLICY IF EXISTS "customers_anon_insert" ON public.customers;
DROP POLICY IF EXISTS "customers_anon_update" ON public.customers;
DROP POLICY IF EXISTS "customers_anon_delete" ON public.customers;

CREATE POLICY "customers_anon_select" ON public.customers FOR SELECT TO anon USING (true);
CREATE POLICY "customers_anon_insert" ON public.customers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "customers_anon_update" ON public.customers FOR UPDATE TO anon USING (true);
CREATE POLICY "customers_anon_delete" ON public.customers FOR DELETE TO anon USING (true);

-- Transactions tablosu için anon politikaları
DROP POLICY IF EXISTS "transactions_anon_select" ON public.transactions;
DROP POLICY IF EXISTS "transactions_anon_insert" ON public.transactions;
DROP POLICY IF EXISTS "transactions_anon_update" ON public.transactions;
DROP POLICY IF EXISTS "transactions_anon_delete" ON public.transactions;

CREATE POLICY "transactions_anon_select" ON public.transactions FOR SELECT TO anon USING (true);
CREATE POLICY "transactions_anon_insert" ON public.transactions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "transactions_anon_update" ON public.transactions FOR UPDATE TO anon USING (true);
CREATE POLICY "transactions_anon_delete" ON public.transactions FOR DELETE TO anon USING (true);

-- Payments tablosu için anon politikaları
DROP POLICY IF EXISTS "payments_anon_select" ON public.payments;
DROP POLICY IF EXISTS "payments_anon_insert" ON public.payments;
DROP POLICY IF EXISTS "payments_anon_update" ON public.payments;
DROP POLICY IF EXISTS "payments_anon_delete" ON public.payments;

CREATE POLICY "payments_anon_select" ON public.payments FOR SELECT TO anon USING (true);
CREATE POLICY "payments_anon_insert" ON public.payments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "payments_anon_update" ON public.payments FOR UPDATE TO anon USING (true);
CREATE POLICY "payments_anon_delete" ON public.payments FOR DELETE TO anon USING (true);

-- Expenses tablosu için anon politikaları
DROP POLICY IF EXISTS "expenses_anon_select" ON public.expenses;
DROP POLICY IF EXISTS "expenses_anon_insert" ON public.expenses;
DROP POLICY IF EXISTS "expenses_anon_update" ON public.expenses;
DROP POLICY IF EXISTS "expenses_anon_delete" ON public.expenses;

CREATE POLICY "expenses_anon_select" ON public.expenses FOR SELECT TO anon USING (true);
CREATE POLICY "expenses_anon_insert" ON public.expenses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "expenses_anon_update" ON public.expenses FOR UPDATE TO anon USING (true);
CREATE POLICY "expenses_anon_delete" ON public.expenses FOR DELETE TO anon USING (true);

-- Work_types tablosu için anon politikaları
DROP POLICY IF EXISTS "work_types_anon_select" ON public.work_types;
DROP POLICY IF EXISTS "work_types_anon_insert" ON public.work_types;
DROP POLICY IF EXISTS "work_types_anon_update" ON public.work_types;
DROP POLICY IF EXISTS "work_types_anon_delete" ON public.work_types;

CREATE POLICY "work_types_anon_select" ON public.work_types FOR SELECT TO anon USING (true);
CREATE POLICY "work_types_anon_insert" ON public.work_types FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "work_types_anon_update" ON public.work_types FOR UPDATE TO anon USING (true);
CREATE POLICY "work_types_anon_delete" ON public.work_types FOR DELETE TO anon USING (true);

-- ============================================
-- Authenticated kullanıcılar için politikaları yeniden oluştur
-- ============================================

-- Customers
DROP POLICY IF EXISTS "customers_select" ON public.customers;
DROP POLICY IF EXISTS "customers_insert" ON public.customers;
DROP POLICY IF EXISTS "customers_update" ON public.customers;
DROP POLICY IF EXISTS "customers_delete" ON public.customers;

CREATE POLICY "customers_select" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "customers_insert" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "customers_update" ON public.customers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "customers_delete" ON public.customers FOR DELETE TO authenticated USING (true);

-- Transactions
DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
DROP POLICY IF EXISTS "transactions_update" ON public.transactions;
DROP POLICY IF EXISTS "transactions_delete" ON public.transactions;

CREATE POLICY "transactions_select" ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "transactions_update" ON public.transactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "transactions_delete" ON public.transactions FOR DELETE TO authenticated USING (true);

-- Payments
DROP POLICY IF EXISTS "payments_select" ON public.payments;
DROP POLICY IF EXISTS "payments_insert" ON public.payments;
DROP POLICY IF EXISTS "payments_update" ON public.payments;
DROP POLICY IF EXISTS "payments_delete" ON public.payments;

CREATE POLICY "payments_select" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "payments_insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "payments_update" ON public.payments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "payments_delete" ON public.payments FOR DELETE TO authenticated USING (true);

-- Expenses
DROP POLICY IF EXISTS "expenses_select" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete" ON public.expenses;

CREATE POLICY "expenses_select" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "expenses_insert" ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "expenses_update" ON public.expenses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "expenses_delete" ON public.expenses FOR DELETE TO authenticated USING (true);

-- Work_types
DROP POLICY IF EXISTS "work_types_select" ON public.work_types;
DROP POLICY IF EXISTS "work_types_insert" ON public.work_types;
DROP POLICY IF EXISTS "work_types_update" ON public.work_types;
DROP POLICY IF EXISTS "work_types_delete" ON public.work_types;

CREATE POLICY "work_types_select" ON public.work_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "work_types_insert" ON public.work_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "work_types_update" ON public.work_types FOR UPDATE TO authenticated USING (true);
CREATE POLICY "work_types_delete" ON public.work_types FOR DELETE TO authenticated USING (true);

-- 4. Sonucu doğrula
SELECT 'Politikalar başarıyla güncellendi!' as result;

SELECT schemaname, tablename, policyname, roles 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
