-- Update task delete policy to allow task creators to delete their own tasks
DROP POLICY IF EXISTS "Project owners can delete tasks" ON tasks;

CREATE POLICY "Project owners and creators can delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND projects.owner_id = auth.uid()
    )
    OR created_by = auth.uid()
  );
