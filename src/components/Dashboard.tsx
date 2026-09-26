import { Project, Meeting } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Plus, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Dashboard({ 
  project, 
  meetings, 
  stats 
}: { 
  project: Project; 
  meetings: Meeting[]; 
  stats: { pending_tasks: number, completed_tasks: number, overdue_tasks: number, total_tasks: number } 
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">{project.name}</h1>
          <p className="text-sm text-text-muted mt-1">Project Dashboard</p>
        </div>
        <div className="flex space-x-3">
          <Link href={`/projects/${project.id}/brief`}>
            <button className="px-4 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle rounded-md text-sm font-medium text-text transition-colors flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>View Brief</span>
            </button>
          </Link>
          <Link href={`/projects/${project.id}/meetings/new`}>
            <button className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Meeting</span>
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={CheckCircle2} title="Completed Tasks" value={stats.completed_tasks} color="text-success" />
        <StatCard icon={Clock} title="Pending Tasks" value={stats.pending_tasks} color="text-warning" />
        <StatCard icon={AlertCircle} title="Overdue Tasks" value={stats.overdue_tasks} color="text-danger" />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium text-text">Recent Meetings</h2>
        {meetings.length === 0 ? (
          <div className="p-8 text-center bg-bg-secondary border border-border-subtle rounded-xl text-text-muted text-sm">
            No meetings yet. Start by creating a new meeting.
          </div>
        ) : (
          <div className="bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
            {meetings.map((meeting, i) => (
              <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                <div className={cn("p-4 flex items-center justify-between hover:bg-bg-tertiary transition-colors cursor-pointer", i !== meetings.length - 1 && "border-b border-border-subtle")}>
                  <div>
                    <h3 className="font-medium text-text text-sm">{meeting.title || 'Untitled Meeting'}</h3>
                    <p className="text-xs text-text-muted mt-1">{formatDate(meeting.created_at)}</p>
                  </div>
                  <FileText className="w-4 h-4 text-text-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }: { icon: any, title: string, value: number, color: string }) {
  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5 flex items-center space-x-4">
      <div className={cn("p-3 rounded-lg bg-bg-tertiary", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-text-muted text-xs font-medium mb-1">{title}</p>
        <p className="text-2xl font-semibold text-text">{value}</p>
      </div>
    </div>
  );
}
