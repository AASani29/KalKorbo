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
import { Sparkles, Github, Globe } from 'lucide-react';

export function Dashboard({ 
  onGoHome, 
  initialShowCreateProject = false,
  initialProjectId = null,
  initialTaskId = null
}: { 
  onGoHome: () => void;
  initialShowCreateProject?: boolean;
  initialProjectId?: string | null;
  initialTaskId?: string | null;
}) {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(initialShowCreateProject);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [showProfile, setShowProfile] = useState(() => {
    return localStorage.getItem('kalkorbo_show_profile') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('kalkorbo_show_profile', showProfile.toString());
  }, [showProfile]);

  useEffect(() => {
    loadProjects();
    loadPendingInvitations();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      checkMembership();
      loadProjectMembers();
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
          } else if (data.length > 0 && !selectedProject) {
            setSelectedProject(data[0]);
          }
        } else if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectMembers = async () => {
    if (!selectedProject) return;
    
    try {
      const { data } = await supabase
        .from('project_members')
        .select(`
          id,
          role,
          profiles (
            id,
            full_name,
            avatar_url,
            avatar_color
          )
        `)
        .eq('project_id', selectedProject.id);

      if (data) {
        setProjectMembers(data);
      }
    } catch (error) {
      console.error('Error loading project members:', error);
    }
  };

  const loadPendingInvitations = async () => {
    try {
      const { data } = await supabase
        .from('project_invitations')
        .select('id')
        .or(`invitee_email.eq.${profile?.email},invitee_id.eq.${profile?.id}`)
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
        onGoHome={onGoHome}
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

                <div className="flex -space-x-2">
                  {projectMembers.map((member) => (
                    <div
                      key={member.id}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden relative group"
                      style={{ backgroundColor: member.profiles?.avatar_color || '#94a3b8' }}
                      title={member.profiles?.full_name}
                    >
                      {member.profiles?.avatar_url ? (
                        <img
                          src={member.profiles.avatar_url}
                          alt={member.profiles.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        member.profiles?.full_name?.charAt(0).toUpperCase()
                      )}
                      
                      {/* Tooltip */}
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {member.profiles?.full_name}
                      </span>
                    </div>
                  ))}
                  {projectMembers.length === 0 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                      0
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
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Welcome to KalKorbo
                </h3>
                <p className="text-sm text-gray-500">
                  Select a project from the sidebar or create a new one to start managing your tasks.
                </p>
              </div>
            </div>
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
            <TaskBoard project={selectedProject} initialTaskId={initialTaskId} />
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
          onMembersChange={loadProjectMembers}
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
    </div>
  );
}
