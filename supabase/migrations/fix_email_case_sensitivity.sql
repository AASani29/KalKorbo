-- Fix email case sensitivity issues in invitations and profiles
-- Run this in Supabase SQL Editor

-- 1. Update existing profiles and invitations to lowercase emails for consistency
UPDATE profiles SET email = LOWER(email);
UPDATE project_invitations SET invitee_email = LOWER(invitee_email);

-- 2. Update RLS policies for project_invitations to be case-insensitive
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON project_invitations;
CREATE POLICY "Users can view invitations sent to them"
  ON project_invitations FOR SELECT
  TO authenticated
  USING (
    LOWER(invitee_email) = LOWER(auth.email()) OR
    invitee_id = auth.uid() OR
    inviter_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_invitations.project_id
      AND projects.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Invitees can update their invitations" ON project_invitations;
CREATE POLICY "Invitees can update their invitations"
  ON project_invitations FOR UPDATE
  TO authenticated
  USING (
    LOWER(invitee_email) = LOWER(auth.email()) OR
    invitee_id = auth.uid()
  )
  WITH CHECK (
    LOWER(invitee_email) = LOWER(auth.email()) OR
    invitee_id = auth.uid()
  );

-- 3. Update functions to be case-insensitive
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
  AND (LOWER(invitee_email) = LOWER(auth.email()) OR invitee_id = auth.uid())
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

CREATE OR REPLACE FUNCTION reject_project_invitation(invitation_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE project_invitations
  SET status = 'rejected',
      invitee_id = auth.uid(),
      updated_at = now()
  WHERE id = invitation_id
  AND (LOWER(invitee_email) = LOWER(auth.email()) OR invitee_id = auth.uid())
  AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update the trigger function to be case-insensitive
CREATE OR REPLACE FUNCTION match_invitation_to_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE project_invitations
  SET invitee_id = NEW.id
  WHERE LOWER(invitee_email) = LOWER(NEW.email)
  AND invitee_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Email case sensitivity fixes applied!' as status;
