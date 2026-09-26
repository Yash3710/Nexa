let isRecording = false;
let currentProjectId = null;
let currentTitle = null;
let timerInterval;
let seconds = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const projectSelect = document.getElementById('project-select');
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const setupForm = document.getElementById('setup-form');
  const recordingBar = document.getElementById('recording-bar');
  const timerDisplay = document.getElementById('rec-timer');
  
  // Load projects from local backend
  try {
    const res = await fetch('http://127.0.0.1:3000/api/projects');
    const data = await res.json();
    
    // The API returns the array directly, so data IS the array
    const projectsArray = Array.isArray(data) ? data : [];
    
    projectSelect.innerHTML = projectsArray.length === 0 
      ? '<option value="">No projects found. Create one first.</option>'
      : projectsArray.map(p => `<option value="${p.project_id || p.id}">${p.project_name || p.name}</option>`).join('');
      
    if (projectsArray.length === 0) startBtn.disabled = true;
  } catch (err) {
    projectSelect.innerHTML = `<option value="">Error: ${err.message}</option>`;
    startBtn.disabled = true;
  }

  // Restore state if popup was closed while recording
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state) => {
    if (state.isRecording) {
      showRecordingUI();
      seconds = state.seconds || 0;
      startTimer();
    }
  });

  // Start Recording
  startBtn.addEventListener('click', () => {
    const projectId = projectSelect.value;
    const title = document.getElementById('meeting-title').value || 'Extension Capture';
    
    if (!projectId) return;

    chrome.runtime.sendMessage({ type: 'START_RECORDING', projectId, title }, (res) => {
      if (res.success) {
        showRecordingUI();
        seconds = 0;
        startTimer();
      }
    });
  });

  // Stop Recording
  stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'STOP_RECORDING' });
    stopTimer();
    recordingBar.classList.add('hidden');
    stopBtn.classList.add('hidden');
    document.getElementById('processing').classList.remove('hidden');
  });

  // Listen for messages from background/offscreen
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'PROCESSING_STARTED') {
      stopTimer();
      recordingBar.classList.add('hidden');
      stopBtn.classList.add('hidden');
      setupForm.classList.add('hidden');
      startBtn.classList.add('hidden');
      document.getElementById('processing').classList.remove('hidden');
    } else if (msg.type === 'PROCESSING_SUCCESS') {
      document.getElementById('processing').classList.add('hidden');
      document.getElementById('success').classList.remove('hidden');
      document.getElementById('view-meeting-link').href = `http://localhost:3000/meetings/${msg.data.meeting_id}`;
    } else if (msg.type === 'PROCESSING_ERROR') {
      document.getElementById('processing').classList.add('hidden');
      const errorEl = document.getElementById('error');
      errorEl.classList.remove('hidden');
      document.getElementById('error-text').textContent = 'Error: ' + msg.error;
    } else if (msg.type === 'NATIVE_STOP') {
      // If user hit "Stop Sharing" on Chrome UI while popup was open
      stopTimer();
    }
  });

  document.getElementById('retry-btn').addEventListener('click', () => {
    document.getElementById('error').classList.add('hidden');
    setupForm.classList.remove('hidden');
    startBtn.classList.remove('hidden');
  });

  function showRecordingUI() {
    setupForm.classList.add('hidden');
    startBtn.classList.add('hidden');
    recordingBar.classList.remove('hidden');
    stopBtn.classList.remove('hidden');
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      seconds++;
      chrome.runtime.sendMessage({ type: 'UPDATE_TIMER', seconds });
      const m = String(Math.floor(seconds / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      timerDisplay.textContent = `${m}:${s}`;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }
});
