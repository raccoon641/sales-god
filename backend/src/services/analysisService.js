const natural = require('natural');
const Sentiment = require('sentiment');

const sentiment = new Sentiment();
const tokenizer = new natural.WordTokenizer();

class AnalysisService {
  constructor() {
    this.fillerWords = [
      'um', 'uh', 'like', 'you know', 'sort of', 'kind of', 'i mean',
      'basically', 'actually', 'literally', 'right', 'okay', 'so'
    ];
    
    this.questionWords = ['what', 'when', 'where', 'who', 'why', 'how', 'which', 'can', 'could', 'would', 'should'];
    
    this.objectionKeywords = [
      'expensive', 'cost', 'price', 'budget', 'afford',
      'think about it', 'not sure', 'concern', 'worried',
      'competitor', 'already have', 'not interested'
    ];
    
    this.nextStepKeywords = [
      'next step', 'follow up', 'schedule', 'meeting', 'call',
      'demo', 'trial', 'contract', 'proposal', 'sign'
    ];
  }
  
  analyzeTranscript(transcriptionSegments) {
    const fullText = transcriptionSegments.map(s => s.text).join(' ').toLowerCase();
    const sentences = this.splitIntoSentences(fullText);
    
    // Word analysis
    const words = tokenizer.tokenize(fullText);
    const totalWords = words.length;
    
    // Filler words
    const fillerWordsCount = this.countFillerWords(fullText);
    
    // Questions
    const questionsAsked = this.countQuestions(sentences);
    
    // Sentiment analysis
    const sentimentResult = sentiment.analyze(fullText);
    const overallSentiment = this.categorizeSentiment(sentimentResult.score);
    
    // Topics extraction
    const topics = this.extractTopics(fullText);
    
    // Objections detection
    const objections = this.detectObjections(sentences);
    
    // Next steps detection
    const nextSteps = this.detectNextSteps(sentences);
    
    // Speaking pace (words per minute - estimated)
    const duration = this.estimateDuration(transcriptionSegments);
    const averageSpeakingPace = duration > 0 ? (totalWords / duration) * 60 : 0;
    
    // Calculate overall score (0-100)
    const overallScore = this.calculateOverallScore({
      fillerWordsCount,
      totalWords,
      questionsAsked,
      sentimentScore: sentimentResult.score,
      hasNextSteps: nextSteps.length > 0
    });
    
    return {
      totalWords,
      repWords: Math.floor(totalWords * 0.4), // This should be improved with speaker diarization
      prospectWords: Math.floor(totalWords * 0.6),
      talkRatio: 40.0, // Ideally calculated from speaker diarization
      questionsAsked,
      fillerWordsCount,
      averageSpeakingPace: parseFloat(averageSpeakingPace.toFixed(2)),
      overallSentiment,
      sentimentScore: this.normalizeSentimentScore(sentimentResult.score),
      topics,
      objections,
      nextSteps,
      overallScore: parseFloat(overallScore.toFixed(2))
    };
  }
  
  splitIntoSentences(text) {
    return text.match(/[^\.!\?]+[\.!\?]+/g) || [];
  }
  
  countFillerWords(text) {
    let count = 0;
    const lowerText = text.toLowerCase();
    
    this.fillerWords.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) count += matches.length;
    });
    
    return count;
  }
  
  countQuestions(sentences) {
    let count = 0;
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      
      // Check for question mark
      if (sentence.includes('?')) {
        count++;
      }
      // Check for question words at start
      else if (this.questionWords.some(word => 
        lowerSentence.trim().startsWith(word + ' ')
      )) {
        count++;
      }
    });
    
    return count;
  }
  
  categorizeSentiment(score) {
    if (score > 2) return 'very positive';
    if (score > 0) return 'positive';
    if (score === 0) return 'neutral';
    if (score > -2) return 'negative';
    return 'very negative';
  }
  
  normalizeSentimentScore(score) {
    // Normalize to -1 to 1 scale
    return Math.max(-1, Math.min(1, score / 10));
  }
  
  extractTopics(text) {
    // Simple topic extraction using TF-IDF concepts
    const words = tokenizer.tokenize(text.toLowerCase());
    const stopWords = natural.stopwords;
    
    // Remove stop words and short words
    const meaningfulWords = words.filter(word => 
      !stopWords.includes(word) && word.length > 4
    );
    
    // Count frequency
    const frequency = {};
    meaningfulWords.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    // Sort by frequency and take top 10
    const sortedTopics = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
    
    return sortedTopics;
  }
  
  detectObjections(sentences) {
    const objections = [];
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      
      this.objectionKeywords.forEach(keyword => {
        if (lowerSentence.includes(keyword)) {
          objections.push({
            text: sentence.trim(),
            keyword: keyword,
            type: this.categorizeObjection(keyword)
          });
        }
      });
    });
    
    // Remove duplicates
    return objections.filter((obj, index, self) =>
      index === self.findIndex(o => o.text === obj.text)
    ).slice(0, 5); // Limit to 5 main objections
  }
  
  categorizeObjection(keyword) {
    if (['expensive', 'cost', 'price', 'budget', 'afford'].includes(keyword)) {
      return 'price';
    }
    if (['competitor', 'already have'].includes(keyword)) {
      return 'competition';
    }
    return 'general';
  }
  
  detectNextSteps(sentences) {
    const nextSteps = [];
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      
      this.nextStepKeywords.forEach(keyword => {
        if (lowerSentence.includes(keyword)) {
          nextSteps.push({
            text: sentence.trim(),
            keyword: keyword
          });
        }
      });
    });
    
    // Remove duplicates
    return nextSteps.filter((step, index, self) =>
      index === self.findIndex(s => s.text === step.text)
    ).slice(0, 3); // Limit to 3 main next steps
  }
  
  estimateDuration(transcriptionSegments) {
    if (transcriptionSegments.length === 0) return 0;
    
    const firstTimestamp = transcriptionSegments[0].timestamp || 0;
    const lastTimestamp = transcriptionSegments[transcriptionSegments.length - 1].timestamp || 0;
    
    // Duration in seconds
    return (lastTimestamp - firstTimestamp) / 1000;
  }
  
  calculateOverallScore(metrics) {
    let score = 70; // Start with base score
    
    // Deduct for excessive filler words
    const fillerRatio = metrics.fillerWordsCount / metrics.totalWords;
    if (fillerRatio > 0.05) {
      score -= (fillerRatio - 0.05) * 500; // Penalize heavily
    }
    
    // Add for good questions
    score += Math.min(metrics.questionsAsked * 2, 15); // Up to 15 points
    
    // Add for positive sentiment
    score += metrics.sentimentScore * 10; // -10 to +10 points
    
    // Add for next steps
    if (metrics.hasNextSteps) {
      score += 10;
    }
    
    // Ensure score is within 0-100
    return Math.max(0, Math.min(100, score));
  }
  
  async analyzeRecording(recordingId, transcriptionSegments) {
    try {
      const analysis = this.analyzeTranscript(transcriptionSegments);
      return analysis;
    } catch (error) {
      console.error('Analysis error:', error);
      throw new Error('Failed to analyze recording: ' + error.message);
    }
  }
}

module.exports = new AnalysisService();

