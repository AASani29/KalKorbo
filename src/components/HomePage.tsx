import { useState, useEffect } from 'react';
import { 
  CheckCircle2,
  Clock,
  AlertCircle, 
  Calendar,
  Frown,
  Quote,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export function HomePage({ 
  onStartProject,
  onTaskClick,
}: { 
  onStartProject: () => void;
  onTaskClick: (projectId: string, taskId: string) => void;
}) {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    highPriority: 0
  });
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to.eq.${profile?.id},created_by.eq.${profile?.id}`);

      setTasks(allTasks || []);

      if (allTasks) {
        setStats({
          totalTasks: allTasks.length,
          completedTasks: allTasks.filter(t => t.status === 'done').length,
          pendingTasks: allTasks.filter(t => t.status !== 'done').length,
          highPriority: allTasks.filter(t => t.priority === 'high' && t.status !== 'done').length
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const cards = [
    { 
      label: 'Tasks to Do', 
      value: stats.pendingTasks, 
      icon: Clock, 
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Awaiting completion'
    },
    { 
      label: 'Completed', 
      value: stats.completedTasks, 
      icon: CheckCircle2, 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Tasks finished'
    },
    { 
      label: 'High Priority', 
      value: stats.highPriority, 
      icon: AlertCircle, 
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      description: 'Needs urgent attention'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 md:p-10 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-brand-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-accent-purple/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-[1440px] mx-auto space-y-12 relative z-10">
        
        {/* Premium Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-300 to-accent-purple rounded-full opacity-30 group-hover:opacity-100 transition duration-500 blur"></div>
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-white border-2 border-white ring-1 ring-gray-100">
                <img 
                  src={profile?.avatar_url || '/male 1.svg'} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">
                  Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-purple">{profile?.full_name?.split(' ')[0]}</span>
                </h1>
              </div>
              <p className="text-gray-500 font-medium flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-brand-400" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Actions can go here if needed */}
          </div>
        </header>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-8">
          
          {/* Main Column (Calendar) - Takes more space on wider screens */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Your Schedule</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Track your tasks and deadlines</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="w-10 h-10 bg-white hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-gray-900 shadow-sm border border-gray-200 flex items-center justify-center shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="bg-white px-4 md:px-6 py-2.5 rounded-xl shadow-sm border border-gray-200 flex-1 sm:flex-none text-center">
                  <span className="text-sm md:text-base font-bold text-gray-900 whitespace-nowrap">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="w-10 h-10 bg-white hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-gray-900 shadow-sm border border-gray-200 flex items-center justify-center shrink-0"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Container */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-x-auto scrollbar-hide">
              <div className="min-w-[700px]">
              {/* Day Headers */}
              <div className="grid grid-cols-7 bg-gradient-to-br from-brand-700 to-brand-800 border-b border-brand-600">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <div key={day} className="text-center py-4 border-r border-brand-600 last:border-r-0">
                    <div className="text-[11px] font-black text-brand-100 uppercase tracking-widest">
                      {day}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {(() => {
                  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                  const prevMonthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
                  
                  const cells = [];
                  
                  // Previous month days
                  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
                    cells.push(
                      <div key={`prev-${i}`} className="min-h-[100px] md:min-h-[120px] p-4 border-r border-b border-gray-100 bg-gray-50/50 last:border-r-0">
                        <span className="text-sm font-bold text-gray-300">{prevMonthDays - i}</span>
                      </div>
                    );
                  }
                  
                  // Current month days
                  for (let i = 1; i <= daysInMonth; i++) {
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                    const dayTasks = tasks.filter(t => t.due_date && t.due_date.startsWith(dateStr));
                    const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i).toDateString();
                    
                    cells.push(
                      <div 
                        key={i} 
                        className={`min-h-[100px] md:min-h-[120px] p-4 border-r border-b border-gray-100 last:border-r-0 transition-all duration-200 group relative ${
                          isToday 
                            ? 'bg-gradient-to-br from-brand-50 to-brand-100/50' 
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        {/* Date Number */}
                        <div className="flex items-center justify-between mb-3">
                          <div className={`flex items-center justify-center font-bold transition-all ${
                            isToday 
                              ? 'w-8 h-8 bg-brand-600 text-white rounded-full text-sm shadow-md' 
                              : 'text-gray-900 text-base'
                          }`}>
                            {i}
                          </div>
                          {dayTasks.length > 0 && (
                            <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                              isToday 
                                ? 'bg-brand-700 text-white' 
                                : 'bg-brand-100 text-brand-700'
                            }`}>
                              {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                            </div>
                          )}
                        </div>
                        
                        {/* Tasks List */}
                        <div className="space-y-1.5">
                          {dayTasks.slice(0, 3).map((task, idx) => (
                            <button 
                              key={idx} 
                              onClick={() => onTaskClick(task.project_id, task.id)}
                              className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-semibold truncate transition-all flex items-center gap-2 group/task border relative ${
                                task.status === 'done'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : task.priority === 'high'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                task.status === 'done' ? 'bg-emerald-500' :
                                task.priority === 'high' ? 'bg-rose-500' : 'bg-brand-500'
                              }`} />
                              <span className="truncate">{task.title}</span>
                              
                              {/* Premium Tooltip for Truncated Text */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg opacity-0 translate-y-2 group-hover/task:opacity-100 group-hover/task:translate-y-0 transition-all duration-200 pointer-events-none whitespace-normal min-w-[120px] max-w-[200px] z-20 shadow-xl border border-white/10 text-center">
                                {task.title}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45 -translate-y-1" />
                              </div>
                            </button>
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-[10px] text-center font-bold text-brand-600 bg-brand-50 rounded-lg py-1">
                              +{dayTasks.length - 3} more
                            </div>
                          )}
                        </div>

                        {/* Today Indicator */}
                        {isToday && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-500 to-brand-600" />
                        )}
                      </div>
                    );
                  }
                  
                  // Next month days
                  const totalCells = cells.length;
                  const remainingCells = 42 - totalCells;
                  for (let i = 1; i <= remainingCells; i++) {
                    cells.push(
                      <div key={`next-${i}`} className="min-h-[100px] md:min-h-[120px] p-4 border-r border-b border-gray-100 bg-gray-50/50 last:border-r-0">
                        <span className="text-sm font-bold text-gray-300">{i}</span>
                      </div>
                    );
                  }
                  
                  return cells;
                })()}
              </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-[10px] md:text-xs font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-500" />
                <span className="text-gray-600">Regular Task</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-gray-600">High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-600">Completed</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Stats & Actions (Smaller span on wider screens) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            
            {/* Action Card First for Quick Access */}
            <button 
              onClick={onStartProject}
              className="w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group text-left relative overflow-hidden border border-gray-700"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-brand-500/20 transition-colors" />
              <div className="relative z-10 flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xl md:text-2xl font-bold text-white group-hover:text-brand-200 transition-colors truncate">Start Project</h4>
                  <p className="text-xs text-gray-400 font-medium group-hover:text-gray-300 truncate">New workspace</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 border border-white/5 shrink-0 shadow-lg">
                  <Plus className="w-6 h-6" />
                </div>
              </div>
            </button>

            {/* Stats Grid - Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              {cards.map((card, i) => (
                <div key={i} className="bg-gradient-to-br from-white to-gray-50 p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 group relative overflow-hidden flex flex-col">
                  <div className={`absolute -right-6 -top-6 w-24 h-24 ${card.bgColor} rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
                  
                  <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                    <div className={`w-10 h-10 md:w-12 md:h-12 ${card.bgColor} ${card.color} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
                      <card.icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                    </div>
                    
                    <div className="w-full min-w-0">
                      <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">{card.value}</h3>
                      <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest break-words flex flex-wrap justify-center px-1">
                        {card.label.split(' ').map((word, index) => (
                          <span key={index} className="mx-0.5">{word}</span>
                        ))}
                      </p>
                    </div>
                    
                    {/* Progress indicator line */}
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full max-w-[60px] mx-auto opacity-60">
                      <div 
                        className={`h-full ${card.color.replace('text-', 'bg-')} transition-all duration-500`}
                        style={{ width: `${Math.min((card.value / Math.max(stats.totalTasks, 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote Card */}
            <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl border border-brand-600">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-brand-500/30 rounded-xl flex items-center justify-center backdrop-blur-md border border-brand-400/20">
                    <Quote className="w-6 h-6 text-brand-100" />
                  </div>
                  <div className="px-3 py-1.5 bg-brand-950/30 rounded-full backdrop-blur-sm border border-brand-400/10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-100">Daily Fact</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-brand-50 text-base font-medium leading-relaxed italic">
                    "KalKorbo means 'I'll do it tomorrow' in Bangla. Because we know that's when you're actually going to do those tasks!"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="relative">
                    <div className="w-8 h-8 bg-brand-500/30 rounded-full flex items-center justify-center backdrop-blur-md animate-bounce border border-brand-400/20">
                      <Frown className="w-4 h-4 text-brand-100" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest text-brand-200">The KalKorbo Team</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="pt-8 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-widest">
          <p>KalKorbo 1.0</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Online</span>
          </div>
        </footer>

      </div>
    </div>
  );
}