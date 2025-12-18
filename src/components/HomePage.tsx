import { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar,
  ArrowRight,
  Sparkles,
  Frown,
  Quote,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export function HomePage({ 
  onGoToDashboard,
  onStartProject,
  onTaskClick
}: { 
  onGoToDashboard: () => void;
  onStartProject: () => void;
  onTaskClick: (projectId: string, taskId: string) => void;
}) {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    highPriority: 0,
    totalProjects: 0
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

      const { data: projects } = await supabase
        .from('project_members')
        .select('id')
        .eq('user_id', profile?.id);

      if (allTasks) {
        setStats({
          totalTasks: allTasks.length,
          completedTasks: allTasks.filter(t => t.status === 'done').length,
          pendingTasks: allTasks.filter(t => t.status !== 'done').length,
          highPriority: allTasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
          totalProjects: projects?.length || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const cards = [
    { 
      label: 'Active Projects', 
      value: stats.totalProjects, 
      icon: LayoutGrid, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Projects you are part of'
    },
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
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Simple & Elegant Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-brand-50">
                <img 
                  src={profile?.avatar_url || '/male 1.svg'} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-cyan rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-purple/10 rounded-full text-[10px] font-bold text-accent-purple uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Welcome Back
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
                Welcome to KalKorbo, <br />
                <span className="text-brand-600">{profile?.full_name?.split(' ')[0]}</span>
              </h1>
              <p className="text-gray-500 text-lg font-medium flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          <button
            onClick={onGoToDashboard}
            className="group relative px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all duration-300 flex items-center gap-3 overflow-hidden"
          >
            <span className="relative z-10">Go to Dashboard</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </header>

        {/* Redesigned Stats Section - More Integrated & Premium */}
        <div className="bg-gray-50/50 rounded-[3rem] p-10 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {cards.map((card, i) => (
              <div key={i} className="relative group">
                {i !== 0 && <div className="hidden lg:block absolute -left-6 top-1/2 -translate-y-1/2 w-px h-12 bg-gray-200" />}
                <div className="space-y-4">
                  <div className={`w-12 h-12 ${card.bgColor} ${card.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{card.label}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-4xl font-black text-gray-900">{card.value}</h3>
                      <span className="text-xs font-bold text-gray-400">total</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Calendar Section - Resized & Repositioned */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-brand-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Your Schedule</h2>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-400 hover:text-gray-900"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold text-gray-900 px-2 min-w-[120px] text-center uppercase tracking-widest">
                  {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-400 hover:text-gray-900"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-brand-50/40 rounded-[3rem] border border-brand-100/50 shadow-sm overflow-hidden backdrop-blur-sm">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 border-b border-brand-100/50 bg-brand-100/20">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-4 text-center text-[11px] font-black text-brand-600 uppercase tracking-[0.2em]">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {(() => {
                  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                  const prevMonthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
                  
                  const cells = [];
                  
                  // Previous month days
                  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
                    cells.push(
                      <div key={`prev-${i}`} className="h-28 p-3 border-r border-b border-brand-100/20 bg-brand-50/10 opacity-40">
                        <span className="text-xs font-bold text-brand-400">{prevMonthDays - i}</span>
                      </div>
                    );
                  }
                  
                  // Current month days
                  for (let i = 1; i <= daysInMonth; i++) {
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                    const dayTasks = tasks.filter(t => t.due_date && t.due_date.startsWith(dateStr));
                    const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i).toDateString();
                    
                    cells.push(
                      <div key={i} className={`h-28 p-3 border-r border-b border-brand-100/20 hover:bg-white/80 transition-colors relative group ${isToday ? 'bg-white shadow-sm' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold ${isToday ? 'w-7 h-7 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg' : 'text-gray-900'}`}>
                            {i}
                          </span>
                        </div>
                        <div className="space-y-1.5 overflow-y-auto max-h-[60px] scrollbar-hide">
                          {dayTasks.map((task, idx) => (
                            <button 
                              key={idx} 
                              onClick={() => onTaskClick(task.project_id, task.id)}
                              className={`w-full text-left px-2 py-1 rounded-md text-[10px] font-bold truncate border transition-all hover:scale-[1.02] active:scale-95 ${
                                task.status === 'done' 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100 opacity-60' 
                                  : task.priority === 'high'
                                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                                  : 'bg-blue-50 text-blue-600 border-blue-100'
                              }`}
                              title={`Click to view: ${task.title}`}
                            >
                              {task.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  // Next month days
                  const totalCells = cells.length;
                  const remainingCells = 42 - totalCells;
                  for (let i = 1; i <= remainingCells; i++) {
                    cells.push(
                      <div key={`next-${i}`} className="h-28 p-3 border-r border-b border-brand-100/20 bg-brand-50/10 opacity-40">
                        <span className="text-xs font-bold text-brand-400">{i}</span>
                      </div>
                    );
                  }
                  
                  return cells;
                })()}
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex-1 bg-accent-purple rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-accent-cyan/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Quote className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Did you know?</h3>
                    <p className="text-brand-50 text-lg font-medium leading-relaxed italic">
                      "KalKorbo means 'I'll do it tomorrow' in Bangla. Because we know that's when you're actually going to do those tasks!"
                    </p>
                  </div>
                </div>

                <div className="pt-8 flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-accent-cyan/20 rounded-full flex items-center justify-center backdrop-blur-md animate-bounce">
                      <Frown className="w-6 h-6 text-white" />
                    </div>
                    {/* Tear animation */}
                    <div className="absolute top-8 left-3 w-1 h-2 bg-brand-200 rounded-full animate-ping" />
                    <div className="absolute top-8 right-3 w-1 h-2 bg-brand-200 rounded-full animate-ping delay-300" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">The KalKorbo Team</p>
                    <p className="text-[10px] font-bold opacity-40 italic">With love and procrastination</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Card */}
            <button 
              onClick={onStartProject}
              className="w-full bg-gray-900 rounded-[2.5rem] p-8 text-white group cursor-pointer hover:bg-brand-600 transition-colors duration-500 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-brand-100 transition-colors">Next Step</p>
                  <h4 className="text-lg font-bold mt-1">Start a New Project</h4>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-brand-600 transition-all">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <footer className="pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">
            Don't just work, <span className="text-brand-600">KalKorbo it.</span>
          </p>
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Version 2.0.4</span>
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Operational</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
