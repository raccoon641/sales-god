import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Trophy, Video, TrendingUp } from 'lucide-react'

const Layout = ({ children }) => {
  const location = useLocation()
  
  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Team Analytics', path: '/team', icon: Users },
    { name: 'Recordings', path: '/recordings', icon: Video },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ]
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-primary-500 to-purple-500 text-white">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Sales God</h1>
                <p className="text-xs text-white/80">Admin Dashboard</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white/20 font-semibold'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          {/* Footer */}
          <div className="p-6 border-t border-white/20">
            <p className="text-xs text-white/60">© 2024 Sales God</p>
            <p className="text-xs text-white/60">v1.0.0</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="ml-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

