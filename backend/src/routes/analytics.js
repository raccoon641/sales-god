const express = require('express');
const router = express.Router();
const Recording = require('../models/Recording');
const CallAnalysis = require('../models/CallAnalysis');
const pool = require('../db/connection');

// Get user statistics
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get recording stats
    const recordingStats = await Recording.getStats(userId);
    
    // Get analysis averages
    const analysisAverages = await CallAnalysis.getAveragesByUser(userId);
    
    // Get recent recordings with analysis
    const recentRecordings = await pool.query(`
      SELECT 
        r.recording_id,
        r.meeting_title,
        r.duration,
        r.created_at,
        ca.overall_score,
        ca.talk_ratio,
        ca.questions_asked,
        ca.overall_sentiment
      FROM recordings r
      LEFT JOIN call_analysis ca ON r.recording_id = ca.recording_id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [userId]);
    
    // Get performance trend (last 30 days)
    const performanceTrend = await pool.query(`
      SELECT 
        DATE(r.created_at) as date,
        AVG(ca.overall_score) as avg_score,
        COUNT(*) as call_count
      FROM recordings r
      JOIN call_analysis ca ON r.recording_id = ca.recording_id
      WHERE r.user_id = $1 
        AND r.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(r.created_at)
      ORDER BY date ASC
    `, [userId]);
    
    res.json({
      success: true,
      stats: {
        recordings: recordingStats,
        averages: analysisAverages,
        recentCalls: recentRecordings.rows,
        performanceTrend: performanceTrend.rows
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get team statistics
router.get('/team/:teamId?', async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Get team averages
    const teamAverages = await CallAnalysis.getTeamAverages(teamId || null);
    
    // Get overall team stats
    const teamStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT r.user_id) as total_reps,
        COUNT(r.recording_id) as total_calls,
        SUM(r.duration) as total_duration,
        AVG(ca.overall_score) as avg_team_score
      FROM recordings r
      LEFT JOIN call_analysis ca ON r.recording_id = ca.recording_id
      LEFT JOIN users u ON r.user_id = u.user_id
      ${teamId ? 'WHERE u.team_id = $1' : ''}
    `, teamId ? [teamId] : []);
    
    // Get top performers
    const topPerformers = await pool.query(`
      SELECT 
        u.user_id,
        u.name,
        COUNT(r.recording_id) as call_count,
        AVG(ca.overall_score) as avg_score,
        AVG(ca.talk_ratio) as avg_talk_ratio
      FROM users u
      JOIN recordings r ON u.user_id = r.user_id
      LEFT JOIN call_analysis ca ON r.recording_id = ca.recording_id
      ${teamId ? 'WHERE u.team_id = $1' : ''}
      GROUP BY u.user_id, u.name
      HAVING COUNT(r.recording_id) >= 3
      ORDER BY avg_score DESC
      LIMIT 10
    `, teamId ? [teamId] : []);
    
    // Get metrics distribution
    const metricsDistribution = await pool.query(`
      SELECT 
        ROUND(AVG(talk_ratio), 2) as avg_talk_ratio,
        ROUND(AVG(questions_asked), 2) as avg_questions,
        ROUND(AVG(filler_words_count), 2) as avg_filler_words,
        ROUND(AVG(overall_score), 2) as avg_score
      FROM call_analysis ca
      JOIN recordings r ON ca.recording_id = r.recording_id
      JOIN users u ON r.user_id = u.user_id
      ${teamId ? 'WHERE u.team_id = $1' : ''}
    `, teamId ? [teamId] : []);
    
    res.json({
      success: true,
      stats: {
        team: teamStats.rows[0],
        members: teamAverages,
        topPerformers: topPerformers.rows,
        metrics: metricsDistribution.rows[0]
      }
    });
  } catch (error) {
    console.error('Get team analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { metric = 'overall_score', period = '30', teamId } = req.query;
    
    const validMetrics = ['overall_score', 'talk_ratio', 'questions_asked'];
    const selectedMetric = validMetrics.includes(metric) ? metric : 'overall_score';
    
    const leaderboard = await pool.query(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        COUNT(r.recording_id) as call_count,
        ROUND(AVG(ca.${selectedMetric}), 2) as avg_metric,
        ROUND(AVG(ca.overall_score), 2) as avg_score
      FROM users u
      JOIN recordings r ON u.user_id = r.user_id
      LEFT JOIN call_analysis ca ON r.recording_id = ca.recording_id
      WHERE r.created_at >= NOW() - INTERVAL '${parseInt(period)} days'
        ${teamId ? 'AND u.team_id = $1' : ''}
      GROUP BY u.user_id, u.name, u.email
      HAVING COUNT(r.recording_id) >= 2
      ORDER BY avg_metric DESC
      LIMIT 20
    `, teamId ? [teamId] : []);
    
    res.json({
      success: true,
      leaderboard: leaderboard.rows,
      metric: selectedMetric,
      period: parseInt(period)
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get insights and recommendations
router.get('/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userAverages = await CallAnalysis.getAveragesByUser(userId);
    const teamAverages = await pool.query(`
      SELECT 
        AVG(ca.talk_ratio) as avg_talk_ratio,
        AVG(ca.questions_asked) as avg_questions,
        AVG(ca.filler_words_count) as avg_filler_words,
        AVG(ca.overall_score) as avg_score
      FROM call_analysis ca
      JOIN recordings r ON ca.recording_id = r.recording_id
      JOIN users u ON r.user_id = u.user_id
      WHERE u.team_id = (
        SELECT team_id FROM users WHERE user_id = $1
      )
    `, [userId]);
    
    const insights = generateInsights(userAverages, teamAverages.rows[0]);
    
    res.json({
      success: true,
      insights
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: error.message });
  }
});

function generateInsights(userStats, teamStats) {
  const insights = [];
  
  if (!userStats || !teamStats) {
    return insights;
  }
  
  // Talk ratio insights
  if (parseFloat(userStats.avg_talk_ratio) > 60) {
    insights.push({
      type: 'warning',
      category: 'talk_ratio',
      message: 'You are talking more than 60% of the time. Try to listen more and let prospects speak.',
      recommendation: 'Ask more open-ended questions and practice active listening.'
    });
  } else if (parseFloat(userStats.avg_talk_ratio) < 30) {
    insights.push({
      type: 'info',
      category: 'talk_ratio',
      message: 'You are talking less than 30% of the time. Make sure you are providing enough value and information.',
      recommendation: 'Balance listening with sharing relevant insights and product benefits.'
    });
  }
  
  // Questions insights
  if (parseFloat(userStats.avg_questions) < parseFloat(teamStats.avg_questions)) {
    insights.push({
      type: 'improvement',
      category: 'questions',
      message: `You ask ${userStats.avg_questions} questions on average, below team average of ${teamStats.avg_questions}.`,
      recommendation: 'Prepare discovery questions before calls. Use SPIN or MEDDIC frameworks.'
    });
  } else {
    insights.push({
      type: 'success',
      category: 'questions',
      message: `Great job! You ask ${userStats.avg_questions} questions on average, above team average.`,
      recommendation: 'Keep up the excellent discovery process!'
    });
  }
  
  // Filler words insights
  if (parseFloat(userStats.avg_filler_words) > 20) {
    insights.push({
      type: 'warning',
      category: 'filler_words',
      message: `You average ${userStats.avg_filler_words} filler words per call, which can reduce credibility.`,
      recommendation: 'Practice pausing instead of using filler words. Record yourself and review.'
    });
  }
  
  // Overall score insights
  if (parseFloat(userStats.avg_score) > parseFloat(teamStats.avg_score)) {
    insights.push({
      type: 'success',
      category: 'overall',
      message: 'You are performing above team average. Excellent work!',
      recommendation: 'Consider mentoring other team members and sharing your best practices.'
    });
  } else {
    insights.push({
      type: 'improvement',
      category: 'overall',
      message: 'There is room for improvement to reach team average performance.',
      recommendation: 'Review your best calls and identify patterns. Consider role-playing practice.'
    });
  }
  
  return insights;
}

module.exports = router;

