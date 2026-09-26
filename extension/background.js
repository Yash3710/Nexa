let isRecording = false;
let currentProjectId = null;
let currentTitle = null;
let currentSeconds = 0;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_RECORDING') {
    currentProjectId = message.projectId;
    currentTitle = message.title;
    isRecording = true;
    currentSeconds = 0;
    
    setupOffscreenDocument('offscreen.html').then(() => {
      chrome.runtime.sendMessage({ type: 'START_OFFSCREEN_RECORDING' });
      sendResponse({ success: true });
    });
    return true; // Keep channel open for async
  }
  
  if (message.type === 'STOP_RECORDING') {
    chrome.runtime.sendMessage({ 
      type: 'STOP_OFFSCREEN_RECORDING', 
      projectId: currentProjectId, 
      title: currentTitle 
    });
    isRecording = false;
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'GET_STATE') {
    sendResponse({ isRecording, seconds: currentSeconds });
    return true;
  }

  if (message.type === 'UPDATE_TIMER') {
    currentSeconds = message.seconds;
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
