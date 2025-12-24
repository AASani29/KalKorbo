import { useState, useEffect } from 'react';
import { supabase, Project, Task, Profile, ProjectMember } from '../lib/supabase';
import { Plus, Check, Search, X, Users, Tag, ChevronDown } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';
import { EditTaskModal } from './EditTaskModal';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';

type TaskBoardProps = {
  project: Project;
  initialTaskId?: string | null;
};

type TaskWithProfile = Task & {
  assigned_profile?: Profile | null;
  creator_profile?: Profile;
};

type MemberWithProfile = ProjectMember & {
  profile: Profile;
};

export function TaskBoard({ project, initialTaskId = null }: TaskBoardProps) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<TaskWithProfile[]>([]);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [filterUserId, setFilterUserId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithProfile | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Task['status']>('todo');
  const [loading, setLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Task['status'] | null>(null);

  useEffect(() => {
    loadTasks();
    loadMembers();

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

  useEffect(() => {
    if (initialTaskId && tasks.length > 0) {
      const task = tasks.find(t => t.id === initialTaskId);
      if (task) {
        setTaskToEdit(task);
      }
    }
  }, [initialTaskId, tasks]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey(*),
          creator_profile:profiles!tasks_created_by_fkey(*)
        `)
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setTasks(data as TaskWithProfile[]);
      }
    } catch (error: any) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('project_id', project.id);

      if (error) throw error;
      if (data) {
        setMembers(data as MemberWithProfile[]);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
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
    console.log('!!! TaskBoard: DELETE FUNCTION CALLED !!!', taskId);
    try {
      console.log('>>> TaskBoard: Calling supabase.delete() for:', taskId);
      const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .select();

      if (error) {
        console.error('>>> TaskBoard: Supabase error:', error);
        throw error;
      }

      console.log('>>> TaskBoard: Supabase response data:', data);

      if (!data || data.length === 0) {
        console.warn('>>> TaskBoard: No rows deleted. Check RLS policies.');
        throw new Error('Task not found or you don\'t have permission to delete it.');
      }

      console.log('>>> TaskBoard: Task deleted successfully');
      showToast('success', 'Task deleted successfully');
      await loadTasks();
    } catch (error: any) {
      console.error('>>> TaskBoard: Error in handleDeleteTask:', error);
      showToast('error', error.message || 'Failed to delete task');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    if (draggedTaskId) {
      await handleStatusChange(draggedTaskId, newStatus);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags || []))).sort();

  const columns: { status: Task['status']; label: string; color: string }[] = [
    { status: 'todo', label: 'To Do', color: 'bg-slate-50/30 border-gray-200' },
    { status: 'in_progress', label: 'In Progress', color: 'bg-slate-50/30 border-gray-200' },
    { status: 'done', label: 'Done', color: 'bg-slate-50/30 border-gray-200' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-4 bg-white/40 backdrop-blur-xl p-3 rounded-3xl border border-white/50 shadow-xl shadow-brand-500/5">
        {/* Search Input Group */}
        <div className="relative flex-1 w-full group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-brand-50 rounded-xl group-focus-within:bg-brand-500 group-focus-within:text-white transition-all duration-300">
            <Search className="w-4 h-4 text-brand-500 group-focus-within:text-white" />
          </div>
          <input
            type="text"
            placeholder="Search tasks, descriptions, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-12 py-3.5 bg-white/60 border border-transparent rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white focus:border-brand-500/20 transition-all duration-300 placeholder:text-gray-400 shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Section */}
        <div className="flex items-center gap-4 bg-white/60 p-1.5 rounded-2xl border border-white/80 shadow-sm w-full lg:w-auto overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 px-3 border-r border-gray-100">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team</span>
          </div>

          <div className="flex items-center gap-2 pr-1">
            {/* All Tasks Toggle */}
            <button
              onClick={() => setFilterUserId(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                filterUserId === null 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 ring-4 ring-brand-500/10 scale-105' 
                  : 'text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm'
              }`}
            >
              Everyone
            </button>

            <div className="w-px h-6 bg-gray-100 mx-1 opacity-50" />

            {/* Overlapping Avatars */}
            <div className="flex -space-x-3 hover:space-x-1 transition-all duration-500 items-center px-2">
              {members.map((member) => (
                <button
                  key={member.user_id}
                  onClick={() => setFilterUserId(filterUserId === member.user_id ? null : member.user_id)}
                  className={`relative group/filter w-10 h-10 rounded-full border-2 transition-all duration-300 hover:z-50 hover:-translate-y-1 ${
                    filterUserId === member.user_id 
                      ? 'border-brand-500 ring-4 ring-brand-500/20 z-40 scale-110 shadow-lg' 
                      : 'border-white z-0'
                  }`}
                >
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center text-[11px] text-white overflow-hidden shadow-inner"
                    style={{ backgroundColor: member.profile.avatar_color }}
                  >
                    {member.profile.avatar_url ? (
                      <img src={member.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      member.profile.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  {/* Premium Popover-style Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-2 bg-gray-900/90 backdrop-blur-md text-white text-[10px] font-bold rounded-xl opacity-0 scale-50 pointer-events-none group-hover/filter:opacity-100 group-hover/filter:scale-100 transition-all duration-300 z-[100] shadow-2xl border border-white/10 min-w-[100px] text-center">
                    <p className="truncate">{member.user_id === profile?.id ? 'Me (Assigned)' : member.profile.full_name}</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45 -translate-y-1" />
                  </div>

                  {/* Active Indicator Dot */}
                  {filterUserId === member.user_id && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg animate-bounce-in">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tag Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowTagMenu(!showTagMenu)}
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 border ${
              selectedTag 
                ? 'bg-brand-50 border-brand-200 text-brand-700 ring-4 ring-brand-500/5' 
                : 'bg-white/60 border-transparent text-gray-600 hover:bg-white hover:shadow-sm'
            }`}
          >
            <Tag className={`w-4 h-4 ${selectedTag ? 'text-brand-500' : 'text-gray-400'}`} />
            <span>{selectedTag || 'All Labels'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showTagMenu ? 'rotate-180' : ''}`} />
          </button>

          {showTagMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowTagMenu(false)}
              />
              <div className="absolute top-full right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl z-50 p-2 animate-scale-in origin-top-right">
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Filter by Tag
                </div>
                
                <button
                  onClick={() => {
                    setSelectedTag(null);
                    setShowTagMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedTag === null ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 opacity-50" />
                    All Labels
                  </div>
                  {selectedTag === null && <Check className="w-4 h-4" />}
                </button>

                <div className="my-2 border-t border-gray-50" />

                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                  {allTags.length > 0 ? (
                    allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTag(tag);
                          setShowTagMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          selectedTag === tag ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-brand-400 shadow-sm" />
                          {tag}
                        </div>
                        {selectedTag === tag && <Check className="w-4 h-4" />}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-8 text-center">
                      <Tag className="w-8 h-8 text-gray-100 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">No tags found in this project</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => {
            const matchesStatus = task.status === column.status;
            const matchesUser = filterUserId === null || task.assigned_to === filterUserId;
            const matchesTag = selectedTag === null || task.tags?.includes(selectedTag);
            const matchesSearch = !searchQuery || 
              task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              task.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesStatus && matchesUser && matchesTag && matchesSearch;
          });
          const isDropTarget = dragOverColumn === column.status;

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

              <div
                className={`flex-1 rounded-xl border-2 border-dashed ${column.color} p-4 space-y-3 min-h-[200px] transition-all ${
                  isDropTarget ? 'ring-2 ring-blue-400 ring-offset-2 bg-blue-50/50 scale-[1.02]' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, column.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                {loading ? (
                  <div className="text-center text-gray-500 py-8">Loading...</div>
                ) : columnTasks.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    {isDropTarget ? '📥 Drop here' : 'No tasks yet'}
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                      className={`transition-all ${
                        draggedTaskId === task.id ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      <TaskCard
                        task={task}
                        project={project}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteTask}
                        onUpdate={loadTasks}
                        isOwner={project.owner_id === profile?.id || task.created_by === profile?.id}
                      />
                    </div>
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

      {taskToEdit && (
        <EditTaskModal
          task={taskToEdit}
          project={project}
          onClose={() => setTaskToEdit(null)}
          onUpdate={loadTasks}
        />
      )}
    </div>
  );
}
