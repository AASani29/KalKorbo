import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_color: string;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  color: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ProjectMember = {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  joined_at: string;
};
