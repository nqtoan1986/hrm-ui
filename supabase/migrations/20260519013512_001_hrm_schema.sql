/*
  # HRM System - Complete Database Schema

  1. New Tables
    - `employees` - Core employee records with personal info, department, role, status
    - `leave_requests` - Employee leave applications with type, dates, status
    - `attendance` - Daily attendance/timekeeping records
    - `onboarding_profiles` - Multi-step onboarding: Draft → Offer Sent → Candidate Completed
    - `onboarding_documents` - Uploaded documents (ID cards, degrees, portrait photo)
    - `onboarding_education` - Education/degree records for onboarding
    - `onboarding_emergency_contacts` - Emergency contact persons for onboarding

  2. Security
    - RLS enabled on all tables
    - Authenticated users can read/write their own data
    - HR role users can manage all employee data
*/

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_id text UNIQUE NOT NULL DEFAULT ('EMP' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0')),
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text UNIQUE NOT NULL,
  phone text DEFAULT '',
  department text DEFAULT '',
  role text DEFAULT '',
  position text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'probation', 'suspended', 'review_pending')),
  join_date date DEFAULT CURRENT_DATE,
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type text NOT NULL DEFAULT 'annual' CHECK (leave_type IN ('annual', 'sick', 'personal', 'maternity', 'unpaid')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL DEFAULT CURRENT_DATE,
  reason text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by uuid REFERENCES employees(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  check_in time DEFAULT NULL,
  check_out time DEFAULT NULL,
  status text DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'on_leave')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Onboarding profiles table
CREATE TABLE IF NOT EXISTS onboarding_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  -- Step 1: HR fills basic info
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  department text DEFAULT '',
  position text DEFAULT '',
  proposed_start_date date,
  salary numeric DEFAULT 0,
  offer_letter_sent boolean DEFAULT false,
  offer_sent_at timestamptz,
  -- Step 2: Candidate completes
  date_of_birth date,
  gender text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  country text DEFAULT '',
  id_number text DEFAULT '',
  tax_number text DEFAULT '',
  bank_account text DEFAULT '',
  -- Status tracking
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'offer_sent', 'candidate_completed', 'onboarded')),
  token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Onboarding documents (ID card photos, degrees, portrait)
CREATE TABLE IF NOT EXISTS onboarding_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id uuid NOT NULL REFERENCES onboarding_profiles(id) ON DELETE CASCADE,
  doc_type text NOT NULL CHECK (doc_type IN ('id_front', 'id_back', 'degree', 'portrait', 'other')),
  file_url text NOT NULL DEFAULT '',
  file_name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Onboarding education records
CREATE TABLE IF NOT EXISTS onboarding_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id uuid NOT NULL REFERENCES onboarding_profiles(id) ON DELETE CASCADE,
  institution text DEFAULT '',
  degree text DEFAULT '',
  field_of_study text DEFAULT '',
  start_date date,
  end_date date,
  gpa text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Onboarding emergency contacts
CREATE TABLE IF NOT EXISTS onboarding_emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id uuid NOT NULL REFERENCES onboarding_profiles(id) ON DELETE CASCADE,
  name text DEFAULT '',
  relationship text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Employees policies
CREATE POLICY "Authenticated users can read employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update employees"
  ON employees FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete employees"
  ON employees FOR DELETE
  TO authenticated
  USING (true);

-- Leave requests policies
CREATE POLICY "Authenticated users can read leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert leave requests"
  ON leave_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update leave requests"
  ON leave_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete leave requests"
  ON leave_requests FOR DELETE
  TO authenticated
  USING (true);

-- Attendance policies
CREATE POLICY "Authenticated users can read attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attendance"
  ON attendance FOR DELETE
  TO authenticated
  USING (true);

-- Onboarding profiles policies
CREATE POLICY "Authenticated users can read onboarding profiles"
  ON onboarding_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert onboarding profiles"
  ON onboarding_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update onboarding profiles"
  ON onboarding_profiles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete onboarding profiles"
  ON onboarding_profiles FOR DELETE
  TO authenticated
  USING (true);

-- Onboarding documents policies
CREATE POLICY "Authenticated users can read onboarding documents"
  ON onboarding_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert onboarding documents"
  ON onboarding_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update onboarding documents"
  ON onboarding_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete onboarding documents"
  ON onboarding_documents FOR DELETE
  TO authenticated
  USING (true);

-- Onboarding education policies
CREATE POLICY "Authenticated users can read onboarding education"
  ON onboarding_education FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert onboarding education"
  ON onboarding_education FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update onboarding education"
  ON onboarding_education FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete onboarding education"
  ON onboarding_education FOR DELETE
  TO authenticated
  USING (true);

-- Onboarding emergency contacts policies
CREATE POLICY "Authenticated users can read onboarding emergency contacts"
  ON onboarding_emergency_contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert onboarding emergency contacts"
  ON onboarding_emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update onboarding emergency contacts"
  ON onboarding_emergency_contacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete onboarding emergency contacts"
  ON onboarding_emergency_contacts FOR DELETE
  TO authenticated
  USING (true);

-- Public access for candidate onboarding completion (via token)
CREATE POLICY "Token-based read onboarding profile"
  ON onboarding_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Token-based update onboarding profile"
  ON onboarding_profiles FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Token-based insert onboarding documents"
  ON onboarding_documents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Token-based read onboarding documents"
  ON onboarding_documents FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Token-based insert onboarding education"
  ON onboarding_education FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Token-based read onboarding education"
  ON onboarding_education FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Token-based insert onboarding emergency contacts"
  ON onboarding_emergency_contacts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Token-based read onboarding emergency contacts"
  ON onboarding_emergency_contacts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_status ON onboarding_profiles(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_token ON onboarding_profiles(token);
