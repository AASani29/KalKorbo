import { useState } from 'react';
import { X, Loader2, Github, Globe, Mail, Plus, Trash2 } from 'lucide-react';
import { supabase, Project } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';

type CreateProjectModalProps = {
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
};

const PROJECT_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
];

export function CreateProjectModal({ onClose, onProjectCreated }: CreateProjectModalProps) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addInviteEmail = async () => {
    if (inviteEmail && !inviteEmails.includes(inviteEmail)) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
        showToast('error', 'Please enter a valid email address');
        return;
      }

      if (inviteEmail.toLowerCase() === profile?.email?.toLowerCase()) {
        showToast('info', "You're already the owner of this project! ✨");
        return;
      }

      setCheckingEmail(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', inviteEmail.toLowerCase())
          .single();

        if (error || !data) {
          showToast('error', 'Only registered users can be invited to projects.');
          setCheckingEmail(false);
          return;
        }

        setInviteEmails([...inviteEmails, inviteEmail.toLowerCase()]);
        setInviteEmail('');
      } catch (err) {
        showToast('error', 'User not found. They must have an account first.');
      }
      setCheckingEmail(false);
    }
  };

  const removeInviteEmail = (email: string) => {
    setInviteEmails(inviteEmails.filter((e) => e !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create Project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          color: selectedColor,
          owner_id: profile?.id,
          github_url: githubUrl || null,
          live_url: liveUrl || null,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // 2. Add Owner as Member
      await supabase.from('project_members').insert({
        project_id: projectData.id,
        user_id: profile?.id,
        role: 'owner',
      });

      // 3. Send Invitations
      if (inviteEmails.length > 0) {
        const invitations = inviteEmails.map((email) => ({
          project_id: projectData.id,
          inviter_id: profile?.id,
          invitee_email: email,
        }));

        const { error: inviteError } = await supabase
          .from('project_invitations')
          .insert(invitations);

        if (inviteError) {
          showToast('warning', 'Project created, but some invitations failed to send.');
        }
      }

      showToast('success', 'Project created successfully! 🚀');
      onProjectCreated(projectData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden relative animate-in fade-in zoom-in duration-300 scrollbar-hide">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Project</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">Set up your workspace and invite your team</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Basic Info */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all text-sm font-bold placeholder:text-gray-400"
                  placeholder="e.g., TaskFlow Pro"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all text-sm font-medium placeholder:text-gray-400 resize-none"
                  placeholder="What are we building?"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Github className="w-3 h-3" /> GitHub
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all text-xs font-medium placeholder:text-gray-400"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Globe className="w-3 h-3" /> Live Demo
                  </label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all text-xs font-medium placeholder:text-gray-400"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Brand Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-lg transition-all flex items-center justify-center ${
                        selectedColor === color 
                          ? 'ring-2 ring-brand-500 ring-offset-2' 
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Invitations */}
            <div className="space-y-5 bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Invite Team Members
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInviteEmail())}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-xs font-medium"
                      placeholder="email@example.com"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addInviteEmail}
                    disabled={checkingEmail || !inviteEmail}
                    className="p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-sm disabled:opacity-50"
                  >
                    {checkingEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[180px] overflow-y-auto scrollbar-hide">
                {inviteEmails.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">No invites added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {inviteEmails.map((email) => (
                      <div key={email} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-100 group">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-3 h-3 text-brand-600" />
                          </div>
                          <span className="text-xs font-bold text-gray-700 truncate">{email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeInviteEmail(email)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[9px] text-gray-400 font-medium leading-relaxed">
                Invited members will receive an email and can join once they accept the invitation.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 text-gray-500 font-bold hover:text-gray-700 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3.5 bg-brand-600 text-white rounded-2xl font-bold shadow-xl shadow-brand-100 hover:bg-brand-700 hover:shadow-brand-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
