-- =============================================================
--  REV WORKFORCE — Multi-Tenant Supabase Schema (CLEAN)
--  No seed/dummy data. Run this in Supabase SQL Editor.
--  Dashboard → SQL Editor → New query → paste → Run
-- =============================================================

-- Drop old tables if re-running (safe re-run)
DROP TABLE IF EXISTS notifications        CASCADE;
DROP TABLE IF EXISTS announcements        CASCADE;
DROP TABLE IF EXISTS goals                CASCADE;
DROP TABLE IF EXISTS performance_reviews  CASCADE;
DROP TABLE IF EXISTS holidays             CASCADE;
DROP TABLE IF EXISTS leave_applications   CASCADE;
DROP TABLE IF EXISTS leave_balances       CASCADE;
DROP TABLE IF EXISTS employees            CASCADE;
DROP TABLE IF EXISTS designations         CASCADE;
DROP TABLE IF EXISTS departments          CASCADE;
DROP TABLE IF EXISTS companies            CASCADE;

DROP FUNCTION IF EXISTS login_employee(TEXT, TEXT);
DROP FUNCTION IF EXISTS register_company(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS verify_password(TEXT, TEXT);

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =============================================================
-- 1. COMPANIES  (tenant root — one row per organisation)
-- =============================================================
CREATE TABLE companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================
-- 2. DEPARTMENTS
-- =============================================================
CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  UNIQUE (company_id, name)
);


-- =============================================================
-- 3. DESIGNATIONS
-- =============================================================
CREATE TABLE designations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  dept_id     UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE
);


-- =============================================================
-- 4. EMPLOYEES
--    • Only admin can INSERT new employees (enforced in app).
--    • role: 'admin' | 'manager' | 'hr' | 'employee'
--    • employee_code: human-readable ID like EMP001 (unique per company)
--    • password stored as bcrypt hash
-- =============================================================
CREATE TABLE employees (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_code      TEXT NOT NULL,             -- e.g. EMP001
  name               TEXT NOT NULL,
  email              TEXT NOT NULL,
  password_hash      TEXT NOT NULL,
  phone              TEXT,
  address            TEXT,
  dob                DATE,
  joining_date       DATE,
  department_id      UUID REFERENCES departments(id),
  designation_id     UUID REFERENCES designations(id),
  manager_id         UUID REFERENCES employees(id),
  role               TEXT NOT NULL DEFAULT 'employee'
                       CHECK (role IN ('admin', 'manager', 'hr', 'employee')),
  salary             NUMERIC(12, 2),
  status             TEXT NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active', 'inactive')),
  emergency_contact  TEXT,
  avatar             TEXT,                      -- initials, e.g. 'AU'
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (company_id, email),
  UNIQUE (company_id, employee_code)
);


-- =============================================================
-- 5. LEAVE BALANCES
-- =============================================================
CREATE TABLE leave_balances (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  cl          INTEGER NOT NULL DEFAULT 12,      -- Casual Leave
  sl          INTEGER NOT NULL DEFAULT 10,      -- Sick Leave
  pl          INTEGER NOT NULL DEFAULT 15,      -- Paid Leave
  UNIQUE (employee_id)
);


-- =============================================================
-- 6. LEAVE APPLICATIONS
-- =============================================================
CREATE TABLE leave_applications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id      UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (type IN ('CL', 'SL', 'PL')),
  from_date        DATE NOT NULL,
  to_date          DATE NOT NULL,
  reason           TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected')),
  manager_comment  TEXT DEFAULT '',
  applied_on       DATE NOT NULL DEFAULT CURRENT_DATE
);


-- =============================================================
-- 7. HOLIDAYS
-- =============================================================
CREATE TABLE holidays (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  date        DATE NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('national', 'festival', 'optional')),
  UNIQUE (company_id, date)
);


