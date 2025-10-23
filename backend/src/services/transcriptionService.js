const speech = require('@google-cloud/speech');
const fs = require('fs').promises;

class TranscriptionService {
  constructor() {
    // Initialize client - will use default credentials or GOOGLE_APPLICATION_CREDENTIALS env var
    try {
      this.client = new speech.SpeechClient();
      this.enabled = true;
      console.log('✅ Google Speech-to-Text client initialized');
    } catch (error) {
      console.warn('⚠️  Google Speech-to-Text not configured. Transcription will be skipped.');
      console.warn('   To enable: Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
      this.enabled = false;
    }
  }

  async transcribeAudio(audioFilePath) {
    // TEMPORARY: Return hardcoded product pitch for testing
    console.log('🎤 Using hardcoded transcription for testing...');
    
    const testTranscription = [
      {
        text: "Hey everyone, I'm sharing my screen now showing our sales coaching dashboard.",
        timestamp: Date.now(),
        confidence: 0.95,
        speaker: 'rep'
      },
      {
        text: "This platform automatically analyzes all your team's sales calls without you having to shadow anyone or listen to hours of recordings.",
        timestamp: Date.now() + 4000,
        confidence: 0.95,
        speaker: 'rep'
      },
      {
        text: "You can see key metrics like talk ratio, sentiment analysis, objection handling, and even get AI-powered coaching suggestions.",
        timestamp: Date.now() + 11000,
        confidence: 0.95,
        speaker: 'rep'
      },
      {
        text: "Everything shows up on this one dashboard so you can coach your entire team more effectively.",
        timestamp: Date.now() + 18000,
        confidence: 0.95,
        speaker: 'rep'
      },
      {
        text: "I'll send everyone the trial link right after this demo. Thanks for watching!",
        timestamp: Date.now() + 24000,
        confidence: 0.95,
        speaker: 'rep'
      }
    ];
    
    console.log(`✅ Transcription complete: ${testTranscription.length} segments`);
    return testTranscription;

    /* ORIGINAL CODE - commented out for testing
    if (!this.enabled) {
      console.log('Transcription skipped - Google credentials not configured');
      return [{
        text: 'Transcription not available. Configure Google Cloud credentials to enable.',
        timestamp: Date.now(),
        confidence: 0,
        speaker: 'system'
      }];
    }

    try {
      // Read the audio file
      const audioBytes = await fs.readFile(audioFilePath);

      const audio = {
        content: audioBytes.toString('base64'),
      };

      const config = {
        encoding: 'WEBM_OPUS',
        audioChannelCount: 2, // Stereo audio from Google Meet
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,
        model: 'video', // 'video' model works best for video calls
        useEnhanced: true, // Use enhanced model for better accuracy
      };

      const request = {
        audio: audio,
        config: config,
      };

      console.log('🎤 Starting transcription...');
      const [response] = await this.client.recognize(request);
      const transcription = response.results
        .map(result => result.alternatives[0]);

      console.log(`✅ Transcription complete: ${transcription.length} segments`);

      // Convert to our format
      return transcription.map((segment, index) => ({
        text: segment.transcript,
        timestamp: Date.now() + (index * 1000), // Approximate timestamps
        confidence: segment.confidence || 0.95,
        speaker: 'unknown' // Google doesn't provide speaker diarization in basic API
      }));

    } catch (error) {
      console.error('❌ Transcription error:', error.message);
      
      // Return error message as transcription
      return [{
        text: `Transcription failed: ${error.message}. Check audio format and Google Cloud configuration.`,
        timestamp: Date.now(),
        confidence: 0,
        speaker: 'system'
      }];
    }
    */
  }

  async transcribeAudioLongRunning(audioFilePath) {
    // For longer audio files (>1 minute), use longRunningRecognize
    if (!this.enabled) {
      return this.transcribeAudio(audioFilePath);
    }

    try {
      const audioBytes = await fs.readFile(audioFilePath);

      const audio = {
        content: audioBytes.toString('base64'),
      };

      const config = {
        encoding: 'WEBM_OPUS',
        audioChannelCount: 2, // Stereo audio from Google Meet
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,
        enableSpeakerDiarization: true, // Enable speaker detection
        diarizationSpeakerCount: 2, // Assume 2 speakers (rep + prospect)
        model: 'video',
        useEnhanced: true,
      };

      const request = {
        audio: audio,
        config: config,
      };

      console.log('🎤 Starting long-running transcription...');
      const [operation] = await this.client.longRunningRecognize(request);
      
      // Wait for operation to complete
      const [response] = await operation.promise();
      
      const transcription = response.results
        .map(result => result.alternatives[0]);

      console.log(`✅ Transcription complete: ${transcription.length} segments`);

      return transcription.map((segment, index) => ({
        text: segment.transcript,
        timestamp: Date.now() + (index * 1000),
        confidence: segment.confidence || 0.95,
        speaker: segment.words?.[0]?.speakerTag ? `speaker_${segment.words[0].speakerTag}` : 'unknown'
      }));

    } catch (error) {
      console.error('❌ Long transcription error:', error.message);
      return this.transcribeAudio(audioFilePath); // Fallback to regular transcription
    }
  }
}

module.exports = new TranscriptionService();

