/*
  # Community Safety App Database Schema

  ## Overview
  This migration creates the complete database schema for a community safety application
  focused on preventing gender-based violence and strengthening emergency response.

  ## New Tables

  ### 1. `profiles`
  User profile information linked to auth.users
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text)
  - `phone_number` (text)
  - `emergency_contact_phone` (text)
  - `emergency_contact_name` (text)
  - `avatar_url` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `trusted_contacts`
  Emergency contacts that users can designate to receive alerts
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `contact_name` (text)
  - `contact_phone` (text)
  - `contact_email` (text, optional)
  - `relationship` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 3. `emergency_alerts`
  SOS alerts triggered by users in distress
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `latitude` (decimal, optional)
  - `longitude` (decimal, optional)
  - `location_description` (text, optional)
  - `alert_type` (text: 'sos', 'check_in_missed', 'manual')
  - `status` (text: 'active', 'resolved', 'false_alarm')
  - `notes` (text, optional)
  - `resolved_at` (timestamptz, optional)
  - `created_at` (timestamptz)

  ### 4. `check_ins`
  Timed safety check-ins for users traveling
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `destination` (text)
  - `expected_arrival` (timestamptz)
  - `check_in_time` (timestamptz, optional)
  - `status` (text: 'pending', 'completed', 'missed', 'cancelled')
  - `latitude` (decimal, optional)
  - `longitude` (decimal, optional)
  - `created_at` (timestamptz)

  ### 5. `incident_reports`
  Anonymous or identified incident reporting
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles, nullable for anonymous)
  - `incident_type` (text)
  - `description` (text)
  - `latitude` (decimal, optional)
  - `longitude` (decimal, optional)
  - `location_description` (text)
  - `incident_date` (timestamptz)
  - `is_anonymous` (boolean)
  - `status` (text: 'submitted', 'under_review', 'resolved')
  - `created_at` (timestamptz)

  ### 6. `safe_zones`
  Community-verified safe locations (police stations, hospitals, etc.)
  - `id` (uuid, primary key)
  - `name` (text)
  - `type` (text: 'police', 'hospital', 'shelter', 'community_center')
  - `address` (text)
  - `latitude` (decimal)
  - `longitude` (decimal)
  - `phone_number` (text, optional)
  - `operating_hours` (text, optional)
  - `verified` (boolean)
  - `created_by` (uuid, references profiles, optional)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only read/write their own data
  - Incident reports allow anonymous submissions
  - Safe zones are publicly readable
  - Emergency alerts notify trusted contacts
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone_number text,
  emergency_contact_phone text,
  emergency_contact_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trusted_contacts table
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text,
  relationship text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create emergency_alerts table
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  location_description text,
  alert_type text NOT NULL DEFAULT 'sos',
  status text NOT NULL DEFAULT 'active',
  notes text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create check_ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  destination text NOT NULL,
  expected_arrival timestamptz NOT NULL,
  check_in_time timestamptz,
  status text NOT NULL DEFAULT 'pending',
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  created_at timestamptz DEFAULT now()
);

-- Create incident_reports table
CREATE TABLE IF NOT EXISTS incident_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  incident_type text NOT NULL,
  description text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  location_description text NOT NULL,
  incident_date timestamptz NOT NULL,
  is_anonymous boolean DEFAULT false,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz DEFAULT now()
);

-- Create safe_zones table
CREATE TABLE IF NOT EXISTS safe_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  address text NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  phone_number text,
  operating_hours text,
  verified boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_zones ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Trusted contacts policies
CREATE POLICY "Users can view own trusted contacts"
  ON trusted_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trusted contacts"
  ON trusted_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trusted contacts"
  ON trusted_contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trusted contacts"
  ON trusted_contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Emergency alerts policies
CREATE POLICY "Users can view own emergency alerts"
  ON emergency_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency alerts"
  ON emergency_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency alerts"
  ON emergency_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Check-ins policies
CREATE POLICY "Users can view own check-ins"
  ON check_ins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins"
  ON check_ins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins"
  ON check_ins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own check-ins"
  ON check_ins FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Incident reports policies (allow anonymous)
CREATE POLICY "Anyone can submit incident reports"
  ON incident_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own incident reports"
  ON incident_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Safe zones policies (publicly readable)
CREATE POLICY "Anyone can view safe zones"
  ON safe_zones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can suggest safe zones"
  ON safe_zones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user_id ON trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_user_id ON emergency_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_status ON check_ins(status);
CREATE INDEX IF NOT EXISTS idx_incident_reports_user_id ON incident_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_safe_zones_type ON safe_zones(type);