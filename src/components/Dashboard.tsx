import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { supabase, Project } from '../lib/supabase';
import { Sidebar } from './Sidebar';
import { CreateProjectModal } from './CreateProjectModal';
import { TaskBoard } from './TaskBoard';
import { ManageMembersModal } from './ManageMembersModal';
import { InvitationsModal } from './InvitationsModal';
import { InviteMemberModal } from './InviteMemberModal';
import { ProfilePage } from './ProfilePage';
import { HomePage } from './HomePage';
import { VoiceAssistant } from './VoiceAssistant/VoiceAssistant';
import { Sparkles, Github, Globe } from 'lucide-react';
import { useToast } from '../lib/toast';

export function Dashboard({ 
  initialShowCreateProject = false,
  initialProjectId = null,
  initialTaskId = null
}: { 
  initialShowCreateProject?: boolean;
  initialProjectId?: string | null;
  initialTaskId?: string | null;
}) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(initialTaskId);
  const [showCreateProject, setShowCreateProject] = useState(initialShowCreateProject);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showProfile, setShowProfile] = useState(() => {
    return localStorage.getItem('kalkorbo_show_profile') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('kalkorbo_show_profile', showProfile.toString());
  }, [showProfile]);

  // Handle Global Realtime Presence
  useEffect(() => {
    if (!profile) return;

    const channel = supabase.channel('global_platform_presence', {
      config: {
        presence: {
          key: profile.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat().map((p: any) => p.user);
        
        // De-duplicate users by ID
        const uniqueUsers = users.reduce((acc: any[], current: any) => {
          if (current && !acc.find(u => u.id === current.id)) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        setOnlineUsers(uniqueUsers);
      })
      .on('broadcast', { event: 'wave' }, ({ payload }) => {
        if (payload.toId === profile.id) {
          showToast('success', (
            <div className="flex flex-col gap-2 mt-1">
              <p>
                <span className="font-bold text-brand-600">{payload.fromName}</span> waved at you! 👋
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleWave(payload.fromId, payload.fromName);
                }}
                className="w-fit px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm shadow-brand-100 flex items-center gap-1.5 active:scale-95"
              >
                Wave Back
              </button>
            </div>
          ) as any);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user: {
              id: profile.id,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              avatar_color: profile.avatar_color,
              active_project_id: selectedProject?.id || null
            }
          });
        }
      });

    // Make channel accessible for waving
    (window as any).presenceChannel = channel;

    return () => {
      channel.unsubscribe();
      delete (window as any).presenceChannel;
    };
  }, [profile, selectedProject?.id]);

  useEffect(() => {
    loadProjects();
    loadPendingInvitations();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      checkMembership();
      localStorage.setItem('kalkorbo_project_id', selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setProjects(data);
        if (initialProjectId) {
          const project = data.find(p => p.id === initialProjectId);
          if (project) {
            setSelectedProject(project);
          }
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingInvitations = async () => {
    if (!profile) return;
    try {
      const { data } = await supabase
        .from('project_invitations')
        .select('id')
        .or(`invitee_email.ilike.${profile.email},invitee_id.eq.${profile.id}`)
        .eq('status', 'pending');

      if (data) {
        setPendingInvitationsCount(data.length);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const checkMembership = async () => {
    if (!selectedProject) return;

    try {
      const { data } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', selectedProject.id)
        .eq('user_id', profile?.id)
        .single();

      setIsMember(!!data);
    } catch (error) {
      setIsMember(false);
    }
  };

  const handleProjectCreated = (project: Project) => {
    setProjects([project, ...projects]);
    setSelectedProject(project);
  };

  const handleInvitationAccepted = () => {
    loadProjects();
    loadPendingInvitations();
  };

  const handleTaskClick = (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setActiveTaskId(taskId);
    }
  };

  const handleWave = (toId: string, toName: string) => {
    const channel = (window as any).presenceChannel;
    if (channel && profile) {
      channel.send({
        type: 'broadcast',
        event: 'wave',
        payload: {
          fromId: profile.id,
          fromName: profile.full_name,
          toId: toId
        }
      });
      showToast('success', `Sent a wave to ${toName}! 👋`);
    }
  };

  const handleGoHome = () => {
    setSelectedProject(null);
    setActiveTaskId(null);
    localStorage.removeItem('kalkorbo_project_id');
  };

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onCreateProject={() => setShowCreateProject(true)}
        onManageMembers={() => setShowManageMembers(true)}
        onShowInvitations={() => setShowInvitations(true)}
        onShowProfile={() => setShowProfile(true)}
        onGoHome={handleGoHome}
        pendingInvitationsCount={pendingInvitationsCount}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Minimal Topbar */}
        {selectedProject && (
          <header className="bg-white/50 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Project Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm text-white font-bold text-lg"
                  style={{ backgroundColor: selectedProject.color }}
                >
                  {selectedProject.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Project Info */}
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {selectedProject.name}
                  </h1>
                  {selectedProject.description && (
                    <p className="text-xs text-gray-500 truncate max-w-md">
                      {selectedProject.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Simple Actions */}
              <div className="flex items-center gap-6">
                {/* Project Links */}
                <div className="flex items-center gap-3 border-r border-gray-100 pr-6">
                  {selectedProject.github_url && (
                    <a
                      href={selectedProject.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all group relative"
                      title="View on GitHub"
                    >
                      <Github className="w-5 h-5" />
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        GitHub Repo
                      </span>
                    </a>
                  )}
                  {selectedProject.live_url && (
                    <a
                      href={selectedProject.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all group relative"
                      title="View Live Demo"
                    >
                      <Globe className="w-5 h-5" />
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Live Demo
                      </span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Google Doc-like Project Specific Online Users */}
                  <div className="flex -space-x-2">
                    {onlineUsers
                      .filter(user => user.active_project_id === selectedProject.id)
                      .map((user) => (
                      <div
                        key={user.id}
                        onClick={() => user.id !== profile?.id && handleWave(user.id, user.full_name)}
                        className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden relative group/member transition-transform hover:scale-110 active:scale-95 ${user.id !== profile?.id ? 'cursor-pointer' : 'cursor-default'}`}
                        style={{ backgroundColor: user.avatar_color || '#94a3b8' }}
                      >
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.full_name?.charAt(0).toUpperCase()
                        )}
                        
                        {/* Online Status Indicator */}
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full z-10" />

                        {/* Premium Popover */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900/90 backdrop-blur-md text-white rounded-xl opacity-0 translate-y-[-8px] group-hover/member:opacity-100 group-hover/member:translate-y-0 transition-all duration-200 pointer-events-none z-50 shadow-2xl border border-white/10 min-w-[120px]">
                          <p className="text-[10px] font-bold truncate mb-1">{user.full_name}</p>
                          {user.id !== profile?.id && (
                            <div className="flex items-center gap-1 text-[9px] text-brand-400 font-bold">
                              <span>Click to wave 👋</span>
                            </div>
                          )}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45 translate-y-1" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Platform Online Indicator */}
                  {onlineUsers.length > 0 && (
                    <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        {onlineUsers.length} Online
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Loading...</p>
              </div>
            </div>
          ) : !selectedProject ? (
            <HomePage 
              onStartProject={() => setShowCreateProject(true)}
              onTaskClick={handleTaskClick}
            />
          ) : !isMember ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Access Restricted
                </h3>
                <p className="text-sm text-gray-500">
                  You don't have access to this project. Ask the project owner to invite you.
                </p>
              </div>
            </div>
          ) : (
            <TaskBoard project={selectedProject} initialTaskId={activeTaskId} key={selectedProject.id + (activeTaskId || '')} />
          )}
        </main>
      </div>

      {/* Modals */}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {showManageMembers && selectedProject && (
        <ManageMembersModal
          project={selectedProject}
          onClose={() => setShowManageMembers(false)}
          onInviteMember={() => setShowInviteMember(true)}
        />
      )}

      {showInvitations && (
        <InvitationsModal
          onClose={() => setShowInvitations(false)}
          onInvitationAccepted={handleInvitationAccepted}
        />
      )}

      {showInviteMember && selectedProject && (
        <InviteMemberModal
          project={selectedProject}
          onClose={() => setShowInviteMember(false)}
          onInviteSent={() => {
            setShowInviteMember(false);
            setShowManageMembers(true);
          }}
        />
      )}

      {showProfile && (
        <ProfilePage onBack={() => setShowProfile(false)} />
      )}

      {/* Voice Assistant */}
      <VoiceAssistant
        onNavigate={(destination) => {
          if (destination === 'home') {
            handleGoHome();
          } else if (destination === 'profile') {
            setShowProfile(true);
          }
        }}
        onOpenProject={(projectId) => {
          const project = projects.find(p => p.id === projectId);
          if (project) {
            setSelectedProject(project);
          }
        }}
        onRefresh={() => {
          loadProjects();
          loadPendingInvitations();
          if (selectedProject) {
            // No longer using internal members list
          }
        }}
      />
    </div>
  );
}
