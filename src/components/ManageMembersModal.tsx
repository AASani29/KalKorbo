import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Mail, Crown } from 'lucide-react';
import { supabase, Project, Profile, ProjectMember } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';

type ManageMembersModalProps = {
  project: Project;
  onClose: () => void;
  onInviteMember?: () => void;
  onMembersChange?: () => void;
};

type MemberWithProfile = ProjectMember & {
  profile: Profile;
};

export function ManageMembersModal({ project, onClose, onInviteMember, onMembersChange }: ManageMembersModalProps) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadMembers();
  }, [project.id]);

  const loadMembers = async () => {
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('project_id', project.id);

    if (error) {
      console.error('Error loading members:', error);
      return;
    }

    if (data) {
      setMembers(data as MemberWithProfile[]);
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    setLoading(true);
    try {
      console.log('Sending delete request for:', memberToRemove.id);
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberToRemove.id);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      console.log('Member removed successfully');
      showToast('success', `${memberToRemove.name} has been removed from the project.`);
      await loadMembers();
      if (onMembersChange) onMembersChange();
      setMemberToRemove(null);
    } catch (error: any) {
      console.error('Error removing member:', error);
      showToast('error', error.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = project.owner_id === profile?.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
            <p className="text-sm text-gray-600 mt-1">{project.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && onInviteMember && (
              <button
                onClick={onInviteMember}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-100 transition-all flex items-center gap-2 font-bold text-sm"
                title="Invite Member"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Invite</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-brand-50 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>



        <div className="space-y-2">
          {members.map((member) => {
            const isProjectOwner = member.user_id === project.owner_id;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden shadow-sm border-2 border-white"
                    style={{ backgroundColor: member.profile.avatar_color }}
                  >
                    {member.profile.avatar_url ? (
                      <img src={member.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      member.profile.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{member.profile.full_name}</p>
                      {isProjectOwner && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                          <Crown className="w-3 h-3" />
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.profile.email}
                    </p>
                  </div>
                </div>

                {isOwner && !isProjectOwner && (
                  <button
                    onClick={() => setMemberToRemove({ id: member.id, name: member.profile.full_name })}
                    disabled={loading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Confirmation Dialog Overlay */}
        {memberToRemove && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
            <div className="text-center p-6 space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Remove Member?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to remove <span className="font-bold text-gray-900">{memberToRemove.name}</span>?
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setMemberToRemove(null)}
                  className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveMember}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-100 transition-all flex items-center gap-2"
                >
                  {loading ? 'Removing...' : 'Yes, Remove'}
                </button>
              </div>
            </div>
          </div>
        )}

        {members.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No team members yet
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-50 text-gray-500 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
