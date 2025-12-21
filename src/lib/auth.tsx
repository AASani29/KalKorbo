import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from './supabase';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (() => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    setProfile(data);
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase();
    console.log('Attempting sign in for:', normalizedEmail);
    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }
    console.log('Sign in successful');
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const normalizedEmail = email.toLowerCase();
    const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password });
    if (error) {
      console.error('Sign up error:', error);
      throw error;
    }
    console.log('Sign up successful, user created:', data.user?.id);

    if (data.user) {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newProfile: Profile = {
        id: data.user.id,
        email: normalizedEmail,
        full_name: fullName,
        avatar_color: randomColor,
        onboarding_completed: false,
        created_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase.from('profiles').insert(newProfile);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Force sign out if profile creation fails so user isn't stuck with a valid session but no profile
        await supabase.auth.signOut();
        throw new Error(`Account created, but failed to set up profile: ${profileError.message}`);
      }

      setProfile(newProfile);
    }
  };

  const signOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('kalkorbo_view');
      localStorage.removeItem('kalkorbo_project_id');
      localStorage.removeItem('kalkorbo_show_profile');
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile: () => user ? loadProfile(user.id) : Promise.resolve() }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
