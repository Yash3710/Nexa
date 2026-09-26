'use client';
import { Task } from '@/lib/types';
import { cn, daysOverdue, priorityColor } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useState } from 'react';

export function TaskTable({ tasks, onTaskUpdate }: { tasks: Task[]; onTaskUpdate: (taskId: string, updates: Partial<Task>) => void }) {
  const sortedTasks = [...tasks].sort((a, b) => {
    const aOverdue = daysOverdue(a.due_date) > 0 && a.status !== 'completed';
    const bOverdue = daysOverdue(b.due_date) > 0 && b.status !== 'completed';
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    const pVal = { high: 3, medium: 2, low: 1 };
    return (pVal[b.priority] || 0) - (pVal[a.priority] || 0);
  });

  if (tasks.length === 0) {
    return <div className="text-center py-8 text-text-muted text-sm border border-border-subtle rounded-lg bg-bg-secondary">No tasks found.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle bg-bg">
      <table className="w-full text-left text-sm text-text-secondary">
        <thead className="bg-bg-secondary border-b border-border-subtle">
          <tr>
            <th className="px-4 py-3 w-10"></th>
            <th className="px-4 py-3 font-medium">Description</th>
            <th className="px-4 py-3 font-medium w-32">Owner</th>
            <th className="px-4 py-3 font-medium w-32">Due Date</th>
            <th className="px-4 py-3 font-medium w-28">Priority</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task) => {
            const isOverdue = daysOverdue(task.due_date) > 0 && task.status !== 'completed';
            return (
              <tr key={task.id} className={cn("border-b border-border-subtle hover:bg-bg-tertiary transition-colors", isOverdue && "border-l-2 border-l-danger")}>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onTaskUpdate(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                    className={cn("w-5 h-5 rounded flex items-center justify-center border", task.status === 'completed' ? "bg-accent border-accent text-white" : "border-border text-transparent hover:border-accent")}
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={task.description}
                    onChange={(e) => onTaskUpdate(task.id, { description: e.target.value })}
                    className={cn("w-full bg-transparent focus:outline-none focus:border-b border-accent", task.status === 'completed' && "line-through text-text-muted")}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={task.owner || ''}
                    onChange={(e) => onTaskUpdate(task.id, { owner: e.target.value })}
                    placeholder="Unassigned"
                    className="w-full bg-transparent focus:outline-none focus:border-b border-accent"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => onTaskUpdate(task.id, { due_date: new Date(e.target.value).toISOString() })}
                    className={cn("bg-transparent focus:outline-none", isOverdue ? "text-danger" : "")}
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={task.priority}
                    onChange={(e) => onTaskUpdate(task.id, { priority: e.target.value as any })}
                    className={cn("text-xs font-medium px-2 py-1 rounded-full bg-transparent border border-border outline-none appearance-none cursor-pointer", priorityColor(task.priority))}
                  >
                    <option value="low" className="bg-bg text-text">Low</option>
                    <option value="medium" className="bg-bg text-text">Medium</option>
                    <option value="high" className="bg-bg text-text">High</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
