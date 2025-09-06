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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50, // Start with 50 records for better UX
    total: 0,
    hasMore: true
  })
  const [loading, setLoading] = useState({
    countryRevenue: true,
    topProducts: true,
    monthlySales: true,
    topRegions: true
  })
  const [errors, setErrors] = useState({
    countryRevenue: null,
    topProducts: null,
    monthlySales: null,
    topRegions: null
  })
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
    fetchAllDashboardData()
    
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

  // Fetch revenue by country data with pagination and sorting
  const fetchRevenueByCountry = async (page = 1, limit = 50, append = false) => {
    try {
      console.log(`Fetching revenue by country - Page: ${page}, Limit: ${limit}`)
      setLoading(prev => ({ ...prev, countryRevenue: true }))
      setErrors(prev => ({ ...prev, countryRevenue: null }))
      
      // Try with sorting parameters first, fallback to original if it fails
      let response
      try {
        response = await axios.get(`${API_BASE_URL}/revenue-by-country?page=${page}&limit=${limit}&sort=total_revenue&order=desc`)
      } catch (sortError) {
        console.warn('Sorting parameters not supported, falling back to original API:', sortError.message)
        // Fallback to original API call without sorting
        response = await axios.get(`${API_BASE_URL}/revenue-by-country?page=${page}&limit=${limit}`)
      }
      const responseData = response.data
      
      // Handle different response structures
      let rawData = responseData.data || responseData || []
      
      // Handle response data (backend now provides proper pagination)
      const data = rawData
      const total = responseData.total || responseData.count || rawData.length
      const currentPage = responseData.page || page
      const totalPages = responseData.totalPages || Math.ceil(total / limit)
      
      console.log(`Revenue by country data - Received: ${data.length} records, Total: ${total}, Page: ${currentPage}/${totalPages}`)
      
      // Use hasMore from backend response or calculate it
      const hasMore = responseData.hasMore !== undefined ? responseData.hasMore : currentPage < totalPages
      
      const newPaginationState = {
        page: currentPage,
        limit: limit,
        total: total,
        hasMore: hasMore
      }
      console.log('Setting pagination state:', newPaginationState)
      setPagination(newPaginationState)
      
      // If appending (load more), combine with existing data, otherwise replace
      const newCountryRevenue = append 
        ? [...dashboardData.countryRevenue, ...data]
        : data
      
      // Calculate metrics from the new data
      const totalRevenue = newCountryRevenue.reduce((sum, item) => sum + (item.total_revenue || 0), 0)
      const countryCount = new Set(newCountryRevenue.map(item => item.country) || []).size
      const recordCount = newCountryRevenue.reduce((sum, item) => sum + (item.transaction_count || 0), 0)
      
      setDashboardData(prev => ({
        ...prev,
        countryRevenue: newCountryRevenue
      }))
      
    } catch (err) {
      console.error('Error fetching revenue by country:', err)
      setErrors(prev => ({ ...prev, countryRevenue: 'Failed to load country revenue data' }))
      
      // Set empty data only if this is the first load
      if (!append) {
        setDashboardData(prev => ({
          ...prev,
          countryRevenue: []
        }))
      }
    } finally {
      setLoading(prev => ({ ...prev, countryRevenue: false }))
    }
  }

  // Fetch top products data
  const fetchTopProducts = async () => {
    try {
      console.log('Fetching top products...')
      setLoading(prev => ({ ...prev, topProducts: true }))
      setErrors(prev => ({ ...prev, topProducts: null }))
      
      const response = await axios.get(`${API_BASE_URL}/top-products`)
      const data = response.data.data || response.data || []
      console.log('Top products data:', data)
      
      setDashboardData(prev => ({
        ...prev,
        topProducts: data
      }))
    } catch (err) {
      console.error('Error fetching top products:', err)
      setErrors(prev => ({ ...prev, topProducts: 'Failed to load top products data' }))
      setDashboardData(prev => ({
        ...prev,
        topProducts: []
      }))
    } finally {
      setLoading(prev => ({ ...prev, topProducts: false }))
    }
  }

  // Fetch sales by month data
  const fetchSalesByMonth = async () => {
    try {
      console.log('Fetching sales by month...')
      setLoading(prev => ({ ...prev, monthlySales: true }))
      setErrors(prev => ({ ...prev, monthlySales: null }))
      
      const response = await axios.get(`${API_BASE_URL}/sales-by-month`)
      const data = response.data.data || response.data || []
      console.log('Sales by month data:', data)
      
      setDashboardData(prev => ({
        ...prev,
        monthlySales: data,
        monthCount: data.length
      }))
    } catch (err) {
      console.error('Error fetching sales by month:', err)
      setErrors(prev => ({ ...prev, monthlySales: 'Failed to load monthly sales data' }))
      setDashboardData(prev => ({
        ...prev,
        monthlySales: []
      }))
    } finally {
      setLoading(prev => ({ ...prev, monthlySales: false }))
    }
  }

  // Fetch dashboard summary data (exact totals)
  const fetchDashboardSummary = async () => {
    try {
      console.log('Fetching dashboard summary...')
      const response = await axios.get(`${API_BASE_URL}/summary`)
      const summaryData = response.data.data || response.data || {}
      console.log('Dashboard summary data:', summaryData)
      
      // Update dashboard with exact totals from complete dataset
      setDashboardData(prev => ({
        ...prev,
        totalRevenue: summaryData.total_revenue || 0,
        recordCount: summaryData.total_transactions || summaryData.total_records || 0,
        countryCount: summaryData.total_countries || 0,
        productCount: summaryData.unique_products || summaryData.total_products || 0,
        monthCount: summaryData.months_covered || prev.monthCount,
        lastUpdated: summaryData.last_updated
      }))
    } catch (err) {
      console.error('Error fetching dashboard summary:', err)
      // Fallback: keep existing values if summary fails
    }
  }

  // Fetch top regions data
  const fetchTopRegions = async () => {
    try {
      console.log('Fetching top regions...')
      setLoading(prev => ({ ...prev, topRegions: true }))
      setErrors(prev => ({ ...prev, topRegions: null }))
      
      const response = await axios.get(`${API_BASE_URL}/top-regions`)
      const data = response.data.data || response.data || []
      console.log('Top regions data:', data)
      
      setDashboardData(prev => ({
        ...prev,
        topRegions: data
      }))
    } catch (err) {
      console.error('Error fetching top regions:', err)
      setErrors(prev => ({ ...prev, topRegions: 'Failed to load top regions data' }))
      setDashboardData(prev => ({
        ...prev,
        topRegions: []
      }))
    } finally {
      setLoading(prev => ({ ...prev, topRegions: false }))
    }
  }

  // Load more revenue data
  const loadMoreRevenueData = async () => {
    if (pagination.hasMore && !loading.countryRevenue) {
      // Store the current table scroll position to maintain context
      const tableContainer = document.querySelector('#country-revenue .overflow-x-auto')
      const loadMoreButton = document.getElementById('load-more-button')
      const currentDataLength = dashboardData.countryRevenue.length
      
      await fetchRevenueByCountry(pagination.page + 1, pagination.limit, true)
      
      // After data loads, scroll to show the newly loaded data
      setTimeout(() => {
        // Try to scroll to show the area where new data was added
        const countryRevenueSection = document.getElementById('country-revenue')
        if (countryRevenueSection && tableContainer) {
          // Calculate position to show the newly loaded rows
          const tableRows = tableContainer.querySelectorAll('tbody tr')
          if (tableRows.length > currentDataLength) {
            // Scroll to show the first newly loaded row
            const newRowIndex = Math.max(0, currentDataLength - 10) // Show a few rows before the new ones for context
            const targetRow = tableRows[newRowIndex]
            if (targetRow) {
              targetRow.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              })
            }
          } else {
            // Fallback: scroll to the load more button area
            const loadMoreBtn = document.getElementById('load-more-button')
            if (loadMoreBtn) {
              loadMoreBtn.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              })
            }
          }
        }
      }, 200) // Slightly longer delay to ensure table is rendered
    }
  }

  // Fetch all dashboard data using separate API calls
  const fetchAllDashboardData = async () => {
    const startTime = performance.now()
    console.log('=== Starting fetchAllDashboardData ===')
    
    try {
      setIsRefreshing(true)
      console.log('Current loading state before API calls:', loading)
      
      // Reset pagination for fresh load
      setPagination(prev => ({ ...prev, page: 1, hasMore: true }))
      
      // Execute all API calls in parallel
      const promises = [
        fetchDashboardSummary(), // Get exact totals first
        fetchRevenueByCountry(1, 50, false), // Start with page 1, 50 records
        fetchTopProducts(),
        fetchSalesByMonth(),
        fetchTopRegions()
      ]
      
      console.log('Executing API calls in parallel...')
      await Promise.all(promises)
      console.log('All API calls completed')
      
      // Calculate total API response time
      const endTime = performance.now()
      const currentLoadingTime = endTime - startTime
      setLoadingTime(currentLoadingTime)
      setLastLoadingTime(currentLoadingTime)
      
      setLastUpdated(new Date())
      console.log('Dashboard data fetch completed in:', currentLoadingTime, 'ms')
      
      // Track total time from API call to data display
      setTimeout(() => {
        const totalTime = performance.now() - startTime
        setTotalRenderTime(totalTime)
        setLastTotalRenderTime(totalTime)
        console.log('Total render time:', totalTime, 'ms')
      }, 100) // Small delay to ensure React has rendered
      
    } catch (err) {
      // Calculate loading time even for errors
      const endTime = performance.now()
      const currentLoadingTime = endTime - startTime
      setLoadingTime(currentLoadingTime)
      
      console.error('Error in fetchAllDashboardData:', err)
      setLastUpdated(new Date())
    } finally {
      setIsRefreshing(false)
      console.log('=== fetchAllDashboardData completed ===')
    }
  }

  const formatLoadingTime = (time) => {
    if (time < 1000) {
      return `${time.toFixed(0)}ms`
    } else {
      return `${(time / 1000).toFixed(2)}s`
    }
  }

  // Check if any section is still loading
  const isAnyLoading = Object.values(loading).some(isLoading => isLoading)
  
  // Check if there are any errors
  const hasErrors = Object.values(errors).some(error => error !== null)
  const errorMessage = Object.values(errors).find(error => error !== null) || 'Failed to load dashboard data. Please try again.'
  
  // Debug logging (can be removed in production)
  console.log('Current loading state:', loading)
  console.log('isAnyLoading:', isAnyLoading)
  console.log('hasErrors:', hasErrors)
  console.log('Dashboard data:', dashboardData)
  console.log('Errors:', errors)
  
  if (isAnyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard</h2>
            <p className="text-gray-600">Preparing your analytics data...</p>
            <div className="mt-4 text-sm text-gray-500">
              Loading sections: {Object.entries(loading).filter(([_, isLoading]) => isLoading).map(([section]) => section).join(', ')}
            </div>
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

  // Show error only if all loading is complete and there are errors
  if (hasErrors && !isAnyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mb-6">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            {loadingTime && (
              <div className="mb-4 inline-flex items-center space-x-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">Failed after: {formatLoadingTime(loadingTime)}</span>
              </div>
            )}
            <button
              onClick={fetchAllDashboardData}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show "no data" only if all APIs have completed and all returned empty data
  const allDataEmpty = !dashboardData.countryRevenue?.length && 
                       !dashboardData.topProducts?.length && 
                       !dashboardData.monthlySales?.length && 
                       !dashboardData.topRegions?.length
  
  if (!isAnyLoading && !hasErrors && allDataEmpty) {
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
              onClick={fetchAllDashboardData}
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
                <p className="text-blue-200">Analytics dashboard for processing {dashboardData.recordCount?.toLocaleString() || '0'} transactions</p>
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
                onClick={fetchAllDashboardData}
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
            <CountryRevenueTable 
              data={dashboardData.countryRevenue} 
              pagination={pagination}
              onLoadMore={loadMoreRevenueData}
              loading={loading.countryRevenue}
            />
            
          </div>
        </div>

        {/* Last Updated with Performance Info */}
        <div className="mt-8 text-center">
          {dashboardData.lastUpdated && (
            <div className="text-sm text-gray-500 mb-2">
              Data last updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
            </div>
          )}
          {lastUpdated && (
            <div className="text-sm text-gray-500 mb-2">
              Dashboard refreshed: {lastUpdated.toLocaleString()}
            </div>
          )}
          {lastTotalRenderTime && (
            <div className="text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg inline-block">
              <Timer className="w-3 h-3 inline mr-1" />
              Load Time: {formatLoadingTime(lastTotalRenderTime)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

