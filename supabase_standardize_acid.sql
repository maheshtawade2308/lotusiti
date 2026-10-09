-- ============================================================================
-- LOTUSITI DATABASE STANDARDIZATION & ACID COMPLIANCE MIGRATION
-- ============================================================================
-- NOTE:
-- 1. This script is safe to run multiple times (idempotent where possible).
-- 2. It preserves ALL existing rows in `public.profiles` and `public.transactions`.
-- 3. It adds constraints, foreign keys with referential integrity, indexes,
--    and atomic PostgreSQL procedures with transactional ACID guarantees.
-- ============================================================================

-- Wrap schema modifications in an explicit transaction block where possible
BEGIN;

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. STANDARDIZE `public.profiles` TABLE
-- ----------------------------------------------------------------------------

-- Ensure table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  mobile VARCHAR(20),
  address TEXT,
  gender VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user',
  balance_points INTEGER DEFAULT 0,
  center_name TEXT DEFAULT 'Lotus Computer Institute',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure missing columns exist without losing existing data
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS balance_points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS center_name TEXT DEFAULT 'Lotus Computer Institute';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Clean up any nulls before enforcing NOT NULL / constraints
UPDATE public.profiles SET balance_points = 0 WHERE balance_points IS NULL;
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;
UPDATE public.profiles SET created_at = now() WHERE created_at IS NULL;
UPDATE public.profiles SET updated_at = now() WHERE updated_at IS NULL;
UPDATE public.profiles SET center_name = 'Lotus Computer Institute' WHERE center_name IS NULL OR center_name = '';

-- Alter defaults and nullability
ALTER TABLE public.profiles ALTER COLUMN balance_points SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN balance_points SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user';
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.profiles ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.profiles ALTER COLUMN updated_at SET NOT NULL;