-- =============================================================
-- 8. PERFORMANCE REVIEWS
-- =============================================================
CREATE TABLE performance_reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id      UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year             INTEGER NOT NULL,
  status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'submitted', 'reviewed')),
  deliverables     TEXT DEFAULT '',
  accomplishments  TEXT DEFAULT '',
  improvements     TEXT DEFAULT '',
  self_rating      INTEGER CHECK (self_rating BETWEEN 1 AND 5),
  manager_feedback TEXT DEFAULT '',
  manager_rating   INTEGER CHECK (manager_rating BETWEEN 1 AND 5),
  submitted_on     DATE,
  reviewed_on      DATE,
  UNIQUE (employee_id, year)
);


-- =============================================================
-- 9. GOALS
-- =============================================================
CREATE TABLE goals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id      UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  description      TEXT NOT NULL,
  deadline         DATE,
  priority         TEXT NOT NULL DEFAULT 'medium'
                     CHECK (priority IN ('low', 'medium', 'high')),
  success_metrics  TEXT DEFAULT '',
  progress         INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status           TEXT NOT NULL DEFAULT 'in_progress'
                     CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  year             INTEGER NOT NULL
);


-- =============================================================
-- 10. NOTIFICATIONS
-- =============================================================
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================
-- 11. ANNOUNCEMENTS
-- =============================================================
CREATE TABLE announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
ALTER TABLE companies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE designations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees            ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances       ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_applications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays             ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews  ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals                ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements        ENABLE ROW LEVEL SECURITY;

-- Allow anon key full access (your app enforces company_id scoping)
DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'companies','departments','designations','employees','leave_balances',
    'leave_applications','holidays','performance_reviews',
    'goals','notifications','announcements'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY "anon_all_%s" ON %I FOR ALL TO anon USING (true) WITH CHECK (true)',
      t, t
    );
  END LOOP;
END $$;


-- =============================================================
-- RPC 1: register_company
--   Called once when an admin signs up for the first time.
--   Creates the company + the admin employee in one transaction.
--   Returns the new employee row.
--
--   Frontend usage:
--     supabase.rpc('register_company', {
--       company_name: 'Acme Corp',
--       admin_name:   'John Doe',
--       admin_email:  'john@acme.com',
--       plain_password: 'SecurePass123'
--     })
-- =============================================================
CREATE OR REPLACE FUNCTION register_company(
  company_name   TEXT,
  admin_name     TEXT,
  admin_email    TEXT,
  plain_password TEXT
)
RETURNS SETOF employees
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_company_id UUID;
  initials TEXT;
BEGIN
  -- Prevent duplicate admin emails across all companies
  IF EXISTS (SELECT 1 FROM employees WHERE email = admin_email) THEN
    RAISE EXCEPTION 'An account with this email already exists.';
  END IF;

  -- Create the company
  INSERT INTO companies (name)
  VALUES (company_name)
  RETURNING id INTO new_company_id;

  -- Compute initials from name (max 2 chars)
  SELECT string_agg(left(word, 1), '')
  INTO initials
  FROM (
    SELECT unnest(string_to_array(admin_name, ' ')) AS word
    LIMIT 2
  ) t;

  -- Create the admin employee
  INSERT INTO employees (
    company_id, employee_code, name, email, password_hash,
    role, status, avatar, joining_date
  ) VALUES (
    new_company_id,
    'EMP001',
    admin_name,
    admin_email,
    crypt(plain_password, gen_salt('bf', 10)),
    'admin',
    'active',
    upper(initials),
    CURRENT_DATE
  );

  RETURN QUERY
    SELECT * FROM employees WHERE email = admin_email;
END;
$$;


-- =============================================================
-- RPC 2: login_employee
--   Works for ALL roles: admin, manager, hr, employee.
--   Matches by employee_code OR email + password.
--   Returns the full employee row (including company_id & role).
--
--   Frontend usage:
--     supabase.rpc('login_employee', {
--       id_or_email:    'john@acme.com',   // or 'EMP001'
--       plain_password: 'SecurePass123'
--     })
-- =============================================================
CREATE OR REPLACE FUNCTION login_employee(
  id_or_email    TEXT,
  plain_password TEXT
)
RETURNS SETOF employees
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT * FROM employees
  WHERE (employee_code = id_or_email OR email = id_or_email)
    AND password_hash = crypt(plain_password, password_hash)
    AND status = 'active'
  LIMIT 1;
