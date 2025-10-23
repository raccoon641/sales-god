const express = require('express');
const router = express.Router();
const User = require('../models/User');
const pool = require('../db/connection');

// Get all users
router.get('/', async (req, res) => {
  try {
    const { teamId } = req.query;
    
    let users;
    if (teamId) {
      users = await User.findByTeam(teamId);
    } else {
      users = await User.findAll();
    }
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { userId, email, name, role, teamId } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    const user = await User.create({
      userId: userId || email,
      email,
      name: name || email,
      role: role || 'rep',
      teamId
    });
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, role, teamId } = req.body;
    
    const user = await User.update(userId, { name, role, teamId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.delete(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User deleted'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get teams
router.get('/teams/all', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.name,
        t.manager_id,
        u.name as manager_name,
        COUNT(DISTINCT um.id) as member_count
      FROM teams t
      LEFT JOIN users u ON t.manager_id = u.id
      LEFT JOIN users um ON um.team_id = t.id
      GROUP BY t.id, t.name, t.manager_id, u.name
      ORDER BY t.name
    `);
    
    res.json({
      success: true,
      teams: result.rows
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

