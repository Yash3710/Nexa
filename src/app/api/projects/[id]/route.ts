import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();
    
    const [projectRes, meetingsRes, statsRes] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('meetings').select('*').eq('project_id', id).order('date', { ascending: false }),
      supabase.from('project_stats').select('*').eq('project_id', id).single()
    ]);
    
    if (projectRes.error) throw projectRes.error;
    
    return NextResponse.json({
      project: projectRes.data,
      meetings: meetingsRes.data || [],
      stats: statsRes.data || { pending: 0, completed: 0, overdue: 0, project_id: id }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
