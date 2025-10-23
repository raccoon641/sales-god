// Popup script
let isRecording = false;

// Load initial state
document.addEventListener('DOMContentLoaded', async () => {
  await updateStatus();
  
  // Check if we're on Google Meet
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.url && tab.url.includes('meet.google.com')) {
    document.getElementById('meetingStatus').textContent = 'In Google Meet';
  }
  
  // Load user settings
  const settings = await chrome.storage.sync.get(['userId', 'apiUrl']);
  if (settings.userId) {
    document.getElementById('userId').textContent = settings.userId;
  }
});

// Update status from background script
async function updateStatus() {
  const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
  if (response) {
    isRecording = response.isRecording;
    updateUI();
  }
}

function updateUI() {
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  
  if (isRecording) {
    statusIndicator.classList.remove('inactive');
    statusIndicator.classList.add('active');
    statusText.textContent = 'Recording';
    statusText.classList.add('recording');
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
  } else {
    statusIndicator.classList.remove('active');
    statusIndicator.classList.add('inactive');
    statusText.textContent = 'Ready';
    statusText.classList.remove('recording');
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
  }
}

// Start recording
document.getElementById('startBtn').addEventListener('click', async () => {
  // Check if user ID is configured
  const settings = await chrome.storage.sync.get(['userId', 'apiUrl']);
  if (!settings.userId) {
    alert('Please configure your User ID in settings first!');
    chrome.runtime.openOptionsPage();
    return;
  }
  
  // Check if we're on Google Meet
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url || !tab.url.includes('meet.google.com')) {
    alert('Please open a Google Meet tab first!');
    return;
  }
  
  // Start recording
  const response = await chrome.runtime.sendMessage({ 
    action: 'startRecording',
    tabId: tab.id
  });
  
  if (response && response.success) {
    isRecording = true;
    updateUI();
  } else {
    alert('Failed to start recording: ' + (response?.error || 'Unknown error'));
  }
});

// Stop recording
document.getElementById('stopBtn').addEventListener('click', async () => {
  const response = await chrome.runtime.sendMessage({ action: 'stopRecording' });
  
  if (response && response.success) {
    isRecording = false;
    updateUI();
    alert('Recording stopped and uploaded successfully!');
  } else {
    alert('Failed to stop recording: ' + (response?.error || 'Unknown error'));
  }
});

// Open settings
document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Listen for status updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'statusUpdate') {
    isRecording = request.isRecording;
    updateUI();
  }
});

