import { useState } from 'react';
import { 
  User, 
  Mail, 
  Camera, 
  Check,
  X,
  Loader2
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useToast } from '../lib/toast';

const AVATARS = {
  male: [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
  ],
  female: [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  ]
};

type ProfilePageProps = {
  onBack: () => void;
};

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>(
    (profile?.gender as 'male' | 'female') || 'male'
  );
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_url || '');

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: selectedAvatar,
          gender: selectedGender
        })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      showToast('success', 'Profile updated successfully!');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onBack}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all z-10"
        >
          <X className="w-6 h-6 text-gray-400" />
        </button>

        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your personal information and avatar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Left Column: Info */}
            <div className="md:col-span-4 space-y-6">
              <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden bg-white border-4 border-white shadow-xl flex items-center justify-center">
                    {selectedAvatar ? (
                      <img src={selectedAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                        style={{ backgroundColor: profile?.avatar_color }}
                      >
                        {profile?.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg border-4 border-white">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{profile?.full_name}</h2>
                <p className="text-sm text-gray-500 mb-6">{profile?.email}</p>
                
                <div className="w-full pt-6 border-t border-gray-100 space-y-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-50">
                      <User className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Full Name</p>
                      <p className="text-sm font-bold text-gray-700 truncate">{profile?.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-50">
                      <Mail className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-gray-700 truncate">{profile?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Avatar Selection */}
            <div className="md:col-span-8 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Choose Your Avatar</h3>
                
                {/* Gender Toggle */}
                <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-8 w-fit">
                  <button
                    onClick={() => setSelectedGender('male')}
                    className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      selectedGender === 'male'
                        ? 'bg-white text-brand-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setSelectedGender('female')}
                    className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      selectedGender === 'female'
                        ? 'bg-white text-brand-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Female
                  </button>
                </div>

                {/* Avatar Grid */}
                <div className="grid grid-cols-5 gap-6 mb-10">
                  {AVATARS[selectedGender].map((url) => (
                    <button
                      key={url}
                      onClick={() => setSelectedAvatar(url)}
                      className={`relative aspect-square rounded-3xl overflow-hidden border-4 transition-all group ${
                        selectedAvatar === url
                          ? 'border-brand-600 ring-8 ring-brand-50'
                          : 'border-gray-50 hover:border-brand-100 bg-gray-50'
                      }`}
                    >
                      <img src={url} alt="Avatar option" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      {selectedAvatar === url && (
                        <div className="absolute inset-0 bg-brand-600/10 flex items-center justify-center">
                          <div className="bg-brand-600 rounded-full p-1.5 shadow-lg">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={onBack}
                    className="px-8 py-4 text-gray-500 font-bold hover:text-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading || selectedAvatar === profile?.avatar_url}
                    className="px-10 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-xl shadow-brand-100 hover:bg-brand-700 hover:shadow-brand-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
