const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Recording = require('../models/Recording');
const Transcription = require('../models/Transcription');
const CallAnalysis = require('../models/CallAnalysis');
const User = require('../models/User');
const analysisService = require('../services/analysisService');
const transcriptionService = require('../services/transcriptionService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Create new recording
router.post('/', async (req, res) => {
  try {
    const { userId, meetingCode, meetingTitle, meetingUrl, transcription, duration } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // Ensure user exists (create if not)
    await User.getOrCreate({
      userId: userId,
      email: userId,
      name: userId.split('@')[0] || userId
    });
    
    // Create recording
    const recording = await Recording.create({
      userId,
      meetingCode: meetingCode || 'unknown',
      meetingTitle: meetingTitle || 'Untitled Meeting',
      meetingUrl: meetingUrl || '',
      duration: duration || 0
    });
    
    // Save transcription segments
    if (transcription && transcription.length > 0) {
      await Transcription.create(recording.recording_id, transcription);
      
      // Analyze the transcription
      const analysis = await analysisService.analyzeRecording(
        recording.recording_id,
        transcription
      );
      
      // Save analysis
      await CallAnalysis.create(recording.recording_id, analysis);
    } else {
      // Create placeholder analysis for recordings without transcription
      const placeholderAnalysis = {
        totalWords: 0,
        repWords: 0,
        prospectWords: 0,
        talkRatio: 50.0,
        questionsAsked: 0,
        fillerWordsCount: 0,
        averageSpeakingPace: 0,
        overallSentiment: 'neutral',
        sentimentScore: 0,
        topics: [],
        objections: [],
        nextSteps: [],
        overallScore: 50.0
      };
      
      await CallAnalysis.create(recording.recording_id, placeholderAnalysis);
    }
    
    res.json({
      success: true,
      recordingId: recording.recording_id,
      recording
    });
  } catch (error) {
    console.error('Create recording error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload audio file
router.post('/audio', upload.single('audio'), async (req, res) => {
  try {
    const { recordingId } = req.body;
    
    if (!recordingId) {
      return res.status(400).json({ error: 'Recording ID required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file required' });
    }
    
    // Update recording with audio file path
    await Recording.updateAudioPath(recordingId, req.file.path);
    
    // Start transcription in background (don't wait for it)
    transcribeAndAnalyze(recordingId, req.file.path).catch(error => {
      console.error('Background transcription error:', error);
    });
    
    res.json({
      success: true,
      audioPath: req.file.path,
      message: 'Audio uploaded. Transcription in progress...'
    });
  } catch (error) {
    console.error('Upload audio error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Background transcription and analysis
async function transcribeAndAnalyze(recordingId, audioPath) {
  try {
    console.log(`🔄 Starting transcription for recording: ${recordingId}`);
    
    // Transcribe audio using Google Speech-to-Text
    const transcription = await transcriptionService.transcribeAudio(audioPath);
    
    if (transcription && transcription.length > 0) {
      // Save transcription
      await Transcription.create(recordingId, transcription);
      console.log(`✅ Transcription saved for: ${recordingId}`);
      
      // Analyze transcription
      const analysis = await analysisService.analyzeRecording(recordingId, transcription);
      
      // Update or create analysis
      const existing = await CallAnalysis.findByRecordingId(recordingId);
      if (existing) {
        await CallAnalysis.update(recordingId, analysis);
      } else {
        await CallAnalysis.create(recordingId, analysis);
      }
      
      console.log(`✅ Analysis complete for: ${recordingId}`);
    }
  } catch (error) {
    console.error(`❌ Transcription/Analysis failed for ${recordingId}:`, error);
  }
}

// Get all recordings
router.get('/', async (req, res) => {
  try {
    const { userId, limit = 50, offset = 0 } = req.query;
    
    let recordings;
    if (userId) {
      recordings = await Recording.findByUserId(userId, parseInt(limit), parseInt(offset));
    } else {
      recordings = await Recording.findAll(parseInt(limit), parseInt(offset));
    }
    
    res.json({
      success: true,
      recordings,
      count: recordings.length
    });
  } catch (error) {
    console.error('Get recordings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single recording with full details
router.get('/:recordingId', async (req, res) => {
  try {
    const { recordingId } = req.params;
    
    const recording = await Recording.findById(recordingId);
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    const transcription = await Transcription.findByRecordingId(recordingId);
    const analysis = await CallAnalysis.findByRecordingId(recordingId);
    
    res.json({
      success: true,
      recording,
      transcription,
      analysis
    });
  } catch (error) {
    console.error('Get recording error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get transcription for a recording
router.get('/:recordingId/transcription', async (req, res) => {
  try {
    const { recordingId } = req.params;
    
    const segments = await Transcription.findByRecordingId(recordingId);
    const fullText = await Transcription.getFullTranscript(recordingId);
    
    res.json({
      success: true,
      segments,
      fullText
    });
  } catch (error) {
    console.error('Get transcription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get analysis for a recording
router.get('/:recordingId/analysis', async (req, res) => {
  try {
    const { recordingId } = req.params;
    
    const analysis = await CallAnalysis.findByRecordingId(recordingId);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete recording
router.delete('/:recordingId', async (req, res) => {
  try {
    const { recordingId } = req.params;
    
    const recording = await Recording.delete(recordingId);
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    // Delete audio file if exists
    if (recording.audio_file_path) {
      try {
        await fs.unlink(recording.audio_file_path);
      } catch (err) {
        console.error('Failed to delete audio file:', err);
      }
    }
    
    res.json({
      success: true,
      message: 'Recording deleted'
    });
  } catch (error) {
    console.error('Delete recording error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

