'use client';

import { useState } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export function ProjectsPageClient({ initialProjects }: { initialProjects: any[] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const router = useRouter();

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName }),
      });
      if (res.ok) {
        setIsCreating(false);
        setNewProjectName('');
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium inline-flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary p-6 rounded-lg shadow-lg w-full max-w-md border border-border">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Project Name</label>
                <input
                  id="name"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-md focus:outline-none focus:border-accent text-text"
                  placeholder="e.g. Q4 Product Launch"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setNewProjectName(''); }}
                  className="px-4 py-2 hover:bg-bg-tertiary rounded-md text-sm font-medium text-text-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {initialProjects.length === 0 ? (
        <div className="text-center py-16 text-text-muted bg-bg-secondary/50 rounded-lg border border-border border-dashed">
          <p className="text-lg mb-2">No projects yet</p>
          <p className="text-sm">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialProjects.map((project: any) => (
            <ProjectCard key={project.project_id || project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
