import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest) {
  try {
    // Use Groq's OpenAI-compatible API for FREE Whisper transcription
    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 25MB limit' }, { status: 400 });
    }
    
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'video/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/webm', 'video/webm'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|mp4|wav|m4a|webm)$/i)) {
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
    }

    const response = await groq.audio.transcriptions.create({
      file: file,
      model: 'whisper-large-v3-turbo', // Groq's free Whisper model
    });

    return NextResponse.json({ transcript: response.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Failed to transcribe file' }, { status: 500 });
  }
}
