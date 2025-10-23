const pool = require('../db/connection');

class Transcription {
  static async create(recordingId, segments) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const insertQuery = `
        INSERT INTO transcription_segments (
          recording_id, segment_index, text, speaker, timestamp, confidence
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        await client.query(insertQuery, [
          recordingId,
          i,
          segment.text,
          segment.speaker || 'unknown',
          segment.timestamp,
          segment.confidence || 1.0
        ]);
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async findByRecordingId(recordingId) {
    const query = `
      SELECT * FROM transcription_segments 
      WHERE recording_id = $1 
      ORDER BY segment_index ASC
    `;
    const result = await pool.query(query, [recordingId]);
    return result.rows;
  }
  
  static async getFullTranscript(recordingId) {
    const segments = await this.findByRecordingId(recordingId);
    return segments.map(s => s.text).join(' ');
  }
  
  static async delete(recordingId) {
    const query = 'DELETE FROM transcription_segments WHERE recording_id = $1';
    await pool.query(query, [recordingId]);
  }
}

module.exports = Transcription;

