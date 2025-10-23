import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TeamAnalytics from './pages/TeamAnalytics'
import RepDetails from './pages/RepDetails'
import Recordings from './pages/Recordings'
import RecordingDetails from './pages/RecordingDetails'
import Leaderboard from './pages/Leaderboard'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/team" element={<TeamAnalytics />} />
          <Route path="/rep/:userId" element={<RepDetails />} />
          <Route path="/recordings" element={<Recordings />} />
          <Route path="/recording/:recordingId" element={<RecordingDetails />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

