'use client';

import { useState } from 'react';
import { MomDisplay } from '@/components/MomDisplay';
import { TaskTable } from '@/components/TaskTable';
import { Task, MomJson } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface MeetingPageClientProps {
  initialTasks: Task[];
  mom: MomJson | null;
}

export function MeetingPageClient({ initialTasks, mom }: MeetingPageClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const router = useRouter();

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Optimistic update
      setTasks(current => 
        current.map(t => t.id === taskId ? { ...t, ...updates } : t)
      );

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error('Failed to update task');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className="space-y-8">
      {mom ? (
        <MomDisplay mom={mom} />
      ) : (
        <div className="bg-bg-secondary p-6 rounded-lg text-center border border-border border-dashed text-text-muted">
          No Minutes of Meeting available yet.
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Action Items</h2>
        <TaskTable tasks={tasks} onTaskUpdate={handleTaskUpdate} />
      </div>
    </div>
  );
}
