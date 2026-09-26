import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();
    
    const [meetingRes, tasksRes] = await Promise.all([
      supabase.from('meetings').select('*').eq('id', id).single(),
      supabase.from('tasks').select('*').eq('meeting_id', id)
    ]);
    
    if (meetingRes.error) throw meetingRes.error;
    
    return NextResponse.json({
      meeting: meetingRes.data,
      tasks: tasksRes.data || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch meeting' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();
    const { error } = await supabase.from('meetings').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
  }
}
