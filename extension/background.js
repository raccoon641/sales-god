// Background service worker
let recordingState = {
  isRecording: false,
  mediaRecorder: null,
  audioChunks: [],
  streamId: null,
  tabId: null,
  meetingInfo: null,
  transcription: []
};

// Handle messages from popup and content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStatus') {
    sendResponse({ isRecording: recordingState.isRecording });
  } else if (request.action === 'startRecording') {
    startRecording(request.tabId).then(sendResponse);
    return true;
  } else if (request.action === 'stopRecording') {
    stopRecording().then(sendResponse);
    return true;
  } else if (request.action === 'inMeeting') {
    // Meeting status update from content script
    sendResponse({ success: true });
  }
  return true;
});

async function startRecording(tabId) {
  try {
    if (recordingState.isRecording) {
      return { success: false, error: 'Already recording' };
    }
    
    // Get meeting info from content script
    const meetingInfo = await chrome.tabs.sendMessage(tabId, { action: 'getMeetingInfo' });
    recordingState.meetingInfo = meetingInfo;
    recordingState.tabId = tabId;
    
    // Capture tab audio
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: tabId
    });
    
    recordingState.streamId = streamId;
    
    // Create offscreen document for audio processing
    await createOffscreenDocument();
    
    // Wait longer for offscreen document to be fully ready
    console.log('Waiting for offscreen document to initialize...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Send stream ID to offscreen document with retry logic
    let retries = 5;
    let captureStarted = false;
    let lastError = null;
    
    while (retries > 0 && !captureStarted) {
      try {
        console.log(`Attempting to start capture (attempt ${6 - retries}/5)...`);
        const result = await chrome.runtime.sendMessage({
          action: 'startCapture',
          streamId: streamId
        });
        
        console.log('Start capture result:', result);
        
        if (result && result.success) {
          captureStarted = true;
          console.log('Capture started successfully!');
        } else {
          throw new Error(result?.error || 'Unknown error');
        }
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${6 - retries} failed:`, error.message);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    if (!captureStarted) {
      throw new Error(`Failed to start recording: ${lastError?.message || 'Could not connect to recorder'}. Please try: 1) Reload the extension, 2) Refresh the Google Meet page, 3) Try again.`);
    }
    
    recordingState.isRecording = true;
    recordingState.audioChunks = [];
    recordingState.transcription = [];
    
    // Show indicator on Meet page
    await chrome.tabs.sendMessage(tabId, { action: 'showIndicator' });
    
    console.log('Recording started for meeting:', meetingInfo.meetingCode);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to start recording:', error);
    return { success: false, error: error.message };
  }
}

async function stopRecording() {
  try {
    if (!recordingState.isRecording) {
      return { success: false, error: 'Not recording' };
    }
    
    // Stop capture in offscreen document
    const result = await chrome.runtime.sendMessage({
      action: 'stopCapture'
    });
    
    recordingState.isRecording = false;
    
    // Hide indicator
    if (recordingState.tabId) {
      await chrome.tabs.sendMessage(recordingState.tabId, { action: 'hideIndicator' });
    }
    
    // Get audio data from offscreen document
    const audioData = result.audioData;
    const transcription = result.transcription;
    
    // Upload to server
    await uploadRecording(audioData, transcription);
    
    // Reset state
    recordingState = {
      isRecording: false,
      mediaRecorder: null,
      audioChunks: [],
      streamId: null,
      tabId: null,
      meetingInfo: null,
      transcription: []
    };
    
    return { success: true };
  } catch (error) {
    console.error('Failed to stop recording:', error);
    return { success: false, error: error.message };
  }
}

async function createOffscreenDocument() {
  // Check if offscreen document already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  
  if (existingContexts.length > 0) {
    console.log('Offscreen document already exists, closing and recreating...');
    try {
      await chrome.offscreen.closeDocument();
      // Wait a bit after closing
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log('Error closing offscreen document:', error);
    }
  }
  
  // Create offscreen document
  console.log('Creating new offscreen document...');
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['USER_MEDIA'],
    justification: 'Recording audio from Google Meet for transcription'
  });
  console.log('Offscreen document created');
}

async function uploadRecording(audioData, transcription) {
  try {
    const settings = await chrome.storage.sync.get(['userId', 'apiUrl']);
    const apiUrl = settings.apiUrl || 'http://localhost:3000';
    
    if (!settings.userId) {
      throw new Error('User ID not configured');
    }
    
    // Prepare data
    const data = {
      userId: settings.userId,
      meetingCode: recordingState.meetingInfo?.meetingCode || 'unknown',
      meetingTitle: recordingState.meetingInfo?.title || 'Untitled Meeting',
      meetingUrl: recordingState.meetingInfo?.url || '',
      transcription: transcription,
      timestamp: new Date().toISOString(),
      duration: Math.round(audioData.length / 16000) // Approximate duration in seconds
    };
    
    // Upload transcription
    const response = await fetch(`${apiUrl}/api/recordings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload recording');
    }
    
    console.log('Recording uploaded successfully');
    
    // Upload audio file
    const responseData = await response.json();
    const audioBlob = new Blob([new Uint8Array(audioData)], { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('recordingId', responseData.recordingId);
    
    await fetch(`${apiUrl}/api/recordings/audio`, {
      method: 'POST',
      body: formData
    });
    
  } catch (error) {
    console.error('Failed to upload recording:', error);
    throw error;
  }
}

