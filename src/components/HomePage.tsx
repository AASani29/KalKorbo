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
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-brand-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-accent-purple/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Simplified Header */}
        {/* Premium Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-gray-100/50">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-300 to-accent-purple rounded-full opacity-30 group-hover:opacity-100 transition duration-500 blur"></div>
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white border-2 border-white ring-1 ring-gray-100">
                <img 
                  src={profile?.avatar_url || '/male 1.svg'} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                  Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-purple">{profile?.full_name?.split(' ')[0]}</span>
                </h1>
                <div className="px-3 py-1 bg-brand-50 rounded-full border border-brand-100 hidden md:block opacity-0">
                  {/* Spacer to keep alignment identical but invisible */}
                  <span className="text-[10px] font-bold text-transparent uppercase tracking-wider">Pro Plan</span>
                </div>
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

        {/* New 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Column (Left/Center) - Calendar & Tasks */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Schedule</h2>
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-gray-900 px-3 min-w-[100px] text-center">
                  {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-white/30 backdrop-blur-md rounded-[3rem] p-5 border-2 border-brand-100 shadow-xl min-h-fit pb-6">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-brand-600 uppercase tracking-widest py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2 auto-rows-fr">
                {(() => {
                  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                  const prevMonthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
                  
                  const cells = [];
                  
                  // Previous month days
                  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
                    cells.push(
                      <div key={`prev-${i}`} className="min-h-[120px] p-3 rounded-3xl bg-gray-50/50 border border-transparent opacity-40 grayscale flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-400">{prevMonthDays - i}</span>
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
                        className={`min-h-[90px] p-2 rounded-2xl border transition-all duration-300 group flex flex-col gap-1.5 relative overflow-hidden ${
                          isToday 
                            ? 'bg-brand-900 text-white border-brand-900 shadow-lg shadow-brand-900/20' 
                            : 'bg-white/60 border-white/50 hover:bg-white hover:scale-[1.02] hover:shadow-lg hover:shadow-brand-500/10'
                        }`}
                      >
                        {isToday && (
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-500/40 to-accent-cyan/20 rounded-full -mr-16 -mt-16 blur-xl" />
                        )}
                        
                        <div className="flex items-center justify-between relative z-10">
                          <span className={`text-xs font-black ${isToday ? 'text-white' : 'text-brand-900'}`}>
                            {i}
                          </span>
                          {dayTasks.length > 0 && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              isToday ? 'bg-white/10 text-brand-50 border border-white/10' : 'bg-brand-50 text-brand-600'
                            }`}>
                              {dayTasks.length}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1 relative z-10 overflow-hidden">
                          {dayTasks.slice(0, 2).map((task, idx) => (
                            <button 
                              key={idx} 
                              onClick={() => onTaskClick(task.project_id, task.id)}
                              className={`w-full text-left p-1 rounded-lg text-[9px] font-bold truncate transition-all flex items-center gap-1.5 group/task ${
                                isToday
                                  ? 'hover:bg-white/10 text-brand-100 hover:text-white'
                                  : 'hover:bg-brand-50 text-brand-700/70 hover:text-brand-700'
                              }`}
                              title={task.title}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                task.status === 'done' ? 'bg-emerald-400' :
                                task.priority === 'high' ? 'bg-rose-400' : 'bg-brand-400'
                              }`} />
                              <span className="truncate opacity-90 group-hover/task:opacity-100">{task.title}</span>
                            </button>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className={`text-[9px] text-center font-bold ${isToday ? 'text-brand-300' : 'text-brand-300'}`}>
                              +{dayTasks.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  // Next month days
                   const totalCells = cells.length;
                   const remainingCells = 42 - totalCells;
                   for (let i = 1; i <= remainingCells; i++) {
                     cells.push(
                        <div key={`next-${i}`} className="min-h-[90px] p-2 rounded-2xl bg-gray-50/50 border border-transparent opacity-40 grayscale flex flex-col items-center">
                         <span className="text-xs font-bold text-gray-400">{i}</span>
                       </div>
                     );
                   }
                  
                  return cells;
                })()}
              </div>
            </div>

            {/* Removed Your Projects Section */}
          </div>

          {/* Right Sidebar - Stats & Actions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Action Card First for Quick Access */}
            <button 
              onClick={onStartProject}
              className="w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-8 text-white shadow-xl shadow-gray-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-brand-500/20 transition-colors" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="text-2xl font-bold text-white group-hover:text-brand-200 transition-colors">Start Project</h4>
                  <p className="text-sm text-gray-400 mt-2 font-medium group-hover:text-gray-300">Create a new workspace</p>
                </div>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 border border-white/5">
                  <Plus className="w-7 h-7" />
                </div>
              </div>
            </button>

            {/* Stats Vertical Stack */}
            <div className="grid grid-cols-1 gap-4">
              {cards.map((card, i) => (
                <div key={i} className={`bg-white/60 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 shadow-sm hover:shadow-lg transition-all duration-300 group flex items-center justify-between`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${card.bgColor} ${card.color} rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.label}</p>
                      <h3 className="text-2xl font-black text-gray-900">{card.value}</h3>
                    </div>
                  </div>
                  <div className={`h-1.5 w-16 rounded-full ${card.color.replace('text-', 'bg-')} opacity-20 group-hover:opacity-100 transition-opacity`}></div>
                </div>
              ))}
            </div>

            {/* Quote Card */}
            <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-brand-900/20">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-brand-500/30 rounded-xl flex items-center justify-center backdrop-blur-md border border-brand-400/20">
                    <Quote className="w-5 h-5 text-brand-100" />
                  </div>
                  <div className="px-3 py-1 bg-brand-950/30 rounded-full backdrop-blur-sm border border-brand-400/10">
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
        <footer className="pt-8 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-widest">
          <p>KalKorbo 2.0</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Online</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
