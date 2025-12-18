-- Add new features to the issue tracker
-- Run this in Supabase SQL Editor

-- Add due_date and tags to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS due_date timestamptz,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Create comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_comments
CREATE POLICY "Project members can view comments"
  ON task_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_members pm ON pm.project_id = t.project_id
      WHERE t.id = task_comments.task_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can create comments"
  ON task_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_members pm ON pm.project_id = t.project_id
      WHERE t.id = task_comments.task_id
      AND pm.user_id = auth.uid()
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can update own comments"
  ON task_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON task_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for activity_log
CREATE POLICY "Project members can view activity"
  ON activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = activity_log.project_id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create activity"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user ON task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_project ON activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Function to automatically log activity
CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (project_id, user_id, action, entity_type, entity_id, metadata)
    VALUES (
      NEW.project_id,
      NEW.created_by,
      'created',
      'task',
      NEW.id,
      jsonb_build_object('title', NEW.title, 'status', NEW.status)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO activity_log (project_id, user_id, action, entity_type, entity_id, metadata)
      VALUES (
        NEW.project_id,
        auth.uid(),
        'status_changed',
        'task',
        NEW.id,
        jsonb_build_object('title', NEW.title, 'from', OLD.status, 'to', NEW.status)
      );
    END IF;
    
    IF NEW.status = 'done' AND OLD.status != 'done' THEN
      UPDATE tasks SET completed_at = now() WHERE id = NEW.id;
    ELSIF NEW.status != 'done' AND OLD.status = 'done' THEN
      UPDATE tasks SET completed_at = NULL WHERE id = NEW.id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_log (project_id, user_id, action, entity_type, entity_id, metadata)
    VALUES (
      OLD.project_id,
      auth.uid(),
      'deleted',
      'task',
      OLD.id,
      jsonb_build_object('title', OLD.title)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for task activity logging
DROP TRIGGER IF EXISTS task_activity_trigger ON tasks;
CREATE TRIGGER task_activity_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_activity();

-- Verification
SELECT 'New features added successfully!' as status;
