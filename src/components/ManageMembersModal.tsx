import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Mail, Crown } from 'lucide-react';
import { supabase, Project, Profile, ProjectMember } from '../lib/supabase';
import { useAuth } from '../lib/auth';

type ManageMembersModalProps = {
  project: Project;
  onClose: () => void;
};

type MemberWithProfile = ProjectMember & {
  profile: Profile;
};

export function ManageMembersModal({ project, onClose }: ManageMembersModalProps) {
  const { profile } = useAuth();
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMembers();
    loadAllUsers();
  }, [project.id]);

  const loadMembers = async () => {
    const { data } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', project.id);

    if (data) {
      const membersWithProfiles = await Promise.all(
        data.map(async (member) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', member.user_id)
            .single();

          return {
            ...member,
            profile: profileData!,
          };
        })
      );

      setMembers(membersWithProfiles);
    }
  };

  const loadAllUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');

    if (data) {
      setAllUsers(data);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      await supabase.from('project_members').insert({
        project_id: project.id,
        user_id: selectedUser,
        role: 'member',
      });

      await loadMembers();
      setSelectedUser('');
    } catch (error) {
      console.error('Error adding member:', error);
    }
    setLoading(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    await supabase.from('project_members').delete().eq('id', memberId);
    await loadMembers();
  };

  const isOwner = project.owner_id === profile?.id;
  const memberIds = members.map((m) => m.user_id);
  const availableUsers = allUsers.filter((user) => !memberIds.includes(user.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
            <p className="text-sm text-gray-600 mt-1">{project.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isOwner && availableUsers.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Team Member
            </label>
            <div className="flex gap-2">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select a user...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddMember}
                disabled={!selectedUser || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        )}

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
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: member.profile.avatar_color }}
                  >
                    {member.profile.full_name.charAt(0).toUpperCase()}
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
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {members.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No team members yet
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
