import { createServiceClient } from '@/lib/supabase/server';
import { Dashboard } from '@/components/Dashboard';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from('projects').select('name').eq('id', id).single();
  return {
    title: data ? `${data.name} - Dashboard` : 'Project',
  };
}

export default async function ProjectDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();

  const [projectRes, meetingsRes, tasksRes] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('meetings').select('*').eq('project_id', id).order('date', { ascending: false }),
    supabase.from('tasks').select('status').eq('project_id', id)
  ]);

  if (projectRes.error || !projectRes.data) {
    notFound();
  }

  const project = projectRes.data;
  const meetings = meetingsRes.data || [];
  const tasks = tasksRes.data || [];

  const stats = {
    pending_tasks: tasks.filter((t: { status: string }) => t.status === 'pending').length,
    completed_tasks: tasks.filter((t: { status: string }) => t.status === 'completed').length,
    overdue_tasks: tasks.filter((t: { status: string }) => t.status === 'overdue').length,
    total_tasks: tasks.length,
  };

  return <Dashboard project={project} meetings={meetings} stats={stats} />;
}
