import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getUserAnalytics, getUserInsights } from '../services/api'

const RepDetails = () => {
  const { userId } = useParams()
  const [userData, setUserData] = useState(null)
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadUserData()
  }, [userId])
  
  const loadUserData = async () => {
    try {
      const [analyticsRes, insightsRes] = await Promise.all([
        getUserAnalytics(userId),
        getUserInsights(userId)
      ])
      
      setUserData(analyticsRes.data.stats)
      setInsights(insightsRes.data.insights || [])
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  
  const getInsightIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-600" />
      case 'improvement': return <TrendingUp className="w-5 h-5 text-blue-600" />
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link to="/team" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Team
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{userId}</h1>
        <p className="text-gray-600 mt-2">Individual performance metrics and insights</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600">Total Calls</p>
          <p className="text-3xl font-bold mt-2">{userData?.averages?.total_calls || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Avg Score</p>
          <p className="text-3xl font-bold mt-2">
            {userData?.averages?.avg_score ? parseFloat(userData.averages.avg_score).toFixed(1) : '0'}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Talk Ratio</p>
          <p className="text-3xl font-bold mt-2">
            {userData?.averages?.avg_talk_ratio ? parseFloat(userData.averages.avg_talk_ratio).toFixed(1) : '0'}%
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Avg Questions</p>
          <p className="text-3xl font-bold mt-2">
            {userData?.averages?.avg_questions ? parseFloat(userData.averages.avg_questions).toFixed(1) : '0'}
          </p>
        </div>
      </div>
      
      {/* Performance Trend */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Performance Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userData?.performanceTrend || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="avg_score" stroke="#667eea" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Insights & Recommendations */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">AI Insights & Recommendations</h2>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                insight.type === 'success' ? 'bg-green-50 border-green-200' :
                insight.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{insight.category.toUpperCase()}</h3>
                  <p className="text-sm text-gray-700 mb-2">{insight.message}</p>
                  <p className="text-sm text-gray-600 italic">💡 {insight.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Calls */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Calls</h2>
        <div className="space-y-3">
          {userData?.recentCalls?.map((call) => (
            <Link
              key={call.recording_id}
              to={`/recording/${call.recording_id}`}
              className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{call.meeting_title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>{new Date(call.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{Math.floor(call.duration / 60)} min</span>
                    <span>•</span>
                    <span className="capitalize">{call.overall_sentiment || 'N/A'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    call.overall_score >= 80 ? 'bg-green-100 text-green-800' :
                    call.overall_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Score: {call.overall_score ? parseFloat(call.overall_score).toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RepDetails

