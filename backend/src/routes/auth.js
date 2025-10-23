const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Simple authentication - in production, use proper JWT auth
router.post('/login', async (req, res) => {
  try {
    const { userId, email, name } = req.body;
    
    if (!userId && !email) {
      return res.status(400).json({ error: 'User ID or email required' });
    }
    
    // Get or create user
    const user = await User.getOrCreate({
      userId: userId || email,
      email: email || userId,
      name: name || userId
    });
    
    res.json({
      success: true,
      user: {
        id: user.id,
        userId: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { userId, email, name, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    // Check if user exists
    let user = await User.findByEmail(email);
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create user
    user = await User.create({
      userId: userId || email,
      email,
      name: name || email,
      role: role || 'rep'
    });
    
    res.json({
      success: true,
      user: {
        id: user.id,
        userId: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

