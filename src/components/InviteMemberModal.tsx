import { useState } from 'react';
import { X, Mail, Loader2, Send } from 'lucide-react';
import { supabase, Project } from '../lib/supabase';
import { useToast } from '../lib/toast';

type InviteMemberModalProps = {
  project: Project;
  onClose: () => void;
  onInviteSent: () => void;
};

export function InviteMemberModal({ project, onClose, onInviteSent }: InviteMemberModalProps) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', project.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        showToast('info', 'This user is already a member');
        setLoading(false);
        return;
      }

      // Check if invitation already exists
      const { data: existingInvitation } = await supabase
        .from('project_invitations')
        .select('id, status')
        .eq('project_id', project.id)
        .eq('invitee_email', email.toLowerCase())
        .single();

      if (existingInvitation) {
        if (existingInvitation.status === 'pending') {
          showToast('info', 'An invitation has already been sent to this email');
        } else {
          showToast('info', `Previous invitation was ${existingInvitation.status}`);
        }
        setLoading(false);
        return;
      }

      // Check if user exists in profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (profileError || !profileData) {
        showToast('error', 'Only registered users can be invited to projects.');
        setLoading(false);
        return;
      }

      // Create invitation
      const { error } = await supabase.from('project_invitations').insert({
        project_id: project.id,
        inviter_id: user.id,
        invitee_email: email.toLowerCase(),
        invitee_id: profileData.id,
      });

      if (error) throw error;

      showToast('success', `Invitation sent to ${email}! 📧`);
      setEmail('');
      onInviteSent();
      onClose();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to send invitation');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Invite Team Member</h2>
            <p className="text-sm text-gray-600 mt-1">to {project.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="colleague@example.com"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              They'll receive an invitation to join this project
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
