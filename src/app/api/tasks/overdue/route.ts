import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServiceClient();
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('tasks')
      .update({ status: 'overdue' })
      .eq('status', 'pending')
      .lt('due_date', today)
      .select();
      
    if (error) throw error;
    
    return NextResponse.json({ updated_count: data ? data.length : 0 });
  } catch (error) {
    console.error('Failed to update overdue tasks:', error);
    return NextResponse.json({ error: 'Failed to update overdue tasks' }, { status: 500 });
  }
}
