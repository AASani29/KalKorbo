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
  const [view, setView] = useState<'home' | 'dashboard'>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Loading Kando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  if (profile && !profile.onboarding_completed) {
    return <Onboarding onComplete={() => setView('home')} />;
  }

  return view === 'home' ? (
    <HomePage onGoToDashboard={() => setView('dashboard')} />
  ) : (
    <Dashboard onGoHome={() => setView('home')} />
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
