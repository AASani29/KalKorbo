import { useState } from 'react';
import { Task, Project, Profile } from '../lib/supabase';
import { MoreVertical, Trash2, User, Flag, Tag, Clock, Calendar } from 'lucide-react';
import { EditTaskModal } from './EditTaskModal';

type TaskWithProfile = Task & {
  assigned_profile?: Profile | null;
  creator_profile?: Profile;
};

type TaskCardProps = {
  task: TaskWithProfile;
  project: Project;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onDelete: (taskId: string) => void;
  onUpdate: () => void;
  isOwner: boolean;
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-red-100 text-red-700' },
};

const STATUS_COLORS = {
  todo: 'bg-gray-50 border-gray-200',
  in_progress: 'bg-blue-50 border-blue-200',
  done: 'bg-green-50 border-green-200',
};


export function TaskCard({ task, project, onStatusChange, onDelete, onUpdate, isOwner }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const priorityConfig = PRIORITY_CONFIG[task.priority];

  const statuses: { value: Task['status']; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  return (
    <>
      <div
        className={`${STATUS_COLORS[task.status]} rounded-xl p-4 shadow-sm border hover:shadow-md transition-all cursor-grab active:cursor-grabbing group`}
        onClick={() => setShowEdit(true)}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                  Move to
                </div>
                {statuses
                  .filter((s) => s.value !== task.status)
                  .map((status) => (
                    <button
                      key={status.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(task.id, status.value);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      {status.label}
                    </button>
                  ))}
                {isOwner && (
                  <>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('>>> TaskCard: Delete button clicked for task:', task.id);
                        if (window.confirm('Are you sure you want to delete this task?')) {
                          console.log('>>> TaskCard: User confirmed deletion, calling onDelete...');
                          try {
                            onDelete(task.id);
                          } catch (err) {
                            console.error('>>> TaskCard: Error calling onDelete:', err);
                          }
                        }
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mb-4 leading-relaxed whitespace-pre-wrap">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Priority */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-sm ${
              task.priority === 'high' 
                ? 'bg-rose-50 text-rose-600 border-rose-100' 
                : task.priority === 'medium'
                ? 'bg-amber-50 text-amber-600 border-amber-100'
                : 'bg-gray-50 text-gray-600 border-gray-100'
            }`}
          >
            <Flag className="w-3 h-3" />
            {priorityConfig.label}
          </span>

          {/* Labels */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, i) => {
                const colors = [
                  { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
                  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
                  { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
                  { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
                  { bg: 'bg-accent-cyan/10', text: 'text-accent-cyan', border: 'border-accent-cyan/20' },
                  { bg: 'bg-accent-purple/10', text: 'text-accent-purple', border: 'border-accent-purple/20' },
                ];
                const colorIndex = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
                const color = colors[colorIndex];

                return (
                  <span 
                    key={i}
                    className={`inline-flex items-center gap-1 px-2 py-1 ${color.bg} ${color.text} rounded-lg text-[10px] font-bold border ${color.border} shadow-sm`}
                  >
                    <Tag className="w-2.5 h-2.5 opacity-70" />
                    {tag}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50">
          <div className="flex flex-wrap items-center gap-4 text-gray-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {task.due_date && (
              <div className={`flex items-center gap-1.5 ${
                new Date(task.due_date) < new Date() && task.status !== 'done'
                  ? 'text-rose-500'
                  : 'text-gray-400'
              }`}>
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          {task.assigned_profile ? (
            <div className="flex items-center gap-2 relative group/avatar">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold overflow-hidden shadow-sm border border-white relative z-10"
                style={{ backgroundColor: task.assigned_profile.avatar_color }}
              >
                {task.assigned_profile.avatar_url ? (
                  <img src={task.assigned_profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  task.assigned_profile.full_name.charAt(0).toUpperCase()
                )}
              </div>
              
              {/* Custom Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg opacity-0 translate-y-2 group-hover/avatar:opacity-100 group-hover/avatar:translate-y-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-xl border border-white/10">
                {task.assigned_profile.full_name}
                <div className="absolute top-full right-3 w-2 h-2 bg-gray-900/90 rotate-45 -translate-y-1" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <User className="w-4 h-4" />
              <span>Unassigned</span>
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <EditTaskModal
          task={task}
          project={project}
          onClose={() => setShowEdit(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
