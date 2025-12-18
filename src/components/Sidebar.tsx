import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Users, 
  Bell,
  LogOut,
  UserCircle,
  Home
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Project } from '../lib/supabase';

type SidebarProps = {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  onManageMembers: () => void;
  onShowInvitations: () => void;
  onShowProfile: () => void;
  onGoHome: () => void;
  pendingInvitationsCount: number;
};

export function Sidebar({
  projects,
  selectedProject,
  onSelectProject,
  onCreateProject,
  onManageMembers,
  onShowInvitations,
  onShowProfile,
  onGoHome,
  pendingInvitationsCount,
}: SidebarProps) {
  const { profile, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`relative flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-24' : 'w-72'
      }`}
    >
      {/* Floating Sidebar Container */}
      <div className="absolute inset-0 m-4 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
        {/* Header with Logo */}
        <div className={`border-b border-gray-50 transition-all duration-300 ${isCollapsed ? 'p-3' : 'p-6'}`}>
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-3">
                  <img src="/Daekho.svg" alt="Kando" className="h-14 w-auto" />
                </div>
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-2 hover:bg-brand-50 rounded-xl transition-all duration-200 group"
                  title="Collapse"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-brand-600" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full h-12 flex items-center justify-center hover:bg-brand-50 rounded-2xl transition-all duration-200 group"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-brand-600 group-hover:scale-110 transition-all" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className={`flex-1 overflow-y-auto space-y-6 custom-scrollbar transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          {/* Quick Actions */}
          <div>
            {!isCollapsed && (
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3 px-3">
                Quick Actions
              </h3>
            )}
            <div className="space-y-1">
              <button
                onClick={onShowInvitations}
                className={`w-full flex items-center rounded-xl hover:bg-brand-50 transition-all duration-200 relative group ${
                  isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                }`}
                title="Invitations"
              >
                <div className="relative">
                  <Bell className="w-5 h-5 text-gray-500 group-hover:text-brand-600 transition-colors" />
                  {pendingInvitationsCount > 0 && (
                    <span className={`absolute ${isCollapsed ? '-top-1 -right-1' : '-top-2 -right-2'} w-5 h-5 bg-brand-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm`}>
                      {pendingInvitationsCount}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-brand-700 transition-colors">
                    Invitations
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Projects */}
          <div>
            <div className={`flex items-center mb-3 ${isCollapsed ? 'flex-col gap-2 px-1' : 'justify-between px-3'}`}>
              {!isCollapsed && (
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                  Projects
                </h3>
              )}
              <button
                onClick={onCreateProject}
                className={`hover:bg-brand-600 bg-brand-50 rounded-xl transition-all duration-200 group flex items-center justify-center shadow-sm ${
                  isCollapsed ? 'w-12 h-12' : 'p-2'
                }`}
                title="New Project"
              >
                <Plus className="w-5 h-5 text-brand-600 group-hover:text-white transition-colors" strokeWidth={2.5} />
              </button>
            </div>
            <div className="space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className={`w-full flex items-center rounded-2xl transition-all duration-200 group relative ${
                    selectedProject?.id === project.id
                      ? isCollapsed ? '' : 'shadow-md shadow-gray-200'
                      : 'hover:bg-brand-50 border border-transparent'
                  } ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2.5'}`}
                  style={{ 
                    backgroundColor: (selectedProject?.id === project.id && !isCollapsed) ? project.color : undefined 
                  }}
                  title={isCollapsed ? project.name : undefined}
                >
                  <div
                    className={`rounded-xl flex-shrink-0 transition-all duration-300 flex items-center justify-center font-bold text-lg ${
                      isCollapsed ? 'w-10 h-10' : 'w-8 h-8'
                    }`}
                    style={{ 
                      backgroundColor: selectedProject?.id === project.id 
                        ? (isCollapsed ? project.color : 'rgba(255,255,255,0.2)') 
                         : `${project.color}15`,
                      color: selectedProject?.id === project.id ? 'white' : project.color,
                      border: `1px solid ${selectedProject?.id === project.id 
                        ? (isCollapsed ? 'transparent' : 'rgba(255,255,255,0.3)') 
                        : project.color + '20'}`,
                      boxShadow: (selectedProject?.id === project.id && isCollapsed) ? `0 4px 12px ${project.color}40` : undefined
                    }}
                  >
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  {!isCollapsed && (
                    <span
                      className={`text-sm font-bold truncate transition-colors duration-200 ${
                        selectedProject?.id === project.id
                          ? 'text-white'
                          : 'text-gray-700 group-hover:text-brand-700'
                      }`}
                    >
                      {project.name}
                    </span>
                  )}
                </button>
              ))}
              {projects.length === 0 && !isCollapsed && (
                <p className="text-[11px] text-gray-400 px-3 py-2 text-center font-medium">
                  No active projects
                </p>
              )}
            </div>
          </div>

          {/* Project Actions */}
          {selectedProject && (
            <div>
              {!isCollapsed && (
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3 px-3">
                  Management
                </h3>
              )}
              <div className="space-y-1">
                <button
                  onClick={onManageMembers}
                  className={`w-full flex items-center rounded-xl hover:bg-brand-50 transition-all duration-200 group ${
                    isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
                  }`}
                  title="Team Members"
                >
                  <div className={`flex items-center justify-center rounded-xl transition-colors ${
                    isCollapsed ? 'w-10 h-10 bg-gray-50 group-hover:bg-brand-100/50' : ''
                  }`}>
                    <Users className="w-5 h-5 text-gray-500 group-hover:text-brand-600 transition-colors" />
                  </div>
                  {!isCollapsed && (
                    <span className="text-sm font-semibold text-gray-600 group-hover:text-brand-700 transition-colors">
                      Team Members
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section: Home & Profile */}
        <div className={`border-t border-gray-50 bg-gray-50/30 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'} space-y-2`}>
          {/* Home Button */}
          <button
            onClick={onGoHome}
            className={`w-full flex items-center rounded-xl hover:bg-brand-100/50 transition-all duration-200 group ${
              isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
            }`}
            title="Go to Home"
          >
            <div className={`flex items-center justify-center rounded-xl transition-colors ${
              isCollapsed ? 'w-10 h-10 bg-white shadow-sm' : ''
            }`}>
              <Home className="w-5 h-5 text-gray-500 group-hover:text-brand-600 transition-colors" />
            </div>
            {!isCollapsed && (
              <span className="text-sm font-bold text-gray-700 group-hover:text-brand-700 transition-colors">
                Home
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className={`flex items-center gap-3 ${isCollapsed ? 'flex-col' : ''} pt-2 border-t border-gray-100/50`}>
            <button
              onClick={onShowProfile}
              className="relative group flex-shrink-0"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm overflow-hidden border-2 border-transparent group-hover:border-brand-600 transition-all"
                style={{ 
                  backgroundColor: profile?.avatar_color || '#0891b2'
                }}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profile?.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-lg shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <UserCircle className="w-3 h-3 text-brand-600" />
              </div>
            </button>
            {!isCollapsed ? (
              <>
                <button 
                  onClick={onShowProfile}
                  className="flex-1 min-w-0 text-left group"
                >
                  <p className="text-sm font-bold text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                    {profile?.full_name}
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium truncate">{profile?.email}</p>
                </button>
                <button
                  onClick={signOut}
                  className="p-2 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                </button>
              </>
            ) : (
              <button
                onClick={signOut}
                className="w-full p-2 hover:bg-red-50 rounded-xl transition-all duration-200 group flex justify-center"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
