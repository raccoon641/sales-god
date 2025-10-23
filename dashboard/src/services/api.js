import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Recordings
export const getRecordings = (params) => api.get('/recordings', { params })
export const getRecording = (recordingId) => api.get(`/recordings/${recordingId}`)
export const deleteRecording = (recordingId) => api.delete(`/recordings/${recordingId}`)

// Analytics
export const getUserAnalytics = (userId) => api.get(`/analytics/user/${userId}`)
export const getTeamAnalytics = (teamId) => api.get(`/analytics/team/${teamId || ''}`)
export const getLeaderboard = (params) => api.get('/analytics/leaderboard', { params })
export const getUserInsights = (userId) => api.get(`/analytics/insights/${userId}`)

// Users
export const getUsers = (params) => api.get('/users', { params })
export const getUser = (userId) => api.get(`/users/${userId}`)
export const getTeams = () => api.get('/users/teams/all')

export default api

