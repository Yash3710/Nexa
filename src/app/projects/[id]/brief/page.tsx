import { createServiceClient } from '@/lib/supabase/server';
import { PreMeetingBrief } from '@/components/PreMeetingBrief';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from('projects').select('name').eq('id', id).single();
  return {
    title: data ? `Pre-Meeting Brief - ${data.name}` : 'Pre-Meeting Brief',
  };
}

export default async function PreMeetingBriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('name')
    .eq('id', id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // Update overdue tasks
  const today = new Date().toISOString().split('T')[0];
  
  await supabase
    .from('tasks')
    .update({ status: 'overdue' })
    .eq('project_id', id)
    .eq('status', 'pending')
    .lt('due_date', today);

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', id)
    .in('status', ['pending', 'overdue'])
    .order('due_date', { ascending: true });

  const { data: meetings } = await supabase
    .from('meetings')
    .select('mom_json')
    .eq('project_id', id)
    .order('date', { ascending: false });

  // Extract key decisions
  const allDecisions = [];
  if (meetings) {
    for (const meeting of meetings) {
      if (meeting.mom_json) {
        const mom = typeof meeting.mom_json === 'string' ? JSON.parse(meeting.mom_json) : meeting.mom_json;
        if (mom.key_decisions && Array.isArray(mom.key_decisions)) {
          allDecisions.push(...mom.key_decisions);
        }
      }
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Link 
          href={`/projects/${id}`} 
          className="p-2 hover:bg-bg-tertiary rounded-full text-text-muted transition-colors inline-flex items-center"
        >
          <ChevronLeft size={20} /> Back to Project
        </Link>
      </div>

      <PreMeetingBrief 
        tasks={tasks || []} 
        decisions={allDecisions} 
        projectName={project.name} 
      />
    </div>
  );
}
