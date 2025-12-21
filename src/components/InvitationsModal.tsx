import { useState, useEffect } from 'react';
import { X, Mail, Check, XCircle, Loader2 } from 'lucide-react';
import { supabase, ProjectInvitation, Project } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';

type InvitationsModalProps = {
  onClose: () => void;
  onInvitationAccepted: () => void;
};

type InvitationWithProject = ProjectInvitation & {
  project: Project;
  inviter_name: string;
};

export function InvitationsModal({ onClose, onInvitationAccepted }: InvitationsModalProps) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [invitations, setInvitations] = useState<InvitationWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase
      .from('project_invitations')
      .select(`
        *,
        project:projects(*),
        inviter:profiles!project_invitations_inviter_id_fkey(full_name, avatar_url, avatar_color)
      `)
      .or(`invitee_email.ilike.${profile.email},invitee_id.eq.${profile.id}`)
      .order('created_at', { ascending: false });

    if (data) {
      const formatted = data.map((inv: any) => ({
        ...inv,
        inviter_name: inv.inviter?.full_name || 'Unknown',
        inviter_avatar_url: inv.inviter?.avatar_url,
        inviter_avatar_color: inv.inviter?.avatar_color,
      }));
      setInvitations(formatted);
    }
    setLoading(false);
  };

  const handleAccept = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      const { error } = await supabase.rpc('accept_project_invitation', {
        invitation_id: invitationId,
      });

      if (error) throw error;

      showToast('success', 'Invitation accepted! Welcome to the project 🎉');
      onInvitationAccepted();
      loadInvitations();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to accept invitation');
    }
    setProcessingId(null);
  };

  const handleReject = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      const { error } = await supabase.rpc('reject_project_invitation', {
        invitation_id: invitationId,
      });

      if (error) throw error;

      showToast('info', 'Invitation rejected');
      loadInvitations();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to reject invitation');
    }
    setProcessingId(null);
  };

  const pendingInvitations = invitations.filter((inv) => inv.status === 'pending');
  const processedInvitations = invitations.filter((inv) => inv.status !== 'pending');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-300 scrollbar-hide">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Project Invitations</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {pendingInvitations.length} pending request{pendingInvitations.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Loading invitations...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-gray-100">
                <Mail className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-sm text-gray-500">You don't have any pending project invitations.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pending Invitations */}
              {pendingInvitations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">
                    Pending Requests
                  </h3>
                  <div className="space-y-4">
                    {pendingInvitations.map((invitation: any) => (
                      <div
                        key={invitation.id}
                        className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-start gap-4">
                            {/* Project Icon */}
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0"
                              style={{ backgroundColor: invitation.project.color }}
                            >
                              {invitation.project.name.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="min-w-0">
                              <h4 className="text-lg font-bold text-gray-900 truncate mb-1">
                                {invitation.project.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold overflow-hidden border-2 border-white shadow-sm"
                                  style={{ backgroundColor: invitation.inviter_avatar_color || '#3455a0' }}
                                >
                                  {invitation.inviter_avatar_url ? (
                                    <img src={invitation.inviter_avatar_url} alt="Inviter" className="w-full h-full object-cover" />
                                  ) : (
                                    invitation.inviter_name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  Invited by <span className="font-bold text-gray-900">{invitation.inviter_name}</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleReject(invitation.id)}
                              disabled={processingId === invitation.id}
                              className="flex-1 md:flex-none px-6 py-3 bg-gray-50 text-gray-500 rounded-2xl font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Decline
                            </button>
                            <button
                              onClick={() => handleAccept(invitation.id)}
                              disabled={processingId === invitation.id}
                              className="flex-1 md:flex-none px-8 py-3 bg-brand-600 text-white rounded-2xl font-bold text-sm hover:bg-brand-700 shadow-lg shadow-brand-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {processingId === invitation.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Accept
                            </button>
                          </div>
                        </div>
                        
                        {invitation.project.description && (
                          <div className="mt-4 pt-4 border-t border-gray-50">
                            <p className="text-sm text-gray-500 leading-relaxed italic">
                              "{invitation.project.description}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Processed Invitations */}
              {processedInvitations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">
                    Recent History
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {processedInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{ backgroundColor: invitation.project.color }}
                          >
                            {invitation.project.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-gray-700 truncate">
                            {invitation.project.name}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            invitation.status === 'accepted'
                              ? 'bg-green-50 text-green-600 border border-green-100'
                              : 'bg-red-50 text-red-600 border border-red-100'
                          }`}
                        >
                          {invitation.status === 'accepted' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {invitation.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-gray-50 bg-gray-50/30">
          <button
            onClick={onClose}
            className="w-full px-6 py-4 bg-white border border-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
