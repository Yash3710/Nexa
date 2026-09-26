'use client';
import { useState } from 'react';
import { FileDropzone } from './FileDropzone';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MeetingUpload({ projectId, onComplete }: { projectId: string; onComplete: (meetingId: string) => void }) {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<string>('');

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      let finalTranscript = transcript;
      if (mode === 'upload') {
        if (!file) return;
        setStep('Transcribing audio...');
        const formData = new FormData();
        formData.append('file', file);
        
        const trRes = await fetch('/api/transcribe', { method: 'POST', body: formData });
        if (!trRes.ok) throw new Error('Failed to transcribe');
        const trData = await trRes.json();
        finalTranscript = trData.transcript;
      }
      
      setStep('Analyzing transcript...');
      const anRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: finalTranscript, project_id: projectId, meeting_title: title })
      });
      if (!anRes.ok) throw new Error('Failed to analyze');
      const anData = await anRes.json();
      setStep('Done!');
      onComplete(anData.meeting_id);
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex space-x-2 border-b border-border">
        <button
          onClick={() => setMode('upload')}
          className={cn("pb-2 px-4 text-sm font-medium transition-colors", mode === 'upload' ? "border-b-2 border-accent text-accent" : "text-text-muted hover:text-text")}
        >
          Upload Audio
        </button>
        <button
          onClick={() => setMode('paste')}
          className={cn("pb-2 px-4 text-sm font-medium transition-colors", mode === 'paste' ? "border-b-2 border-accent text-accent" : "text-text-muted hover:text-text")}
        >
          Paste Transcript
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Meeting Title (Optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent text-text"
            placeholder="e.g. Weekly Sync"
          />
        </div>

        {mode === 'upload' ? (
          <FileDropzone onFileSelect={setFile} />
        ) : (
          <div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full h-48 bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent text-text resize-none"
              placeholder="Paste meeting transcript here..."
            />
          </div>
        )}

        {error && <p className="text-danger text-sm">{error}</p>}
        {step && <p className="text-text-secondary text-sm">{step}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || (mode === 'upload' && !file) || (mode === 'paste' && !transcript)}
          className="w-full bg-accent hover:bg-accent-hover text-white rounded-md py-2 text-sm font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
