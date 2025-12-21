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
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Edit Task</h2>
            <p className="text-sm text-gray-500 font-medium">{project.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700 ml-0.5">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-gray-900 font-medium placeholder:text-gray-400 outline-none shadow-sm"
              placeholder="Task title"
              required
            />
          </div>

          {/* Description Input */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700 ml-0.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-gray-900 font-medium placeholder:text-gray-400 resize-none outline-none shadow-sm"
              placeholder="Task description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status Selection */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700 ml-0.5">
                Status
              </label>
              <div className="relative group">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Task['status'])}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-gray-700 font-bold text-sm appearance-none cursor-pointer outline-none shadow-sm"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-400" />
                </div>
              </div>
            </div>

            {/* Priority Selection */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700 ml-0.5">
                Priority
              </label>
              <div className="flex p-1 bg-gray-50 border border-gray-200 rounded-xl">
                {(['low', 'medium', 'high'] as Task['priority'][]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      priority === p
                        ? 'bg-white text-brand-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assignee Selection */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700 ml-0.5">
                Assignee
              </label>
              <div className="relative group">
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-gray-700 font-semibold text-sm appearance-none cursor-pointer outline-none shadow-sm"
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <User className="w-4 h-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                </div>
              </div>
            </div>

            {/* Deadline Selection */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700 ml-0.5">
                Deadline
              </label>
              <div className="relative group">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-gray-700 font-semibold text-sm cursor-pointer outline-none shadow-sm"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Calendar className="w-4 h-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Labels Input */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-gray-700 ml-0.5">
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
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-gray-900 font-semibold text-sm placeholder:text-gray-400 outline-none shadow-sm"
                    placeholder="Add labels..."
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Tag className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddLabel}
                  className="p-3 bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all"
                >
                  <Tag className="w-4 h-4" />
                </button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 px-1">
                  {tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-[10px] font-bold border border-brand-100 uppercase tracking-tight"
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
            <div className="bg-gray-50/50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden shadow-sm border border-white shrink-0"
                style={{ backgroundColor: task.creator_profile.avatar_color }}
              >
                {task.creator_profile.avatar_url ? (
                  <img src={task.creator_profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  task.creator_profile.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Created</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900 truncate">{task.creator_profile.full_name}</p>
                  <span className="text-[10px] text-gray-400 font-medium">• {new Date(task.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
              {error}
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3.5 text-gray-500 font-bold hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] px-6 py-3.5 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 hover:translate-y-[-1px] active:translate-y-[0px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
      </div>
    </div>
  );
}
