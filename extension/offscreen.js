// Offscreen document for audio capture and transcription
let mediaRecorder = null;
let audioChunks = [];
let recognition = null;
let transcription = [];

// Signal that offscreen document is ready
console.log('Offscreen document initialized and ready');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Offscreen received message:', request.action);
  
  if (request.action === 'startCapture') {
    console.log('Starting capture with streamId:', request.streamId);
    startCapture(request.streamId)
      .then(result => {
        console.log('Capture started, sending response:', result);
        sendResponse(result);
      })
      .catch(error => {
        console.error('Capture start failed:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  } else if (request.action === 'stopCapture') {
    console.log('Stopping capture');
    stopCapture()
      .then(result => {
        console.log('Capture stopped, sending response');
        sendResponse(result);
      })
      .catch(error => {
        console.error('Capture stop failed:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  return true;
});

async function startCapture(streamId) {
  try {
    // Get media stream
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      }
    });
    
    // Setup MediaRecorder
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm'
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    mediaRecorder.start(1000); // Collect data every second
    
    // Setup speech recognition
    startTranscription(stream);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to start capture:', error);
    return { success: false, error: error.message };
  }
}

async function stopCapture() {
  try {
    // Stop media recorder
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    // Stop speech recognition
    if (recognition) {
      recognition.stop();
    }
    
    // Convert audio chunks to array buffer
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const audioData = await audioBlob.arrayBuffer();
    
    return {
      success: true,
      audioData: Array.from(new Uint8Array(audioData)),
      transcription: transcription
    };
  } catch (error) {
    console.error('Failed to stop capture:', error);
    return { success: false, error: error.message };
  }
}

function startTranscription(stream) {
  // Note: Web Speech API has permission issues in offscreen documents
  // For now, we'll skip real-time transcription and just record audio
  // The backend can handle transcription later, or you can integrate
  // a cloud service like Google Speech-to-Text, AWS Transcribe, etc.
  
  console.log('Audio recording started. Transcription disabled due to browser restrictions.');
  console.log('Tip: You can add server-side transcription using services like:');
  console.log('- Google Cloud Speech-to-Text');
  console.log('- AWS Transcribe'); 
  console.log('- OpenAI Whisper API');
  
  // Add a sample transcription entry to show the format
  transcription.push({
    text: 'Audio recorded successfully. Transcription requires server-side processing.',
    timestamp: Date.now(),
    confidence: 1.0,
    speaker: 'system'
  });
}

