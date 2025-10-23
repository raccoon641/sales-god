import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Medal, Award } from 'lucide-react'
import { getLeaderboard } from '../services/api'

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [metric, setMetric] = useState('overall_score')
  const [period, setPeriod] = useState('30')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadLeaderboard()
  }, [metric, period])
  
  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await getLeaderboard({ metric, period })
      setLeaderboard(response.data.leaderboard)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const getRankIcon = (rank) => {
    if (rank === 0) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (rank === 1) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 2) return <Award className="w-6 h-6 text-orange-500" />
    return <span className="text-lg font-bold text-gray-600">{rank + 1}</span>
  }
  
  const getRankBadge = (rank) => {
    if (rank === 0) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
    if (rank === 1) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
    if (rank === 2) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
    return 'bg-white'
  }
  
  const metricOptions = [
    { value: 'overall_score', label: 'Overall Score' },
    { value: 'talk_ratio', label: 'Talk Ratio' },
    { value: 'questions_asked', label: 'Questions Asked' }
  ]
  
  const periodOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'All Time' }
  ]
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🏆 Leaderboard</h1>
        <p className="text-gray-600 mt-2">Top performing sales reps</p>
      </div>
      
      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metric
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {metricOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center justify-end">
                <div className={`w-full ${getRankBadge(1)} rounded-t-xl p-6 text-center shadow-lg`}>
                  <div className="flex justify-center mb-3">{getRankIcon(1)}</div>
                  <h3 className="font-bold text-lg mb-1">{leaderboard[1].name}</h3>
                  <p className="text-sm opacity-90 mb-2">{leaderboard[1].call_count} calls</p>
                  <p className="text-2xl font-bold">{parseFloat(leaderboard[1].avg_metric).toFixed(1)}</p>
                </div>
                <div className="w-full bg-gray-200 h-24 rounded-b-lg"></div>
              </div>
              
              {/* 1st Place */}
              <div className="flex flex-col items-center justify-end">
                <div className={`w-full ${getRankBadge(0)} rounded-t-xl p-6 text-center shadow-2xl transform scale-105`}>
                  <div className="flex justify-center mb-3">{getRankIcon(0)}</div>
                  <h3 className="font-bold text-xl mb-1">{leaderboard[0].name}</h3>
                  <p className="text-sm opacity-90 mb-2">{leaderboard[0].call_count} calls</p>
                  <p className="text-3xl font-bold">{parseFloat(leaderboard[0].avg_metric).toFixed(1)}</p>
                </div>
                <div className="w-full bg-yellow-100 h-32 rounded-b-lg"></div>
              </div>
              
              {/* 3rd Place */}
              <div className="flex flex-col items-center justify-end">
                <div className={`w-full ${getRankBadge(2)} rounded-t-xl p-6 text-center shadow-lg`}>
                  <div className="flex justify-center mb-3">{getRankIcon(2)}</div>
                  <h3 className="font-bold text-lg mb-1">{leaderboard[2].name}</h3>
                  <p className="text-sm opacity-90 mb-2">{leaderboard[2].call_count} calls</p>
                  <p className="text-2xl font-bold">{parseFloat(leaderboard[2].avg_metric).toFixed(1)}</p>
                </div>
                <div className="w-full bg-gray-200 h-16 rounded-b-lg"></div>
              </div>
            </div>
          )}
          
          {/* Full Leaderboard */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Full Rankings</h2>
            <div className="space-y-3">
              {leaderboard.map((rep, index) => (
                <div
                  key={rep.user_id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    index < 3 ? getRankBadge(index) : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 flex items-center justify-center">
                        {getRankIcon(index)}
                      </div>
                      <div className="flex-1">
                        <Link
                          to={`/rep/${rep.user_id}`}
                          className={`font-semibold ${
                            index < 3 ? 'text-inherit' : 'text-gray-900 hover:text-primary-600'
                          }`}
                        >
                          {rep.name}
                        </Link>
                        <p className={`text-sm ${index < 3 ? 'opacity-90' : 'text-gray-600'}`}>
                          {rep.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className={`text-sm ${index < 3 ? 'opacity-90' : 'text-gray-600'}`}>
                          Calls
                        </p>
                        <p className={`font-semibold ${index < 3 ? 'text-inherit' : 'text-gray-900'}`}>
                          {rep.call_count}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-sm ${index < 3 ? 'opacity-90' : 'text-gray-600'}`}>
                          {metricOptions.find(m => m.value === metric)?.label}
                        </p>
                        <p className={`text-2xl font-bold ${index < 3 ? 'text-inherit' : 'text-gray-900'}`}>
                          {parseFloat(rep.avg_metric).toFixed(1)}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-sm ${index < 3 ? 'opacity-90' : 'text-gray-600'}`}>
                          Avg Score
                        </p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          index < 3 
                            ? 'bg-white/20' 
                            : parseFloat(rep.avg_score) >= 80 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {parseFloat(rep.avg_score).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No data available for the selected period</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Leaderboard

