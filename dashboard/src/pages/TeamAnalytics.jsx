import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getTeamAnalytics } from '../services/api'

const TeamAnalytics = () => {
  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadTeamData()
  }, [])
  
  const loadTeamData = async () => {
    try {
      const response = await getTeamAnalytics()
      setTeamData(response.data.stats)
    } catch (error) {
      console.error('Failed to load team data:', error)
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
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Analytics</h1>
        <p className="text-gray-600 mt-2">Detailed performance metrics for all team members</p>
      </div>
      
      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600">Total Reps</p>
          <p className="text-3xl font-bold mt-2">{teamData?.team?.total_reps || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Total Calls</p>
          <p className="text-3xl font-bold mt-2">{teamData?.team?.total_calls || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Avg Team Score</p>
          <p className="text-3xl font-bold mt-2">
            {teamData?.team?.avg_team_score ? parseFloat(teamData.team.avg_team_score).toFixed(1) : '0'}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Total Hours</p>
          <p className="text-3xl font-bold mt-2">
            {teamData?.team?.total_duration ? Math.floor(teamData.team.total_duration / 3600) : 0}h
          </p>
        </div>
      </div>
      
      {/* Team Members Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Team Members Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rep Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Calls</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Avg Score</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Talk Ratio</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Questions</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Filler Words</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Trend</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamData?.members?.map((member) => {
                const score = parseFloat(member.avg_score || 0)
                const teamAvg = parseFloat(teamData?.metrics?.avg_score || 0)
                const trend = score > teamAvg ? 'up' : score < teamAvg ? 'down' : 'neutral'
                
                return (
                  <tr key={member.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.user_id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{member.total_calls || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        score >= 80 ? 'bg-green-100 text-green-800' :
                        score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {score.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{parseFloat(member.avg_talk_ratio || 0).toFixed(1)}%</td>
                    <td className="py-3 px-4">{parseFloat(member.avg_questions || 0).toFixed(1)}</td>
                    <td className="py-3 px-4">{parseFloat(member.avg_filler_words || 0).toFixed(1)}</td>
                    <td className="py-3 px-4">
                      {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-600" />}
                      {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-600" />}
                      {trend === 'neutral' && <Minus className="w-5 h-5 text-gray-400" />}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/rep/${member.user_id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Performance Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Score Distribution</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Excellent (80-100)</span>
              <span className="text-sm font-semibold">
                {teamData?.members?.filter(m => parseFloat(m.avg_score) >= 80).length || 0} reps
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Good (60-79)</span>
              <span className="text-sm font-semibold">
                {teamData?.members?.filter(m => parseFloat(m.avg_score) >= 60 && parseFloat(m.avg_score) < 80).length || 0} reps
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Needs Improvement (&lt;60)</span>
              <span className="text-sm font-semibold">
                {teamData?.members?.filter(m => parseFloat(m.avg_score) < 60).length || 0} reps
              </span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Team Metrics Overview</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg Talk Ratio</span>
              <span className="text-sm font-semibold">{teamData?.metrics?.avg_talk_ratio || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg Questions</span>
              <span className="text-sm font-semibold">{teamData?.metrics?.avg_questions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg Filler Words</span>
              <span className="text-sm font-semibold">{teamData?.metrics?.avg_filler_words || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamAnalytics

