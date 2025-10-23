const pool = require('../db/connection');

class User {
  static async create(data) {
    const query = `
      INSERT INTO users (user_id, email, name, role, team_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      data.userId || data.email,
      data.email,
      data.name,
      data.role || 'rep',
      data.teamId || null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async findByUserId(userId) {
    const query = 'SELECT * FROM users WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
  
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }
  
  static async findAll() {
    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }
  
  static async findByTeam(teamId) {
    const query = 'SELECT * FROM users WHERE team_id = $1';
    const result = await pool.query(query, [teamId]);
    return result.rows;
  }
  
  static async update(userId, data) {
    const query = `
      UPDATE users
      SET name = $2, role = $3, team_id = $4, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `;
    
    const values = [userId, data.name, data.role, data.teamId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  static async delete(userId) {
    const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
  
  static async getOrCreate(userData) {
    let user = await this.findByUserId(userData.userId || userData.email);
    if (!user) {
      user = await this.create(userData);
    }
    return user;
  }
}

module.exports = User;

