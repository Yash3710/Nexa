import { Task } from '@/lib/types';
import { daysOverdue, formatDate, priorityColor } from '@/lib/utils';
import { AlertCircle, Clock, Lightbulb, Play } from 'lucide-react';

export function PreMeetingBrief({ tasks, decisions, projectName }: { tasks: Task[], decisions: string[], projectName: string }) {
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const overdueTasks = pendingTasks.filter(t => daysOverdue(t.due_date) > 0).sort((a, b) => daysOverdue(b.due_date) - daysOverdue(a.due_date));
  const otherPendingTasks = pendingTasks.filter(t => daysOverdue(t.due_date) <= 0).sort((a, b) => {
    const pVal = { high: 3, medium: 2, low: 1 };
    return (pVal[b.priority] || 0) - (pVal[a.priority] || 0);
  });

  return (
    <div className="max-w-3xl mx-auto bg-bg-secondary border border-border-subtle rounded-xl p-8 space-y-8">
      <div className="border-b border-border-subtle pb-6 text-center">
        <h1 className="text-2xl font-semibold text-text">Pre-Meeting Brief</h1>
        <p className="text-text-secondary mt-2">{projectName}</p>
      </div>

      {overdueTasks.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-danger flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Overdue Tasks</span>
          </h2>
          <div className="space-y-2">
            {overdueTasks.map(task => (
              <div key={task.id} className="p-3 bg-bg border-l-2 border-danger rounded text-sm flex justify-between items-center">
                <div>
                  <p className="font-medium text-text">{task.description}</p>
                  <p className="text-text-muted text-xs mt-1">{task.owner || 'Unassigned'} • Overdue by {daysOverdue(task.due_date)} days</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {otherPendingTasks.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-text flex items-center space-x-2">
            <Clock className="w-5 h-5 text-warning" />
            <span>Pending Tasks</span>
          </h2>
          <div className="space-y-2">
            {otherPendingTasks.map(task => (
              <div key={task.id} className="p-3 bg-bg border border-border-subtle rounded text-sm flex justify-between items-center">
                <div>
                  <p className="font-medium text-text">{task.description}</p>
                  <p className="text-text-muted text-xs mt-1">{task.owner || 'Unassigned'} • Due {formatDate(task.due_date)}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${priorityColor(task.priority)}`}>{task.priority}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {decisions.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-text flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-accent" />
            <span>Unresolved Decisions</span>
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
            {decisions.map((decision, i) => (
              <li key={i}>{decision}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="pt-8 border-t border-border-subtle flex justify-center">
        <button className="bg-accent hover:bg-accent-hover text-white rounded-md px-6 py-2.5 text-sm font-medium transition-colors flex items-center space-x-2">
          <Play className="w-4 h-4 fill-current" />
          <span>Start New Meeting</span>
        </button>
      </div>
    </div>
  );
}
