import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Package, 
  TrendingUp, 
  Globe, 
  Eye, 
  Menu, 
  X,
  Home,
  ChevronRight,
  Activity
} from 'lucide-react'

const Sidebar = ({ isOpen, onToggle, activeSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      description: 'Dashboard summary and key metrics'
    },
    {
      id: 'top-products',
      label: 'Top Products',
      icon: Package,
      description: 'Product performance analysis'
    },
    {
      id: 'monthly-sales',
      label: 'Monthly Sales',
      icon: TrendingUp,
      description: 'Sales trends and patterns'
    },
    {
      id: 'top-regions',
      label: 'Top Regions',
      icon: Globe,
      description: 'Geographic performance data'
    },
    {
      id: 'country-revenue',
      label: 'Country Revenue',
      icon: Eye,
      description: 'Revenue by country breakdown'
    }
  ]

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerHeight = 120 // Approximate header height
      const elementPosition = element.offsetTop - headerHeight - 20
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
      
      // Close sidebar on mobile after navigation
      if (window.innerWidth < 1024) {
        onToggle()
      }
    }
  }

  const handleKeyPress = (event, sectionId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      scrollToSection(sectionId)
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${isCollapsed ? 'w-16' : 'w-64'}
        bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-2xl
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">ABT Analytics</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
            
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            
            return (
              <div key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  onKeyPress={(e) => handleKeyPress(e, item.id)}
                  className={`
                    w-full group relative flex items-center space-x-3 px-3 py-3 rounded-xl
                    transition-all duration-200 ease-in-out
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                  )}
                  
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600'}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                  )}
                  
                  {!isCollapsed && (
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Dashboard Status</div>
                  <div className="text-xs text-gray-600">All systems operational</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Sidebar
