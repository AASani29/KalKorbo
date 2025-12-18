import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { supabase, Project, Task, Profile, ProjectMember } from '../lib/supabase';
import { LogOut, Plus, Folder, Users } from 'lucide-react';
import { CreateProjectModal } from './CreateProjectModal';
import { TaskBoard } from './TaskBoard';
import { ManageMembersModal } from './ManageMembersModal';

export function Dashboard() {
  const { profile, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    }
    setLoading(false);
  };

  const handleProjectCreated = (project: Project) => {
    setProjects([project, ...projects]);
    setSelectedProject(project);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: profile?.avatar_color }}
              >
                {profile?.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedProject?.id === project.id
                    ? 'bg-white text-gray-900 shadow-md border-2'
                    : 'bg-white text-gray-600 hover:shadow-sm border border-gray-200'
                }`}
                style={{
                  borderColor: selectedProject?.id === project.id ? project.color : undefined,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </button>
            ))}
            <button
              onClick={() => setShowCreateProject(true)}
              className="px-6 py-3 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>

          {selectedProject && (
            <button
              onClick={() => setShowManageMembers(true)}
              className="px-4 py-3 rounded-xl font-medium bg-white text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 border border-gray-200"
            >
              <Users className="w-5 h-5" />
              Team
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading projects...</div>
          </div>
        ) : selectedProject ? (
          <TaskBoard project={selectedProject} />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Create your first project to get started</p>
            <button
              onClick={() => setShowCreateProject(true)}
              className="px-6 py-3 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </button>
          </div>
        )}
      </div>

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
        />
      )}
    </div>
  );
}
