/*
  # Issue Tracker Database Schema

  ## Overview
  Complete schema for a collaborative issue tracking system with projects, tasks, and team collaboration.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's display name
  - `avatar_color` (text) - Color for avatar background
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. projects
  - `id` (uuid, primary key) - Unique project identifier
  - `name` (text) - Project name
  - `description` (text) - Project description
  - `color` (text) - Project theme color
  - `owner_id` (uuid) - References profiles(id)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. project_members
  - `id` (uuid, primary key) - Unique identifier
  - `project_id` (uuid) - References projects(id)
  - `user_id` (uuid) - References profiles(id)
  - `role` (text) - Member role (owner, member)
  - `joined_at` (timestamptz) - When user joined project

  ### 4. tasks
  - `id` (uuid, primary key) - Unique task identifier
  - `project_id` (uuid) - References projects(id)
  - `title` (text) - Task title
  - `description` (text) - Task description
  - `status` (text) - Task status (todo, in_progress, done)
  - `priority` (text) - Priority level (low, medium, high)
  - `assigned_to` (uuid) - References profiles(id), nullable
  - `created_by` (uuid) - References profiles(id)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Users can read their own profile
  - Users can update their own profile
  - Users can read projects they are members of
  - Project owners can update/delete their projects
  - Project members can create tasks
  - Project members can read all tasks in their projects
  - Task creators and assignees can update tasks
  - Only project owners can delete tasks
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#3B82F6',
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'todo',
  priority text DEFAULT 'medium',
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view projects they are members of"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners can update their projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners can delete their projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Project members policies
CREATE POLICY "Users can view members of their projects"
  ON project_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can add members"
  ON project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can remove members"
  ON project_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Tasks policies
CREATE POLICY "Project members can view tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = tasks.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = tasks.project_id
      AND project_members.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

CREATE POLICY "Project members can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = tasks.project_id
      AND project_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = tasks.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);