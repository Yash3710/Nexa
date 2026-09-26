'use client';
import { useState, useRef } from 'react';
import { UploadCloud, FileAudio, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FileDropzone({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setError(null);
    if (f.size > 25 * 1024 * 1024) {
      setError('File size must be less than 25MB');
      return;
    }
    const validTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-m4a', 'audio/webm', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(f.type) && !f.name.match(/\.(mp3|mp4|wav|m4a|webm)$/i)) {
      setError('Invalid file type');
      return;
    }
    setFile(f);
    onFileSelect(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors",
            dragOver ? "border-accent bg-accent/10" : "border-border-subtle hover:border-border",
            "bg-bg-secondary text-text-secondary"
          )}
        >
          <UploadCloud className="w-10 h-10 mb-4 text-text-muted" />
          <p className="text-sm font-medium">Click to upload or drag and drop</p>
          <p className="text-xs text-text-muted mt-1">MP3, MP4, WAV, M4A, WEBM (max. 25MB)</p>
          <input
            type="file"
            ref={inputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
            accept=".mp3,.mp4,.wav,.m4a,.webm,audio/*,video/*"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg border border-border">
          <div className="flex items-center space-x-3">
            <FileAudio className="w-8 h-8 text-accent" />
            <div>
              <p className="text-sm font-medium text-text">{file.name}</p>
              <p className="text-xs text-text-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
          <button onClick={() => setFile(null)} className="p-1 hover:bg-bg-tertiary rounded text-text-muted hover:text-text">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {error && <p className="text-sm text-danger mt-2">{error}</p>}
    </div>
  );
}
