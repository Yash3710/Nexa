import { formatDate } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

// Works with both Project + counts and project_stats view results
interface ProjectCardData {
  id?: string;
  project_id?: string;
  name?: string;
  project_name?: string;
  created_at?: string;
  total_tasks?: number;
  pending_tasks?: number;
  completed_tasks?: number;
  overdue_tasks?: number;
  meeting_count?: number;
}

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const id = project.id || project.project_id || '';
  const name = project.name || project.project_name || 'Untitled';
  const totalTasks = project.total_tasks || 0;
  const safeDivisor = totalTasks || 1;
  const compPct = ((project.completed_tasks || 0) / safeDivisor) * 100;
  const pendPct = ((project.pending_tasks || 0) / safeDivisor) * 100;
  const overPct = ((project.overdue_tasks || 0) / safeDivisor) * 100;

  return (
    <Link href={`/projects/${id}`}>
      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5 hover:border-border transition-colors cursor-pointer flex flex-col h-full group">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-text group-hover:text-accent transition-colors">{name}</h3>
          <span className="text-xs bg-bg-tertiary text-text-secondary px-2 py-1 rounded-full flex items-center">
            {project.meeting_count || 0} meetings
          </span>
        </div>
        
        <div className="mt-auto space-y-4">
          <div className="flex items-center text-xs text-text-muted space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created {formatDate(project.created_at ?? null)}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Task Health</span>
              <span>{project.completed_tasks || 0}/{project.total_tasks || 0} completed</span>
            </div>
            <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden flex">
              <div style={{ width: `${compPct}%` }} className="bg-success h-full" />
              <div style={{ width: `${pendPct}%` }} className="bg-warning h-full" />
              <div style={{ width: `${overPct}%` }} className="bg-danger h-full" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
