const pool = require('../db/connection');

class CallAnalysis {
  static async create(recordingId, analysisData) {
    const query = `
      INSERT INTO call_analysis (
        recording_id, total_words, rep_words, prospect_words, talk_ratio,
        questions_asked, filler_words_count, average_speaking_pace,
        overall_sentiment, sentiment_score, topics, objections, next_steps,
        overall_score
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    
    const values = [
      recordingId,
      analysisData.totalWords || 0,
      analysisData.repWords || 0,
      analysisData.prospectWords || 0,
      analysisData.talkRatio || 0,
      analysisData.questionsAsked || 0,
      analysisData.fillerWordsCount || 0,
      analysisData.averageSpeakingPace || 0,
      analysisData.overallSentiment || 'neutral',
      analysisData.sentimentScore || 0,
      JSON.stringify(analysisData.topics || []),
      JSON.stringify(analysisData.objections || []),
      JSON.stringify(analysisData.nextSteps || []),
      analysisData.overallScore || 0
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async findByRecordingId(recordingId) {
    const query = 'SELECT * FROM call_analysis WHERE recording_id = $1';
    const result = await pool.query(query, [recordingId]);
    return result.rows[0];
  }
  
  static async update(recordingId, analysisData) {
    const query = `
      UPDATE call_analysis
      SET 
        total_words = $2,
        rep_words = $3,
        prospect_words = $4,
        talk_ratio = $5,
        questions_asked = $6,
        filler_words_count = $7,
        average_speaking_pace = $8,
        overall_sentiment = $9,
        sentiment_score = $10,
        topics = $11,
        objections = $12,
        next_steps = $13,
        overall_score = $14,
        updated_at = CURRENT_TIMESTAMP
      WHERE recording_id = $1
      RETURNING *
    `;
    
    const values = [
      recordingId,
      analysisData.totalWords,
      analysisData.repWords,
      analysisData.prospectWords,
      analysisData.talkRatio,
      analysisData.questionsAsked,
      analysisData.fillerWordsCount,
      analysisData.averageSpeakingPace,
      analysisData.overallSentiment,
      analysisData.sentimentScore,
      JSON.stringify(analysisData.topics),
      JSON.stringify(analysisData.objections),
      JSON.stringify(analysisData.nextSteps),
      analysisData.overallScore
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async getAveragesByUser(userId) {
    const query = `
      SELECT 
        AVG(talk_ratio) as avg_talk_ratio,
        AVG(questions_asked) as avg_questions,
        AVG(filler_words_count) as avg_filler_words,
        AVG(overall_score) as avg_score,
        COUNT(*) as total_calls
      FROM call_analysis ca
      JOIN recordings r ON ca.recording_id = r.recording_id
      WHERE r.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
  
  static async getTeamAverages(teamId = null) {
    let query = `
      SELECT 
        u.user_id,
        u.name,
        AVG(ca.talk_ratio) as avg_talk_ratio,
        AVG(ca.questions_asked) as avg_questions,
        AVG(ca.filler_words_count) as avg_filler_words,
        AVG(ca.overall_score) as avg_score,
        COUNT(*) as total_calls
      FROM call_analysis ca
      JOIN recordings r ON ca.recording_id = r.recording_id
      JOIN users u ON r.user_id = u.user_id
    `;
    
    if (teamId) {
      query += ' WHERE u.team_id = $1';
    }
    
    query += ' GROUP BY u.user_id, u.name ORDER BY avg_score DESC';
    
    const result = teamId 
      ? await pool.query(query, [teamId])
      : await pool.query(query);
      
    return result.rows;
  }
}

module.exports = CallAnalysis;

