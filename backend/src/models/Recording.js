const pool = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

class Recording {
  static async create(data) {
    const recordingId = uuidv4();
    
    const query = `
      INSERT INTO recordings (
        recording_id, user_id, meeting_code, meeting_title, 
        meeting_url, duration
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      recordingId,
      data.userId,
      data.meetingCode,
      data.meetingTitle,
      data.meetingUrl,
      data.duration
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async findById(recordingId) {
    const query = 'SELECT * FROM recordings WHERE recording_id = $1';
    const result = await pool.query(query, [recordingId]);
    return result.rows[0];
  }
  
  static async findByUserId(userId, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM recordings 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }
  
  static async findAll(limit = 100, offset = 0) {
    const query = `
      SELECT r.*, u.name as user_name, u.email as user_email
      FROM recordings r
      LEFT JOIN users u ON r.user_id = u.user_id
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }
  
  static async updateAudioPath(recordingId, audioPath) {
    const query = `
      UPDATE recordings 
      SET audio_file_path = $1 
      WHERE recording_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [audioPath, recordingId]);
    return result.rows[0];
  }
  
  static async delete(recordingId) {
    const query = 'DELETE FROM recordings WHERE recording_id = $1 RETURNING *';
    const result = await pool.query(query, [recordingId]);
    return result.rows[0];
  }
  
  static async getStats(userId = null) {
    let query = `
      SELECT 
        COUNT(*) as total_recordings,
        SUM(duration) as total_duration,
        AVG(duration) as avg_duration
      FROM recordings
    `;
    
    if (userId) {
      query += ' WHERE user_id = $1';
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    }
    
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = Recording;

