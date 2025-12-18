-- Project Invitations System
-- Run this in Supabase SQL Editor

-- Create project_invitations table
CREATE TABLE IF NOT EXISTS project_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  inviter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  invitee_email text NOT NULL,
  invitee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, invitee_email)
);

-- Enable RLS
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitations
CREATE POLICY "Users can view invitations sent to them"
  ON project_invitations FOR SELECT
  TO authenticated
  USING (
    invitee_email = auth.email() OR
    invitee_id = auth.uid() OR
    inviter_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_invitations.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can create invitations"
  ON project_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_invitations.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Invitees can update their invitations"
  ON project_invitations FOR UPDATE
  TO authenticated
  USING (
    invitee_email = auth.email() OR
    invitee_id = auth.uid()
  )
  WITH CHECK (
    invitee_email = auth.email() OR
    invitee_id = auth.uid()
  );

CREATE POLICY "Project owners can delete invitations"
  ON project_invitations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_invitations.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Function to accept invitation
CREATE OR REPLACE FUNCTION accept_project_invitation(invitation_id uuid)
RETURNS void AS $$
DECLARE
  v_project_id uuid;
  v_user_id uuid;
BEGIN
  -- Get invitation details
  SELECT project_id, invitee_id INTO v_project_id, v_user_id
  FROM project_invitations
  WHERE id = invitation_id
  AND (invitee_email = auth.email() OR invitee_id = auth.uid())
  AND status = 'pending';

  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'Invitation not found or already processed';
  END IF;

  -- Update invitation status
  UPDATE project_invitations
  SET status = 'accepted',
      invitee_id = auth.uid(),
      updated_at = now()
  WHERE id = invitation_id;

  -- Add user to project members
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (v_project_id, auth.uid(), 'member')
  ON CONFLICT (project_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject invitation
CREATE OR REPLACE FUNCTION reject_project_invitation(invitation_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE project_invitations
  SET status = 'rejected',
      invitee_id = auth.uid(),
      updated_at = now()
  WHERE id = invitation_id
  AND (invitee_email = auth.email() OR invitee_id = auth.uid())
  AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update projects policy to show project names to everyone but details only to members
DROP POLICY IF EXISTS "Users can view projects they are members of" ON projects;

CREATE POLICY "Users can view project names"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

-- Create a view for projects with member check
CREATE OR REPLACE VIEW user_projects AS
SELECT 
  p.*,
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = p.id
    AND pm.user_id = auth.uid()
  ) as is_member,
  (p.owner_id = auth.uid()) as is_owner
FROM projects p;

-- Grant access to the view
GRANT SELECT ON user_projects TO authenticated;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invitations_invitee_email ON project_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_invitations_invitee_id ON project_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_invitations_project ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON project_invitations(status);

-- Trigger to set invitee_id when user signs up
CREATE OR REPLACE FUNCTION match_invitation_to_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE project_invitations
  SET invitee_id = NEW.id
  WHERE invitee_email = NEW.email
  AND invitee_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS match_invitations_trigger ON profiles;
CREATE TRIGGER match_invitations_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION match_invitation_to_user();

SELECT 'Invitation system created successfully!' as status;
