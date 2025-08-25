import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import { Loader2, BarChart3, TrendingUp, Zap } from 'lucide-react'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-800">ABT Analytics Dashboard</h1>
            <p className="text-gray-600">Loading your business insights...</p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-800">Oops! Something went wrong</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Main Content */}
      <main className="relative z-10">
        <Dashboard />
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">ABT Analytics Dashboard</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Built with React, Go, and modern web technologies
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
