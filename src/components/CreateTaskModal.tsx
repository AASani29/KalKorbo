import { useState, useEffect } from 'react';
import { X, Loader2, User } from 'lucide-react';
import { supabase, Project, Task, Profile } from '../lib/supabase';
import { useAuth } from '../lib/auth';

type CreateTaskModalProps = {
  project: Project;
  initialStatus: Task['status'];
  onClose: () => void;
  onTaskCreated: () => void;
};

export function CreateTaskModal({ project, initialStatus, onClose, onTaskCreated }: CreateTaskModalProps) {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMembers();
  }, [project.id]);

  const loadMembers = async () => {
    const { data } = await supabase
      .from('project_members')
      .select('user_id')
      .eq('project_id', project.id);

    if (data) {
      const userIds = data.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profiles) {
        setMembers(profiles);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: taskError } = await supabase.from('tasks').insert({
        project_id: project.id,
        title,
        description,
        status: initialStatus,
        priority,
        assigned_to: assignedTo || null,
        created_by: profile?.id,
      });

      if (taskError) throw taskError;

      onTaskCreated();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create task');
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Task</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Fix login bug"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Add more details about the task..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as Task['priority'][]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                    priority === p
                      ? p === 'low'
                        ? 'bg-gray-200 text-gray-800'
                        : p === 'medium'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
