import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  phone_number?: string;
  emergency_contact_phone?: string;
  emergency_contact_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type TrustedContact = {
  id: string;
  user_id: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  relationship?: string;
  is_active: boolean;
  created_at: string;
};

export type EmergencyAlert = {
  id: string;
  user_id: string;
  latitude?: number;
  longitude?: number;
  location_description?: string;
  alert_type: 'sos' | 'check_in_missed' | 'manual';
  status: 'active' | 'resolved' | 'false_alarm';
  notes?: string;
  resolved_at?: string;
  created_at: string;
};

export type CheckIn = {
  id: string;
  user_id: string;
  destination: string;
  expected_arrival: string;
  check_in_time?: string;
  status: 'pending' | 'completed' | 'missed' | 'cancelled';
  latitude?: number;
  longitude?: number;
  created_at: string;
};

export type IncidentReport = {
  id: string;
  user_id?: string;
  incident_type: string;
  description: string;
  latitude?: number;
  longitude?: number;
  location_description: string;
  incident_date: string;
  is_anonymous: boolean;
  status: 'submitted' | 'under_review' | 'resolved';
  created_at: string;
};

export type SafeZone = {
  id: string;
  name: string;
  type: 'police' | 'hospital' | 'shelter' | 'community_center';
  address: string;
  latitude: number;
  longitude: number;
  phone_number?: string;
  operating_hours?: string;
  verified: boolean;
  created_by?: string;
  created_at: string;
};
