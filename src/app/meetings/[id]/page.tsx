import { createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { MeetingPageClient } from './MeetingPageClient';
import { Metadata } from 'next';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from('meetings').select('title, date').eq('id', id).single();
  return {
    title: data ? `${data.title} - ${formatDate(data.date)}` : 'Meeting Details',
  };
}

export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single();

  if (meetingError || !meeting) {
    notFound();
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('meeting_id', id)
    .order('created_at', { ascending: true });

  const mom = meeting.mom_json ? (typeof meeting.mom_json === 'string' ? JSON.parse(meeting.mom_json) : meeting.mom_json) : null;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Link 
          href={`/projects/${meeting.project_id}`} 
          className="p-2 hover:bg-bg-tertiary rounded-full text-text-muted transition-colors inline-flex items-center"
        >
          <ChevronLeft size={20} /> Back to Project
        </Link>
      </div>

      <div className="border-b border-border pb-6 mb-6">
        <h1 className="text-3xl font-bold">{meeting.title}</h1>
        <p className="text-text-muted mt-2">{formatDate(meeting.date)}</p>
      </div>

      <MeetingPageClient initialTasks={tasks || []} mom={mom} />
    </div>
  );
}
