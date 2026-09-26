let appState = 'idle'; // idle, recording, processing, success, error
let currentProjectId = null;
let currentTitle = null;
let startTime = null;
let lastMeetingId = null;
let lastError = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_RECORDING') {
    currentProjectId = message.projectId;
    currentTitle = message.title;
    appState = 'recording';
    startTime = Date.now();
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        appState = 'error';
        lastError = "No active tab to record.";
        sendResponse({ success: false });
        return;
      }
      
      chrome.tabCapture.getMediaStreamId({ targetTabId: tabs[0].id }, (streamId) => {
        setupOffscreenDocument('offscreen.html').then(() => {
          chrome.runtime.sendMessage({ 
            type: 'START_OFFSCREEN_RECORDING', 
            projectId: currentProjectId, 
            title: currentTitle,
            streamId: streamId
          });
          sendResponse({ success: true });
        });
      });
    });
    
    return true; 
  }
  
  if (message.type === 'GET_STATE') {
    sendResponse({
      state: appState,
      startTime: startTime,
      meetingId: lastMeetingId,
      error: lastError
    });
    return true;
  }

  // State transitions from offscreen events
  if (message.type === 'PROCESSING_STARTED') appState = 'processing';
  
  if (message.type === 'PROCESSING_SUCCESS') {
    appState = 'success';
    lastMeetingId = message.data.meeting_id;
  }
  
  if (message.type === 'PROCESSING_ERROR') {
    appState = 'error';
    lastError = message.error;
  }
  
  if (message.type === 'RESET_STATE') {
    appState = 'idle';
  }
});

async function setupOffscreenDocument(path) {
  const existingContexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
  if (existingContexts.length > 0) return;
  await chrome.offscreen.createDocument({
    url: path,
    reasons: ['USER_MEDIA'],
    justification: 'Recording meeting audio'
  });
}
