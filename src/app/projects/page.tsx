import { createServiceClient } from '@/lib/supabase/server';
import { ProjectsPageClient } from './ProjectsPageClient';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Projects - Nexa',
};

export default async function ProjectsPage() {
  const supabase = createServiceClient();
  
  const { data: projects, error } = await supabase
    .from('project_stats')
    .select('*')
    .order('project_name', { ascending: true });

  if (error) {
    console.error('Error fetching project stats:', error);
  }

  return <ProjectsPageClient initialProjects={projects || []} />;
}
