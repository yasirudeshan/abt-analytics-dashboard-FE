import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Activity, Users, Globe, Clock, RefreshCw, TrendingUp, BarChart3, Eye, Timer, Menu } from 'lucide-react'
import TopProductsChart from './TopProductsChart'
import MonthlySalesChart from './MonthlySalesChart'
import TopRegionsChart from './TopRegionsChart'
import CountryRevenueTable from './CountryRevenueTable'
import Sidebar from './Sidebar'

const API_BASE_URL = 'http://localhost:8080/api'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    countryRevenue: [],
    topProducts: [],
    monthlySales: [],
    topRegions: [],
    totalRevenue: 0,
    productCount: 0,
    countryCount: 0,
    monthCount: 0,
    recordCount: 0,
    lastUpdated: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loadingTime, setLoadingTime] = useState(null)
  const [lastLoadingTime, setLastLoadingTime] = useState(null)
  const [totalRenderTime, setTotalRenderTime] = useState(null)
  const [lastTotalRenderTime, setLastTotalRenderTime] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    const startTime = performance.now()
    fetchDashboardData()
    
    // Track total render time from component mount to data display
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      setTotalRenderTime(renderTime)
      setLastTotalRenderTime(renderTime)
    }
  }, [])

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'top-products', 'monthly-sales', 'top-regions', 'country-revenue']
      const scrollPosition = window.scrollY + 150 // Offset for header
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i])
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchDashboardData = async () => {
    const startTime = performance.now()
    
    try {
      setIsRefreshing(true)
      const response = await axios.get(`${API_BASE_URL}/dashboard`)
      
      // Calculate API response time
      const endTime = performance.now()
      const currentLoadingTime = endTime - startTime
      setLoadingTime(currentLoadingTime)
      setLastLoadingTime(currentLoadingTime)
      
      // Extract data from the nested structure and map field names
      const data = response.data.data
      const mappedData = {
        countryRevenue: data.country_revenues || [],
        topProducts: data.top_products || [],
        monthlySales: data.monthly_sales || [],
        topRegions: data.top_regions || [],
        totalRevenue: data.country_revenues?.reduce((sum, item) => sum + item.total_revenue, 0) || 0,
        productCount: data.top_products?.length || 0,
        countryCount: new Set(data.country_revenues?.map(item => item.country) || []).size,
        monthCount: data.monthly_sales?.length || 0,
        recordCount: data.record_count || 0,
        lastUpdated: data.last_updated
      }
      
      setDashboardData(mappedData)
      
      setError(null)
      setLastUpdated(new Date())
      
      // Track total time from API call to data display
      setTimeout(() => {
        const totalTime = performance.now() - startTime
        setTotalRenderTime(totalTime)
        setLastTotalRenderTime(totalTime)
      }, 100) // Small delay to ensure React has rendered
      
    } catch (err) {
      // Calculate loading time even for errors
      const endTime = performance.now()
      const currentLoadingTime = endTime - startTime
      setLoadingTime(currentLoadingTime)
      
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
      // Set empty data on error
      setDashboardData({
        countryRevenue: [],
        topProducts: [],
        monthlySales: [],
        topRegions: [],
        totalRevenue: 0,
        productCount: 0,
        countryCount: 0,
        monthCount: 0,
        recordCount: 0,
        lastUpdated: null
      })
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const formatLoadingTime = (time) => {
    if (time < 1000) {
      return `${time.toFixed(0)}ms`
    } else {
      return `${(time / 1000).toFixed(2)}s`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard</h2>
            <p className="text-gray-600">Preparing your analytics data...</p>
            {loadingTime && (
              <div className="mt-4 inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">API Response: {formatLoadingTime(loadingTime)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mb-6">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            {loadingTime && (
              <div className="mb-4 inline-flex items-center space-x-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">Failed after: {formatLoadingTime(loadingTime)}</span>
              </div>
            )}
            <button
              onClick={fetchDashboardData}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData.countryRevenue?.length && !dashboardData.topProducts?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-400 to-gray-600 rounded-full mb-6">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
            <p className="text-gray-600 mb-6">The dashboard is ready but no data has been loaded yet.</p>
            <button
              onClick={fetchDashboardData}
              className="btn-primary"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeSection={activeSection}
      />
      
      {/* Background overlay for sidebar */}
      <div className="hidden lg:block fixed inset-0 bg-black/5 pointer-events-none z-10" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-400/30 p-3 rounded-xl">
                <BarChart3 className="w-8 h-8 text-blue-200" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-50">ABT Analytics</h1>
                <p className="text-blue-200">Analytics dashboard for processing {dashboardData.recordCount?.toLocaleString() || '0'} records</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden bg-blue-400/30 hover:bg-blue-400/50 text-blue-50 p-2 rounded-lg transition-all duration-200"
                title="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {lastTotalRenderTime && (
                <div className="bg-blue-400/30 px-3 py-2 rounded-lg flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-blue-200" />
                  <span className="text-sm font-medium text-blue-50">Total: {formatLoadingTime(lastTotalRenderTime)}</span>
                </div>
              )}
              <button
                onClick={fetchDashboardData}
                disabled={isRefreshing}
                className="bg-blue-400/30 hover:bg-blue-400/50 text-blue-50 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div id="overview" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${dashboardData.totalRevenue?.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.productCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Countries</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.countryCount}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Months</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.monthCount}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>



        {/* Dashboard Sections */}
        <div className="space-y-8">
          {/* Top Products */}
          <div id="top-products" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Top Products</h2>
              </div>
            </div>
            <TopProductsChart data={dashboardData.topProducts} />
          </div>

          {/* Monthly Sales */}
          <div id="monthly-sales" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Monthly Sales</h2>
              </div>
            </div>
            <MonthlySalesChart data={dashboardData.monthlySales} />
          </div>

          {/* Top Regions */}
          <div id="top-regions" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Top Regions</h2>
              </div>
            </div>
            <TopRegionsChart data={dashboardData.topRegions} />
          </div>

          {/* Country Revenue Table */}
          <div id="country-revenue" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Eye className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Country Revenue</h2>
              </div>
            </div>
            <CountryRevenueTable data={dashboardData.countryRevenue} />
          </div>
        </div>

        {/* Last Updated with Performance Info */}
        <div className="mt-8 text-center">
          {lastUpdated && (
            <div className="text-sm text-gray-500 mb-2">
              Last updated: {lastUpdated.toLocaleString()}
            </div>
          )}
          {lastTotalRenderTime && (
            <div className="text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg inline-block">
              <Timer className="w-3 h-3 inline mr-1" />
              Total Time: {formatLoadingTime(lastTotalRenderTime)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