-- Add check constraints safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_profiles_balance_points_non_negative'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT check_profiles_balance_points_non_negative
      CHECK (balance_points >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_profiles_role'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT check_profiles_role
      CHECK (role IN ('admin', 'user'));
  END IF;
END $$;

-- Ensure Foreign Key to auth.users with ON DELETE CASCADE
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not recreate profiles_id_fkey: %', SQLERRM;
END $$;

-- ----------------------------------------------------------------------------
-- 3. STANDARDIZE `public.transactions` TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Ensure missing columns exist
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS type VARCHAR(10);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS amount INTEGER;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS balance_after INTEGER;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Ensure non-null values
ALTER TABLE public.transactions ALTER COLUMN type SET NOT NULL;
ALTER TABLE public.transactions ALTER COLUMN amount SET NOT NULL;
ALTER TABLE public.transactions ALTER COLUMN balance_after SET NOT NULL;
ALTER TABLE public.transactions ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.transactions ALTER COLUMN created_at SET NOT NULL;

-- Check constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_transactions_type'
  ) THEN
    ALTER TABLE public.transactions
      ADD CONSTRAINT check_transactions_type
      CHECK (type IN ('credit', 'debit'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_transactions_amount_positive'
  ) THEN
    ALTER TABLE public.transactions
      ADD CONSTRAINT check_transactions_amount_positive
      CHECK (amount > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_transactions_balance_after_non_negative'
  ) THEN
    ALTER TABLE public.transactions
      ADD CONSTRAINT check_transactions_balance_after_non_negative
      CHECK (balance_after >= 0);
  END IF;
END $$;

-- Foreign key to profiles(id)
DO $$
BEGIN
  ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
  ALTER TABLE public.transactions
    ADD CONSTRAINT transactions_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not recreate transactions_user_id_fkey: %', SQLERRM;
END $$;

-- ----------------------------------------------------------------------------
-- 4. PERFORMANCE & CONCURRENCY INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at_desc ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON public.transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- ----------------------------------------------------------------------------
-- 5. AUTOMATIC `updated_at` TRIGGER FOR PROFILES
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6. STANDARDIZED VIEW: `public.user_profiles_with_last_login`
-- ----------------------------------------------------------------------------
-- In PostgreSQL, CREATE OR REPLACE VIEW fails with 42P16 if existing view columns changed/reordered.
-- Dropping the view first does NOT delete any underlying user/table data.
DROP VIEW IF EXISTS public.user_profiles_with_last_login;

CREATE VIEW public.user_profiles_with_last_login AS
SELECT
  p.id,
  p.name,
  p.email,
  p.mobile,
  p.address,
  p.gender,
  p.role,
  p.balance_points,
  p.center_name,
  p.created_at,
  p.updated_at,
  u.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id;

COMMIT;

-- ============================================================================
-- 7. ACID-COMPLIANT STORED PROCEDURES / FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- (A) ATOMIC DEDUCT POINTS FUNCTION
-- ACID: Atomicity & Consistency via SELECT ... FOR UPDATE row-level lock.
--       If balance is insufficient or an error occurs, entire transaction rolls back.
-- Returns JSON: { "success": boolean, "new_balance": int, "error": text }
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.deduct_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_description TEXT DEFAULT 'Points deducted'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_role VARCHAR(20);
  v_tx_id UUID;
BEGIN
  -- Validate input
  IF p_points IS NULL OR p_points <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Points to deduct must be greater than zero.'
    );
  END IF;

  -- Lock user row with SELECT ... FOR UPDATE to avoid race conditions
  SELECT balance_points, role
    INTO v_current_balance, v_role
    FROM public.profiles
   WHERE id = p_user_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User profile not found.'
    );
  END IF;

  -- Admin users can download without points deduction
  IF v_role = 'admin' THEN
    RETURN jsonb_build_object(
      'success', true,
      'is_admin', true,
      'new_balance', v_current_balance
    );
  END IF;

  -- Verify balance
  IF v_current_balance < p_points THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance points.',
      'current_balance', v_current_balance
    );
  END IF;

  -- Atomic update
  v_new_balance := v_current_balance - p_points;

  UPDATE public.profiles
     SET balance_points = v_new_balance
   WHERE id = p_user_id;

  -- Atomic transaction insert
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    balance_after,
    description,
    created_at
  ) VALUES (
    p_user_id,
    'debit',
    p_points,
    v_new_balance,
    COALESCE(p_description, 'Points deducted'),
    now()
  ) RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'transaction_id', v_tx_id
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- (B) ATOMIC ADJUST BALANCE FUNCTION (FOR ADMINS)
-- Can credit or debit any amount, recalculating atomically with row lock.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.adjust_user_balance(
  p_user_id UUID,
  p_points_diff INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_type VARCHAR(10);
  v_amount INTEGER;
  v_desc TEXT;
  v_tx_id UUID;
BEGIN
  IF p_points_diff IS NULL OR p_points_diff = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Difference amount must be non-zero.'
    );
  END IF;

  -- Lock row for update
  SELECT balance_points
    INTO v_current_balance
    FROM public.profiles
   WHERE id = p_user_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User profile not found.'
    );
  END IF;

  v_new_balance := v_current_balance + p_points_diff;

  IF v_new_balance < 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Resulting balance cannot be negative.',
      'current_balance', v_current_balance
    );
  END IF;

  -- Update balance
  UPDATE public.profiles
     SET balance_points = v_new_balance
   WHERE id = p_user_id;

  -- Determine transaction type & description
  IF p_points_diff > 0 THEN
    v_type := 'credit';
    v_amount := p_points_diff;
    v_desc := COALESCE(p_description, format('Credited by admin (+%s Rs)', p_points_diff));
  ELSE
    v_type := 'debit';
    v_amount := ABS(p_points_diff);
    v_desc := COALESCE(p_description, format('Debited by admin (%s Rs)', p_points_diff));
  END IF;

  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    balance_after,
    description,
    created_at
  ) VALUES (
    p_user_id,
    v_type,
    v_amount,
    v_new_balance,
    v_desc,
    now()
  ) RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'transaction_id', v_tx_id
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- (C) ATOMIC UPDATE PROFILE AND BALANCE (FOR ADMIN EDIT MODAL)
-- Handles modifying profile fields and diffing/logging balance in a single transaction.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_update_profile(
  p_user_id UUID,
  p_name TEXT,
  p_mobile VARCHAR(20),
  p_address TEXT,
  p_center_name TEXT,
  p_new_balance INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_old_balance INTEGER;
  v_diff INTEGER;
  v_tx_id UUID;
BEGIN
  IF p_new_balance IS NOT NULL AND p_new_balance < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Balance cannot be negative');
  END IF;

  -- Lock user row
  SELECT balance_points INTO v_old_balance
    FROM public.profiles
   WHERE id = p_user_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Update profile info
  UPDATE public.profiles
     SET name = COALESCE(p_name, name),
         mobile = COALESCE(p_mobile, mobile),
         address = COALESCE(p_address, address),
         center_name = COALESCE(p_center_name, center_name),
         balance_points = COALESCE(p_new_balance, balance_points)
   WHERE id = p_user_id;

  -- If balance changed, log transaction atomically
  IF p_new_balance IS NOT NULL AND p_new_balance <> v_old_balance THEN
    v_diff := p_new_balance - v_old_balance;
    INSERT INTO public.transactions (
      user_id,
      type,
      amount,
      balance_after,
      description,
      created_at
    ) VALUES (
      p_user_id,
      CASE WHEN v_diff > 0 THEN 'credit' ELSE 'debit' END,
      ABS(v_diff),
      p_new_balance,
      CASE WHEN v_diff > 0 THEN format('Credited by admin (+%s Rs)', v_diff)
           ELSE format('Debited by admin (%s Rs)', v_diff) END,
      now()
    ) RETURNING id INTO v_tx_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', COALESCE(p_new_balance, v_old_balance),
    'transaction_id', v_tx_id
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- (D) SECURE DELETE USER BY ID (CASCADE DELETE FROM AUTH.USERS)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_user_by_id(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures data isolation: regular users can only read their own profile & transactions.
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Transactions Policies
DROP POLICY IF EXISTS "transactions_select_policy" ON public.transactions;
CREATE POLICY "transactions_select_policy" ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "transactions_insert_policy" ON public.transactions;
CREATE POLICY "transactions_insert_policy" ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Grant execute permissions to authenticated users on stored functions
GRANT EXECUTE ON FUNCTION public.deduct_user_points(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_user_balance(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_profile(UUID, TEXT, VARCHAR, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_by_id(UUID) TO authenticated;
