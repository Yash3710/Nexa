let currentSeconds = 0;
let timerInterval;

document.addEventListener('DOMContentLoaded', async () => {
  const projectSelect = document.getElementById('project-select');
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const setupForm = document.getElementById('setup-form');
  const recordingBar = document.getElementById('recording-bar');
  const timerDisplay = document.getElementById('rec-timer');
  const processingUI = document.getElementById('processing');
  const successUI = document.getElementById('success');
  const errorUI = document.getElementById('error');
  
  // Load projects from local backend
  try {
    const res = await fetch('http://127.0.0.1:3000/api/projects');
    const data = await res.json();
    const projectsArray = Array.isArray(data) ? data : [];
    
    projectSelect.innerHTML = projectsArray.length === 0 
      ? '<option value="">No projects found.</option>'
      : projectsArray.map(p => `<option value="${p.project_id || p.id}">${p.project_name || p.name}</option>`).join('');
      
    if (projectsArray.length === 0) startBtn.disabled = true;
  } catch (err) {
    projectSelect.innerHTML = `<option value="">Error: ${err.message}</option>`;
    startBtn.disabled = true;
  }

  // Restore true state
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (stateData) => {
    if (stateData.state === 'recording') {
      currentSeconds = Math.floor((Date.now() - stateData.startTime) / 1000);
      showRecordingUI();
      startTimer();
    } else if (stateData.state === 'processing') {
      showProcessingUI();
    } else if (stateData.state === 'success') {
      showSuccessUI(stateData.meetingId);
    } else if (stateData.state === 'error') {
      showErrorUI(stateData.error);
    } else {
      showSetupUI();
    }
  });

  // Actions
  startBtn.addEventListener('click', async () => {
    const projectId = projectSelect.value;
    const title = document.getElementById('meeting-title').value || 'Extension Capture';
    if (!projectId) return;

    // FORCE MICROPHONE PERMISSION PROMPT
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop it immediately, we just needed the permission granted
      micStream.getTracks().forEach(t => t.stop());
    } catch (err) {
      alert("Microphone access is required to record your voice! Please allow it.");
      return;
    }

    chrome.runtime.sendMessage({ type: 'START_RECORDING', projectId, title }, (res) => {
      if (res.success) {
        currentSeconds = 0;
        showRecordingUI();
        startTimer();
      } else {
        alert("Error starting recording: " + res.error);
      }
    });
  });

  stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'STOP_OFFSCREEN_RECORDING' }); // goes straight to offscreen
    stopTimer();
    showProcessingUI();
  });

  document.getElementById('retry-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'RESET_STATE' });
    showSetupUI();
  });

  // Listeners for live updates while popup is open
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'PROCESSING_STARTED') {
      stopTimer();
      showProcessingUI();
    } else if (msg.type === 'PROCESSING_SUCCESS') {
      showSuccessUI(msg.data.meeting_id);
    } else if (msg.type === 'PROCESSING_ERROR') {
      showErrorUI(msg.error);
    } else if (msg.type === 'NATIVE_STOP') {
      stopTimer();
    }
  });

  // UI Helpers
  function hideAll() {
    setupForm.classList.add('hidden');
    startBtn.classList.add('hidden');
    recordingBar.classList.add('hidden');
    stopBtn.classList.add('hidden');
    processingUI.classList.add('hidden');
    successUI.classList.add('hidden');
    errorUI.classList.add('hidden');
  }

  function showSetupUI() { hideAll(); setupForm.classList.remove('hidden'); startBtn.classList.remove('hidden'); }
  function showRecordingUI() { hideAll(); recordingBar.classList.remove('hidden'); stopBtn.classList.remove('hidden'); }
  function showProcessingUI() { hideAll(); processingUI.classList.remove('hidden'); }
  function showSuccessUI(id) { hideAll(); successUI.classList.remove('hidden'); document.getElementById('view-meeting-link').href = `http://127.0.0.1:3000/meetings/${id}`; }
  function showErrorUI(errText) { hideAll(); errorUI.classList.remove('hidden'); document.getElementById('error-text').textContent = 'Error: ' + errText; }

  function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      currentSeconds++;
      updateTimerDisplay();
    }, 1000);
  }

  function stopTimer() { clearInterval(timerInterval); }
  
  function updateTimerDisplay() {
    const m = String(Math.floor(currentSeconds / 60)).padStart(2, '0');
    const s = String(currentSeconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
  }
});
