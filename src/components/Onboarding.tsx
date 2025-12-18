import { useState } from 'react';
import { Check, Sparkles, ArrowRight, User, UserCircle, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';

const GENDERS = [
  { id: 'male', label: 'Male', icon: User },
  { id: 'female', label: 'Female', icon: UserCircle },
  { id: 'other', label: 'Other', icon: Users }
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [gender, setGender] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const femaleAvatars = Array.from({ length: 11 }, (_, i) => `/female ${i + 1}.svg`);
  const maleAvatars = Array.from({ length: 8 }, (_, i) => `/male ${i + 1}.svg`);

  const avatars = gender === 'female' 
    ? femaleAvatars 
    : gender === 'male' 
    ? maleAvatars 
    : [...maleAvatars, ...femaleAvatars];


  const handleComplete = async () => {
    if (!gender || !selectedAvatar) {
      showToast('error', 'Please select both gender and an avatar');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          gender,
          avatar_url: selectedAvatar,
          onboarding_completed: true
        })
        .eq('id', profile?.id);

      if (error) throw error;

      await refreshProfile();
      onComplete();
      showToast('success', 'Profile set up successfully! Welcome aboard 🚀');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl animate-in fade-in zoom-in duration-700">
        
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-full text-[10px] font-bold text-brand-600 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Step 1: Personalization
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">
            Make KalKorbo <span className="text-brand-600">Yours</span>
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-md mx-auto">
            Let's set up your profile to make your workspace feel like home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Left: Selection */}
          <div className="md:col-span-12 space-y-12">
            
            {/* Gender Selection */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold shadow-lg">1</div>
                <h2 className="text-2xl font-bold text-gray-900">Select your gender</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {GENDERS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setGender(g.id);
                      setSelectedAvatar('');
                    }}
                    className={`p-8 rounded-[2.5rem] border-2 transition-all duration-300 group relative flex flex-col items-center gap-4 ${
                      gender === g.id
                        ? 'border-brand-600 bg-brand-50/30 shadow-2xl shadow-brand-100/50'
                        : 'border-gray-100 bg-white hover:border-brand-200 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      gender === g.id ? 'bg-brand-600 text-white scale-110 rotate-3' : 'bg-gray-100 text-gray-400 group-hover:scale-110'
                    }`}>
                      <g.icon className="w-8 h-8" />
                    </div>
                    <span className={`text-lg font-bold ${gender === g.id ? 'text-brand-700' : 'text-gray-500'}`}>
                      {g.label}
                    </span>
                    {gender === g.id && (
                      <div className="absolute top-6 right-6 bg-brand-600 rounded-full p-1.5 shadow-lg animate-in zoom-in duration-300">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Avatar Selection */}
            {gender && (
              <section className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold shadow-lg">2</div>
                  <h2 className="text-2xl font-bold text-gray-900">Choose your avatar</h2>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                  {avatars.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedAvatar(url)}
                      className={`relative aspect-square rounded-[2rem] overflow-hidden border-4 transition-all duration-500 group ${
                        selectedAvatar === url
                          ? 'border-brand-600 ring-8 ring-brand-50 shadow-2xl'
                          : 'border-gray-100 hover:border-brand-200 bg-white'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      {selectedAvatar === url && (
                        <div className="absolute inset-0 bg-brand-600/10 flex items-center justify-center">
                          <div className="bg-brand-600 rounded-full p-2 shadow-xl animate-in zoom-in duration-300">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Action */}
            <div className="pt-8">
              <button
                onClick={handleComplete}
                disabled={loading || !gender || !selectedAvatar}
                className="group relative w-full bg-gray-900 text-white py-6 px-8 rounded-[2rem] font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 text-xl overflow-hidden"
              >
                <span className="relative z-10">
                  {loading ? 'Setting up your space...' : 'Get Started with KalKorbo'}
                </span>
                {!loading && <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
