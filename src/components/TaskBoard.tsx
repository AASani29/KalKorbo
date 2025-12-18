import { useState, useEffect } from 'react';
import { supabase, Project, Task, Profile } from '../lib/supabase';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';
import { useAuth } from '../lib/auth';

type TaskBoardProps = {
  project: Project;
};

type TaskWithProfile = Task & {
  assigned_profile?: Profile | null;
  creator_profile?: Profile;
};

export function TaskBoard({ project }: TaskBoardProps) {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<TaskWithProfile[]>([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Task['status']>('todo');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();

    const channel = supabase
      .channel('tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${project.id}`,
        },
        () => {
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project.id]);

  const loadTasks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });

    if (data) {
      const tasksWithProfiles = await Promise.all(
        data.map(async (task) => {
          const taskWithProfile: TaskWithProfile = { ...task };

          if (task.assigned_to) {
            const { data: assignedProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', task.assigned_to)
              .maybeSingle();
            taskWithProfile.assigned_profile = assignedProfile;
          }

          const { data: creatorProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', task.created_by)
            .maybeSingle();
          if (creatorProfile) {
            taskWithProfile.creator_profile = creatorProfile;
          }

          return taskWithProfile;
        })
      );

      setTasks(tasksWithProfiles);
    }
    setLoading(false);
  };

  const handleTaskCreated = () => {
    loadTasks();
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', taskId);

    loadTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId);
    loadTasks();
  };

  const columns: { status: Task['status']; label: string; color: string }[] = [
    { status: 'todo', label: 'To Do', color: 'bg-gray-100 border-gray-300' },
    { status: 'in_progress', label: 'In Progress', color: 'bg-blue-50 border-blue-300' },
    { status: 'done', label: 'Done', color: 'bg-green-50 border-green-300' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status);

          return (
            <div key={column.status} className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{column.label}</h3>
                  <span className="bg-gray-200 text-gray-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedStatus(column.status);
                    setShowCreateTask(true);
                  }}
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Add Task"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className={`flex-1 rounded-xl border-2 border-dashed ${column.color} p-4 space-y-3 min-h-[200px]`}>
                {loading ? (
                  <div className="text-center text-gray-500 py-8">Loading...</div>
                ) : columnTasks.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No tasks yet</div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      project={project}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteTask}
                      onUpdate={loadTasks}
                      isOwner={project.owner_id === profile?.id}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showCreateTask && (
        <CreateTaskModal
          project={project}
          initialStatus={selectedStatus}
          onClose={() => setShowCreateTask(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
