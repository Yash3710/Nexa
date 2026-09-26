import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServiceClient } from '@/lib/supabase/server';
import { analyzeRequestSchema, analysisResultSchema } from '@/lib/schemas';
import { buildAnalysisPrompt, buildCrossMeetingAnalysisPrompt } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = analyzeRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }
    
    const { transcript, project_id, meeting_title } = parsed.data;
    const supabase = createServiceClient();
    
    // Fetch open tasks for cross-meeting context
    const { data: openTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', project_id)
      .neq('status', 'completed');
      
    if (tasksError) {
      return NextResponse.json({ error: 'Failed to fetch project tasks' }, { status: 500 });
    }
    
    // Build the prompt
    let prompt = '';
    const today = new Date().toISOString().split('T')[0];
    
    if (openTasks && openTasks.length > 0) {
      prompt = buildCrossMeetingAnalysisPrompt(transcript, openTasks, today);
    } else {
      prompt = buildAnalysisPrompt(transcript);
    }
    
    // Call Google Gemini (FREE tier)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
    // Try multiple models in case one is overloaded
    const models = ['gemini-3.8-flash', 'gemini-3.5-flash-lite'];
    let resultText = '';
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });
        const result = await model.generateContent(prompt);
        resultText = result.response.text();
        break; // success, stop trying
      } catch (modelError: any) {
        console.warn(`Model ${modelName} failed:`, modelError.message);
        if (modelName === models[models.length - 1]) throw modelError; // last model, give up
      }
    }
    
    // Parse and validate
    const resultJson = JSON.parse(resultText);
    const validatedResult = analysisResultSchema.parse(resultJson);
    
    // Build MoM JSON from the flat validated result
    const momJson = {
      executive_summary: validatedResult.executive_summary,
      key_decisions: validatedResult.key_decisions,
      discussion_highlights: validatedResult.discussion_highlights,
      risks_and_concerns: validatedResult.risks_and_concerns,
      next_steps: validatedResult.next_steps,
    };
    
    // Store meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        project_id,
        title: meeting_title || 'Untitled Meeting',
        transcript,
        mom_json: momJson,
        date: new Date().toISOString()
      })
      .select()
      .single();
      
    if (meetingError) throw meetingError;
    
    // Store extracted tasks
    const tasksToInsert = validatedResult.tasks.map((task: any) => ({
      ...task,
      project_id,
      meeting_id: meeting.id,
      status: 'pending'
    }));
    
    let createdTasks: any[] = [];
    if (tasksToInsert.length > 0) {
      const { data: t, error: tErr } = await supabase.from('tasks').insert(tasksToInsert).select();
      if (tErr) throw tErr;
      createdTasks = t || [];
    }
    
    // Update resolved tasks from previous meetings
    if (validatedResult.resolved_task_ids && validatedResult.resolved_task_ids.length > 0) {
      const { error: updErr } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .in('id', validatedResult.resolved_task_ids);
      if (updErr) throw updErr;
    }
    
    return NextResponse.json({ meeting_id: meeting.id, mom: momJson, tasks: createdTasks });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze transcript' }, { status: 500 });
  }
}
