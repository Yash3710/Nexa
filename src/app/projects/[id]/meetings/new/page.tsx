'use client';

import { use } from 'react';
import { MeetingUpload } from '@/components/MeetingUpload';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewMeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const handleComplete = (meetingId: string) => {
    router.push(`/meetings/${meetingId}`);
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <Link 
          href={`/projects/${id}`} 
          className="p-2 hover:bg-bg-tertiary rounded-full text-text-muted transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">New Meeting</h1>
      </div>
      
      <div className="bg-bg-secondary border border-border rounded-lg p-6">
        <MeetingUpload projectId={id} onComplete={handleComplete} />
      </div>
    </div>
  );
}
