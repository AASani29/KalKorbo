import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { ToastProvider } from './lib/toast';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  // We only use the initial value essentially
  const [showCreateProjectOnDashboard] = useState(false);
  const [selectedProjectId] = useState<string | null>(() => {
    return localStorage.getItem('kalkorbo_project_id');
  });

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
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Access Error</h3>
          <p className="text-sm text-gray-500 mb-8">
            We couldn't load your profile data. This might be because the account setup wasn't completed.
          </p>
          
          <button 
            onClick={() => signOut()}
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (profile && !profile.onboarding_completed) {
    return <Onboarding onComplete={() => window.location.reload()} />;
  }



  return (
    <Dashboard 
      initialShowCreateProject={showCreateProjectOnDashboard}
      initialProjectId={selectedProjectId}
      initialTaskId={null}
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
