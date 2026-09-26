let recorder;
let audioChunks = [];

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'START_OFFSCREEN_RECORDING') {
    try {
      // Get display media will prompt the user to select the meeting tab/window to capture audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: true
      });
      
      // We only need the audio tracks
      recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunks = [];
      
      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      
      // When user manually stops sharing from Chrome UI
      stream.getVideoTracks()[0].onended = () => {
        if (recorder.state === 'recording') recorder.stop();
      };

      recorder.start(1000); // chunk every second
    } catch (e) {
      console.error('Failed to get media:', e);
      chrome.runtime.sendMessage({ type: 'PROCESSING_ERROR', error: 'Microphone/Screen permission denied' });
    }
  }

  if (message.type === 'STOP_OFFSCREEN_RECORDING') {
    if (!recorder || recorder.state === 'inactive') return;
    
    recorder.onstop = async () => {
      // Clean up tracks
      recorder.stream.getTracks().forEach(t => t.stop());

      // Create audio blob
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const file = new File([audioBlob], 'capture.webm', { type: 'audio/webm' });
      
      // Send to server
      uploadAndAnalyze(file, message.projectId, message.title);
    };
    
    recorder.stop();
  }
});

async function uploadAndAnalyze(file, projectId, title) {
  try {
    // 1. Transcribe (via Localhost API which calls Groq)
    const formData = new FormData();
    formData.append('file', file);
    const transcribeRes = await fetch('http://localhost:3000/api/transcribe', {
      method: 'POST',
      body: formData
    });
    
    const transcribeData = await transcribeRes.json();
    if (!transcribeRes.ok) throw new Error(transcribeData.error || 'Transcription failed');

    // 2. Analyze (via Localhost API which calls Gemini)
    const analyzeRes = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: transcribeData.transcript,
        project_id: projectId,
        meeting_title: title
      })
    });
    
    const analyzeData = await analyzeRes.json();
    if (!analyzeRes.ok) throw new Error(analyzeData.error || 'Analysis failed');
    
    chrome.runtime.sendMessage({ type: 'PROCESSING_SUCCESS', data: analyzeData });
  } catch (err) {
    chrome.runtime.sendMessage({ type: 'PROCESSING_ERROR', error: err.message });
  } finally {
    // Close offscreen document when done
    window.close();
  }
}
