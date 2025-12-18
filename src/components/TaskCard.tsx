import { useState } from 'react';
import { Task, Project, Profile } from '../lib/supabase';
import { MoreVertical, Trash2, User, AlertCircle, Clock } from 'lucide-react';
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
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700', icon: Clock },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  high: { label: 'High', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

export function TaskCard({ task, project, onStatusChange, onDelete, onUpdate, isOwner }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const PriorityIcon = priorityConfig.icon;

  const statuses: { value: Task['status']; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  return (
    <>
      <div
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
        onClick={() => setShowEdit(true)}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="font-medium text-gray-900 flex-1 line-clamp-2">{task.title}</h4>
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
                        if (confirm('Are you sure you want to delete this task?')) {
                          onDelete(task.id);
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
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${priorityConfig.color}`}
            >
              <PriorityIcon className="w-3 h-3" />
              {priorityConfig.label}
            </span>
          </div>

          {task.assigned_profile ? (
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                style={{ backgroundColor: task.assigned_profile.avatar_color }}
                title={task.assigned_profile.full_name}
              >
                {task.assigned_profile.full_name.charAt(0).toUpperCase()}
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
