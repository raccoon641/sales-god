// Content script for Google Meet
console.log('Sales God content script loaded');

// Inject UI indicator when recording
let recordingIndicator = null;

function showRecordingIndicator() {
  if (recordingIndicator) return;
  
  recordingIndicator = document.createElement('div');
  recordingIndicator.id = 'sales-god-indicator';
  recordingIndicator.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 8px;
    ">
      <span style="
        width: 8px;
        height: 8px;
        background: #ef4444;
        border-radius: 50%;
        animation: pulse 2s infinite;
      "></span>
      <span>Sales God Recording</span>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    </style>
  `;
  document.body.appendChild(recordingIndicator);
}

function hideRecordingIndicator() {
  if (recordingIndicator) {
    recordingIndicator.remove();
    recordingIndicator = null;
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showIndicator') {
    showRecordingIndicator();
    sendResponse({ success: true });
  } else if (request.action === 'hideIndicator') {
    hideRecordingIndicator();
    sendResponse({ success: true });
  } else if (request.action === 'getMeetingInfo') {
    // Extract meeting code and title
    const meetingCode = window.location.pathname.split('/').pop();
    const titleElement = document.querySelector('[data-meeting-title]');
    const title = titleElement ? titleElement.textContent : 'Untitled Meeting';
    
    sendResponse({
      meetingCode,
      title,
      url: window.location.href
    });
  }
  return true;
});

// Detect when user joins/leaves meeting
const observer = new MutationObserver(() => {
  const leaveButton = document.querySelector('[aria-label*="Leave call"], [aria-label*="End call"]');
  if (leaveButton) {
    // User is in a call
    try {
      chrome.runtime.sendMessage({ action: 'inMeeting', inMeeting: true });
    } catch (error) {
      // Extension context invalidated - page needs refresh after extension reload
      console.log('Extension context invalidated. Please refresh the page.');
      observer.disconnect();
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

