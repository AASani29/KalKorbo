import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { ToastProvider } from './lib/toast';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { HomePage } from './components/HomePage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [view, setView] = useState<'home' | 'dashboard'>(() => {
    return (localStorage.getItem('kalkorbo_view') as 'home' | 'dashboard') || 'home';
  });
  const [showCreateProjectOnDashboard, setShowCreateProjectOnDashboard] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    return localStorage.getItem('kalkorbo_project_id');
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Loading KalKorbo...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  if (profile && !profile.onboarding_completed) {
    return <Onboarding onComplete={() => setView('home')} />;
  }

  const handleGoToDashboard = () => {
    setShowCreateProjectOnDashboard(false);
    // Don't clear selectedProjectId here if we want to keep the last one
    setSelectedTaskId(null);
    setView('dashboard');
    localStorage.setItem('kalkorbo_view', 'dashboard');
  };

  const handleStartProject = () => {
    setShowCreateProjectOnDashboard(true);
    setSelectedProjectId(null);
    setSelectedTaskId(null);
    setView('dashboard');
    localStorage.setItem('kalkorbo_view', 'dashboard');
    localStorage.removeItem('kalkorbo_project_id');
  };

  const handleTaskClick = (projectId: string, taskId: string) => {
    setSelectedProjectId(projectId);
    setSelectedTaskId(taskId);
    setShowCreateProjectOnDashboard(false);
    setView('dashboard');
    localStorage.setItem('kalkorbo_view', 'dashboard');
    localStorage.setItem('kalkorbo_project_id', projectId);
  };

  const handleGoHome = () => {
    setShowCreateProjectOnDashboard(false);
    setSelectedProjectId(null);
    setSelectedTaskId(null);
    setView('home');
    localStorage.setItem('kalkorbo_view', 'home');
    localStorage.removeItem('kalkorbo_project_id');
  };

  return view === 'home' ? (
    <HomePage 
      onGoToDashboard={handleGoToDashboard}
      onStartProject={handleStartProject}
      onTaskClick={handleTaskClick}
    />
  ) : (
    <Dashboard 
      onGoHome={handleGoHome}
      initialShowCreateProject={showCreateProjectOnDashboard}
      initialProjectId={selectedProjectId}
      initialTaskId={selectedTaskId}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
