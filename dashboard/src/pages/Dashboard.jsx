import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Video, TrendingUp, Award } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getTeamAnalytics, getRecordings } from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentRecordings, setRecentRecordings] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadDashboardData()
  }, [])
  
  const loadDashboardData = async () => {
    try {
      const [analyticsRes, recordingsRes] = await Promise.all([
        getTeamAnalytics(),
        getRecordings({ limit: 5 })
      ])
      
      setStats(analyticsRes.data.stats)
      setRecentRecordings(recordingsRes.data.recordings)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
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
  
  const statCards = [
    {
      title: 'Total Reps',
      value: stats?.team?.total_reps || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Calls',
      value: stats?.team?.total_calls || 0,
      icon: Video,
      color: 'bg-green-500',
      change: '+23%'
    },
    {
      title: 'Avg Score',
      value: stats?.team?.avg_team_score ? `${parseFloat(stats.team.avg_team_score).toFixed(1)}` : '0',
      icon: Award,
      color: 'bg-purple-500',
      change: '+5.2%'
    },
    {
      title: 'Total Duration',
      value: stats?.team?.total_duration ? `${Math.floor(stats.team.total_duration / 3600)}h` : '0h',
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+18%'
    }
  ]
  
  // Performance distribution data
  const performanceData = stats?.members?.map(member => ({
    name: member.name?.split(' ')[0] || 'Unknown',
    score: parseFloat(member.avg_score || 0).toFixed(1)
  })).slice(0, 8) || []
  
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140']
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your sales team performance</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-2">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Team Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Metrics Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Talk Ratio</span>
                <span className="text-sm font-semibold">{stats?.metrics?.avg_talk_ratio || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full" 
                  style={{ width: `${stats?.metrics?.avg_talk_ratio || 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Questions Asked</span>
                <span className="text-sm font-semibold">{stats?.metrics?.avg_questions || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((stats?.metrics?.avg_questions || 0) * 10, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Filler Words</span>
                <span className="text-sm font-semibold">{stats?.metrics?.avg_filler_words || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((stats?.metrics?.avg_filler_words || 0) * 5, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Overall Score</span>
                <span className="text-sm font-semibold">{stats?.metrics?.avg_score || 0}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${stats?.metrics?.avg_score || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Performers */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Top Performers</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rep Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Calls</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Avg Score</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Talk Ratio</th>
              </tr>
            </thead>
            <tbody>
              {stats?.topPerformers?.slice(0, 5).map((rep, index) => (
                <tr key={rep.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-600'
                    } font-semibold`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link to={`/rep/${rep.user_id}`} className="text-primary-600 hover:text-primary-700 font-medium">
                      {rep.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{rep.call_count}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {parseFloat(rep.avg_score || 0).toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">{parseFloat(rep.avg_talk_ratio || 0).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Recent Recordings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Recordings</h2>
          <Link to="/recordings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {recentRecordings.map((recording) => (
            <Link
              key={recording.recording_id}
              to={`/recording/${recording.recording_id}`}
              className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{recording.meeting_title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {recording.user_name || recording.user_id} • {new Date(recording.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {Math.floor(recording.duration / 60)} min
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

export default Dashboard

