import { useState, useEffect } from 'react';
import { X, Loader2, User, Tag, Calendar } from 'lucide-react';
import { supabase, Project, Task, Profile } from '../lib/supabase';

type TaskWithProfile = Task & {
  assigned_profile?: Profile | null;
  creator_profile?: Profile;
};

type EditTaskModalProps = {
  task: TaskWithProfile;
  project: Project;
  onClose: () => void;
  onUpdate: () => void;
};

export function EditTaskModal({ task, project, onClose, onUpdate }: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<Task['priority']>(task.priority);
  const [status, setStatus] = useState<Task['status']>(task.status);
  const [assignedTo, setAssignedTo] = useState<string>(task.assigned_to || '');
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [labelInput, setLabelInput] = useState('');
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split('T')[0] : '');
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

  const handleAddLabel = () => {
    if (labelInput.trim() && !tags.includes(labelInput.trim())) {
      setTags([...tags, labelInput.trim()]);
      setLabelInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          title,
          description,
          priority,
          status,
          assigned_to: assignedTo || null,
          tags: tags,
          due_date: dueDate || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id);

      if (taskError) throw taskError;

      onUpdate();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update task');
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300 scrollbar-hide">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30 sticky top-0 z-10 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Task</h2>
            <p className="text-xs text-gray-500 mt-0.5">{project.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all text-gray-900 font-medium placeholder:text-gray-400"
              placeholder="Task title"
              required
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all text-gray-900 font-medium placeholder:text-gray-400 resize-none"
              placeholder="Task description"
              rows={4}
            />
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Status
            </label>
            <div className="relative group">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Task['status'])}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all text-gray-700 font-bold text-sm appearance-none cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-gray-200 pl-2">
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-400" />
              </div>
            </div>
          </div>

          {/* Priority & Assignee Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Priority
              </label>
              <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                {(['low', 'medium', 'high'] as Task['priority'][]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                      priority === p
                        ? p === 'low'
                          ? 'bg-white text-gray-600 shadow-sm'
                          : p === 'medium'
                          ? 'bg-white text-brand-600 shadow-sm'
                          : 'bg-white text-red-600 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Assign To
              </label>
              <div className="relative group">
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all text-gray-700 font-bold text-sm appearance-none cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <User className="w-4 h-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-gray-200 pl-2">
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Deadline Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Deadline
            </label>
            <div className="relative group">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all text-gray-700 font-bold text-sm cursor-pointer"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Calendar className="w-4 h-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
              </div>
            </div>
          </div>

          {/* Labels Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Labels
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLabel();
                      }
                    }}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all text-gray-900 font-medium placeholder:text-gray-400"
                    placeholder="Type a label..."
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Tag className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddLabel}
                  className="px-6 bg-brand-50 text-brand-600 font-bold rounded-2xl hover:bg-brand-100 transition-colors border border-brand-100"
                >
                  Add
                </button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 px-1">
                  {tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-100 animate-in zoom-in duration-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((_, index) => index !== i))}
                        className="hover:text-brand-900 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {task.creator_profile && (
            <div className="bg-gray-50/50 rounded-[2rem] p-6 flex items-center gap-4 border border-gray-100">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold overflow-hidden shadow-sm border-2 border-white"
                style={{ backgroundColor: task.creator_profile.avatar_color }}
              >
                {task.creator_profile.avatar_url ? (
                  <img src={task.creator_profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  task.creator_profile.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Created by</p>
                <p className="text-sm font-bold text-gray-900">{task.creator_profile.full_name}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {new Date(task.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 text-gray-500 font-bold hover:text-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-xl shadow-brand-100 hover:bg-brand-700 hover:shadow-brand-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
