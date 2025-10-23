import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter } from 'lucide-react'
import { getRecordings } from '../services/api'

const Recordings = () => {
  const [recordings, setRecordings] = useState([])
  const [filteredRecordings, setFilteredRecordings] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadRecordings()
  }, [])
  
  useEffect(() => {
    filterRecordings()
  }, [searchTerm, recordings])
  
  const loadRecordings = async () => {
    try {
      const response = await getRecordings({ limit: 100 })
      setRecordings(response.data.recordings)
      setFilteredRecordings(response.data.recordings)
    } catch (error) {
      console.error('Failed to load recordings:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const filterRecordings = () => {
    if (!searchTerm) {
      setFilteredRecordings(recordings)
      return
    }
    
    const filtered = recordings.filter(rec => 
      rec.meeting_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    setFilteredRecordings(filtered)
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
        <h1 className="text-3xl font-bold text-gray-900">Recordings</h1>
        <p className="text-gray-600 mt-2">All recorded sales calls and meetings</p>
      </div>
      
      {/* Search & Filter */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, user, or meeting..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600">Total Recordings</p>
          <p className="text-3xl font-bold mt-2">{recordings.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Total Duration</p>
          <p className="text-3xl font-bold mt-2">
            {Math.floor(recordings.reduce((sum, rec) => sum + (rec.duration || 0), 0) / 3600)}h
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">This Week</p>
          <p className="text-3xl font-bold mt-2">
            {recordings.filter(rec => {
              const recDate = new Date(rec.created_at)
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return recDate >= weekAgo
            }).length}
          </p>
        </div>
      </div>
      
      {/* Recordings List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Meeting Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rep</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Duration</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Meeting Code</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecordings.map((recording) => (
                <tr key={recording.recording_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{recording.meeting_title}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-gray-900">{recording.user_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{recording.user_id}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(recording.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {Math.floor(recording.duration / 60)} min
                  </td>
                  <td className="py-3 px-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{recording.meeting_code}</code>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/recording/${recording.recording_id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRecordings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No recordings found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Recordings

