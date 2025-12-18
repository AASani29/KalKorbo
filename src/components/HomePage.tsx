import { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Sparkles,
  Frown,
  Quote,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export function HomePage({ onGoToDashboard }: { onGoToDashboard: () => void }) {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    highPriority: 0,
    totalProjects: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to.eq.${profile?.id},created_by.eq.${profile?.id}`);

      const { data: projects } = await supabase
        .from('project_members')
        .select('id')
        .eq('user_id', profile?.id);

      if (tasks) {
        setStats({
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'done').length,
          pendingTasks: tasks.filter(t => t.status !== 'done').length,
          highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
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
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-brand-50">
                <img 
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-full text-[10px] font-bold text-brand-600 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Welcome Back
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
                Welcome to Kando, <br />
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

        {/* Minimal Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, i) => (
            <div 
              key={i}
              className="group p-8 rounded-[2rem] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500"
            >
              <div className={`w-12 h-12 ${card.bgColor} ${card.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{card.label}</p>
                <h3 className="text-4xl font-black text-gray-900">{card.value}</h3>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-xs text-gray-400 font-medium">{card.description}</p>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Productivity Chart - Refined */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-brand-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Weekly Activity</h2>
              </div>
              <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
                {['Week', 'Month'].map(t => (
                  <button key={t} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${t === 'Week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50/50 rounded-[2.5rem] border border-gray-100 p-10">
              <div className="h-64 flex items-end justify-between gap-6">
                {[40, 70, 45, 90, 65, 85, 55].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                    <div className="relative w-full">
                      <div 
                        className="w-full bg-brand-200 rounded-xl group-hover:bg-brand-600 transition-all duration-500 relative overflow-hidden"
                        style={{ height: `${h}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                      </div>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {h} tasks
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Funny Crying Section - Integrated as a "Did you know?" */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex-1 bg-brand-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Quote className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Did you know?</h3>
                    <p className="text-brand-50 text-lg font-medium leading-relaxed italic">
                      "Kando means 'Cry' in Bangla. We named it this because we know you'll cry seeing how much work you have left!"
                    </p>
                  </div>
                </div>

                <div className="pt-8 flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md animate-bounce">
                      <Frown className="w-6 h-6 text-white" />
                    </div>
                    {/* Tear animation */}
                    <div className="absolute top-8 left-3 w-1 h-2 bg-brand-200 rounded-full animate-ping" />
                    <div className="absolute top-8 right-3 w-1 h-2 bg-brand-200 rounded-full animate-ping delay-300" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">The Kando Team</p>
                    <p className="text-[10px] font-bold opacity-40 italic">With love and tears</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Card */}
            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white group cursor-pointer hover:bg-brand-600 transition-colors duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-brand-100 transition-colors">Next Step</p>
                  <h4 className="text-lg font-bold mt-1">Start a New Project</h4>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-brand-600 transition-all">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <footer className="pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">
            Don't just work, <span className="text-brand-600">Kando it.</span>
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