$$;


-- =============================================================
-- RPC 3: add_employee
--   Called by admin (or HR) to create a new team member.
--   Auto-generates employee_code (EMP002, EMP003, …) per company.
--   Returns the new employee row.
--
--   Frontend usage:
--     supabase.rpc('add_employee', {
--       p_company_id:    '<uuid>',
--       p_name:          'Jane Smith',
--       p_email:         'jane@acme.com',
--       p_plain_password:'TempPass@123',
--       p_role:          'employee',
--       p_phone:         '9876543210',
--       p_department_id: '<uuid>',      -- optional
--       p_designation_id:'<uuid>',      -- optional
--       p_manager_id:    '<uuid>',      -- optional
--       p_salary:        60000,         -- optional
--       p_joining_date:  '2026-02-24'   -- optional
--     })
-- =============================================================
CREATE OR REPLACE FUNCTION add_employee(
  p_company_id     UUID,
  p_name           TEXT,
  p_email          TEXT,
  p_plain_password TEXT,
  p_role           TEXT    DEFAULT 'employee',
  p_phone          TEXT    DEFAULT NULL,
  p_address        TEXT    DEFAULT NULL,
  p_dob            DATE    DEFAULT NULL,
  p_joining_date   DATE    DEFAULT CURRENT_DATE,
  p_department_id  UUID    DEFAULT NULL,
  p_designation_id UUID    DEFAULT NULL,
  p_manager_id     UUID    DEFAULT NULL,
  p_salary         NUMERIC DEFAULT NULL,
  p_emergency_contact TEXT DEFAULT NULL
)
RETURNS SETOF employees
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  next_code TEXT;
  emp_count INTEGER;
  initials  TEXT;
BEGIN
  -- Check email uniqueness within company
  IF EXISTS (
    SELECT 1 FROM employees
    WHERE company_id = p_company_id AND email = p_email
  ) THEN
    RAISE EXCEPTION 'An employee with this email already exists in this company.';
  END IF;

  -- Generate next employee code (EMP001, EMP002, …)
  SELECT COUNT(*) INTO emp_count FROM employees WHERE company_id = p_company_id;
  next_code := 'EMP' || lpad((emp_count + 1)::TEXT, 3, '0');

  -- Compute initials
  SELECT string_agg(left(word, 1), '')
  INTO initials
  FROM (
    SELECT unnest(string_to_array(p_name, ' ')) AS word
    LIMIT 2
  ) t;

  -- Insert employee
  INSERT INTO employees (
    company_id, employee_code, name, email, password_hash,
    role, phone, address, dob, joining_date,
    department_id, designation_id, manager_id,
    salary, status, emergency_contact, avatar
  ) VALUES (
    p_company_id,
    next_code,
    p_name,
    p_email,
    crypt(p_plain_password, gen_salt('bf', 10)),
    p_role,
    p_phone,
    p_address,
    p_dob,
    p_joining_date,
    p_department_id,
    p_designation_id,
    p_manager_id,
    p_salary,
    'active',
    p_emergency_contact,
    upper(initials)
  );

  -- Auto-create default leave balance
  INSERT INTO leave_balances (company_id, employee_id)
  SELECT p_company_id, id FROM employees
  WHERE company_id = p_company_id AND email = p_email;

  RETURN QUERY
    SELECT * FROM employees
    WHERE company_id = p_company_id AND email = p_email;
END;
$$;


-- Done! ✅
-- Tables  : companies, departments, designations, employees,
--           leave_balances, leave_applications, holidays,
--           performance_reviews, goals, notifications, announcements
-- RPCs    : register_company()  — first-time company + admin setup
--           login_employee()    — login for ALL roles
--           add_employee()      — admin/HR adds a team member
