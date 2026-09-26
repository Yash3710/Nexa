let recorder;
let audioChunks = [];
let activeProjectId = null;
let activeTitle = null;
let audioCtx;
let globalStreams = [];

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'START_OFFSCREEN_RECORDING') {
    activeProjectId = message.projectId;
    activeTitle = message.title;
    
    try {
      audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      globalStreams = [];
      
      // 1. Capture the Meeting Tab Audio (without screen share prompts)
      if (message.streamId) {
        const tabStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            mandatory: {
              chromeMediaSource: 'tab',
              chromeMediaSourceId: message.streamId
            }
          },
          video: false
        });
        globalStreams.push(tabStream);
        const tabSource = audioCtx.createMediaStreamSource(tabStream);
        tabSource.connect(audioCtx.destination); // Play it back to you so you can hear the meeting!
        tabSource.connect(dest);                 // Route it to our recorder
      }

      // 2. Capture Your Microphone (so your own voice is in the MoM)
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        globalStreams.push(micStream);
        const micSource = audioCtx.createMediaStreamSource(micStream);
        micSource.connect(dest); // Route it to our recorder (but NOT destination, or you'd hear an echo)
      } catch (micErr) {
        console.warn("Could not get microphone. Recording tab only.");
      }

      // Start recording the mixed audio!
      recorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm' });
      audioChunks = [];
      
      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      
      recorder.onstop = async () => {
        globalStreams.forEach(s => s.getTracks().forEach(t => t.stop()));
        if (audioCtx) audioCtx.close();
        
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const file = new File([audioBlob], 'capture.webm', { type: 'audio/webm' });
        
        chrome.runtime.sendMessage({ type: 'PROCESSING_STARTED' });
        uploadAndAnalyze(file, activeProjectId, activeTitle);
      };
      
      recorder.start(1000);
    } catch (e) {
      console.error('Failed to start recording:', e);
      chrome.runtime.sendMessage({ type: 'PROCESSING_ERROR', error: 'Failed to capture audio.' });
    }
  }

  if (message.type === 'STOP_OFFSCREEN_RECORDING') {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  }
});

async function uploadAndAnalyze(file, projectId, title) {
  try {
    // 1. Transcribe (via Localhost API which calls Groq)
    const formData = new FormData();
    formData.append('file', file);
    const transcribeRes = await fetch('http://127.0.0.1:3000/api/transcribe', {
      method: 'POST',
      body: formData
    });
    
    const transcribeData = await transcribeRes.json();
    if (!transcribeRes.ok) throw new Error(transcribeData.error || 'Transcription failed');

    // 2. Analyze (via Localhost API which calls Gemini)
    const analyzeRes = await fetch('http://127.0.0.1:3000/api/analyze', {
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
