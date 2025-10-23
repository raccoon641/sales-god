import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react'
import { getRecording } from '../services/api'

const RecordingDetails = () => {
  const { recordingId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('analysis')
  
  useEffect(() => {
    loadRecording()
  }, [recordingId])
  
  const loadRecording = async () => {
    try {
      const response = await getRecording(recordingId)
      setData(response.data)
    } catch (error) {
      console.error('Failed to load recording:', error)
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
  
  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Recording not found</p>
      </div>
    )
  }
  
  const { recording, transcription, analysis } = data
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link to="/recordings" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Recordings
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{recording.meeting_title}</h1>
        <div className="flex items-center gap-4 mt-2 text-gray-600">
          <span>{recording.user_id}</span>
          <span>•</span>
          <span>{new Date(recording.created_at).toLocaleDateString()}</span>
          <span>•</span>
          <span>{Math.floor(recording.duration / 60)} minutes</span>
        </div>
      </div>
      
      {/* Quick Stats */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overall Score</p>
                <p className="text-2xl font-bold">{parseFloat(analysis.overall_score || 0).toFixed(1)}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Questions Asked</p>
                <p className="text-2xl font-bold">{analysis.questions_asked || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Talk Ratio</p>
                <p className="text-2xl font-bold">{parseFloat(analysis.talk_ratio || 0).toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Filler Words</p>
                <p className="text-2xl font-bold">{analysis.filler_words_count || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`pb-4 px-1 font-medium transition-colors ${
              activeTab === 'analysis'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Analysis
          </button>
          <button
            onClick={() => setActiveTab('transcription')}
            className={`pb-4 px-1 font-medium transition-colors ${
              activeTab === 'transcription'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Transcription
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'analysis' && analysis && (
        <div className="space-y-6">
          {/* Sentiment */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Sentiment Analysis</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Overall Sentiment</p>
                <p className="text-2xl font-bold capitalize">{analysis.overall_sentiment}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Sentiment Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        analysis.sentiment_score > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.abs(analysis.sentiment_score) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{parseFloat(analysis.sentiment_score || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Metrics */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Call Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Words</p>
                <p className="text-xl font-bold">{analysis.total_words || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Rep Words</p>
                <p className="text-xl font-bold">{analysis.rep_words || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Prospect Words</p>
                <p className="text-xl font-bold">{analysis.prospect_words || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Speaking Pace</p>
                <p className="text-xl font-bold">{parseFloat(analysis.average_speaking_pace || 0).toFixed(0)} wpm</p>
              </div>
            </div>
          </div>
          
          {/* Topics */}
          {analysis.topics && analysis.topics.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Key Topics Discussed</h2>
              <div className="flex flex-wrap gap-2">
                {analysis.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {topic.word} ({topic.count})
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Objections */}
          {analysis.objections && analysis.objections.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Objections Detected</h2>
              <div className="space-y-3">
                {analysis.objections.map((objection, index) => (
                  <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-gray-700">{objection.text}</p>
                    <p className="text-xs text-gray-500 mt-1">Type: {objection.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Next Steps */}
          {analysis.next_steps && analysis.next_steps.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Next Steps</h2>
              <div className="space-y-3">
                {analysis.next_steps.map((step, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-gray-700">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'transcription' && transcription && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Full Transcription</h2>
          {transcription.length > 0 ? (
            <div className="space-y-4">
              {transcription.map((segment, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-24 flex-shrink-0 text-sm text-gray-500">
                    {new Date(segment.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800">{segment.text}</p>
                    {segment.confidence && (
                      <p className="text-xs text-gray-500 mt-1">
                        Confidence: {(segment.confidence * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No transcription available</p>
          )}
        </div>
      )}
    </div>
  )
}

export default RecordingDetails

