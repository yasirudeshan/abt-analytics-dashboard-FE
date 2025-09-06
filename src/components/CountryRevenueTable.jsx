import React, { useState } from 'react'
import { Globe, TrendingUp, BarChart3, Eye, Search, Filter, X } from 'lucide-react'

const CountryRevenueTable = ({ data, pagination, onLoadMore, loading }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('total_revenue')
  const [sortDirection, setSortDirection] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(null)

  // Debug pagination props (can be removed in production)
  // console.log('CountryRevenueTable - Pagination props:', pagination)
  // console.log('CountryRevenueTable - Data length:', data?.length)
  // console.log('CountryRevenueTable - Loading state:', loading)

  // Keyboard support for Load More button
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!loading && pagination?.hasMore) {
        onLoadMore()
      }
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">No country revenue data available</p>
      </div>
    )
  }

  // Filter data (sorting is handled server-side for revenue)
  const filteredData = data.filter(item =>
    item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // For client-side sorting of filtered results only (data is already sorted by revenue from server)
  const sortedData = [...filteredData].sort((a, b) => {
    // If sorting by revenue and no search filter, maintain server order
    if (sortField === 'total_revenue' && !searchTerm) {
      return 0 // Keep original order from server
    }
    
    let aValue = a[sortField]
    let bValue = b[sortField]

    if (sortField === 'country' || sortField === 'product_name') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4 text-gray-400" />
    }
    return sortDirection === 'asc' ? (
      <div className="w-4 h-4 text-blue-600">↑</div>
    ) : (
      <div className="w-4 h-4 text-blue-600">↓</div>
    )
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.total_revenue, 0)
  const totalTransactions = data.reduce((sum, item) => sum + item.transaction_count, 0)
  const uniqueCountries = new Set(data.map(item => item.country)).size
  const uniqueProducts = new Set(data.map(item => item.product_name)).size

  return (
    <div className="space-y-6">
      {/* Table Header with Summary Stats */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Globe className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-lg font-semibold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-lg font-semibold text-gray-900">{totalTransactions.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Countries</p>
              <p className="text-lg font-semibold text-gray-900">{uniqueCountries}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Products</p>
              <p className="text-lg font-semibold text-gray-900">{uniqueProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by country or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="flex items-center space-x-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="total_revenue">Total Revenue</option>
                <option value="transaction_count">Transaction Count</option>
                <option value="country">Country</option>
                <option value="product_name">Product Name</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200"
              >
                {sortDirection === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count and Pagination Info */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {sortedData.length} of {data.length} results
            {pagination && pagination.total && (
              <span className="ml-2 text-gray-500">
                (Total: {pagination.total.toLocaleString()} records)
              </span>
            )}
          </div>
          {pagination && pagination.total && (
            <div className="text-xs text-gray-500">
              Loaded: {((data.length / pagination.total) * 100).toFixed(1)}%
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        {pagination && pagination.total && data.length < pagination.total && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (data.length / pagination.total) * 100)}%` }}
            ></div>
          </div>
        )}
        
        
        {/* Load More Button */}
        {pagination?.hasMore && (
          <button
            id="load-more-button"
            onClick={onLoadMore}
            onKeyDown={handleKeyPress}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium shadow-sm hover:shadow-md disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={loading ? 'Loading more data...' : 'Load more revenue data'}
            tabIndex={0}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading More...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>
                  Load More 
                  {pagination?.total ? 
                    ` (${Math.min(50, pagination.total - data.length)} more)` : 
                    ' (50 more)'
                  }
                </span>
              </>
            )}
          </button>
        )}
        

        {/* All data loaded message */}
        {pagination && !pagination.hasMore && data.length > 0 && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
              <Eye className="w-4 h-4" />
              <span>All data loaded ({data.length.toLocaleString()} records)</span>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th 
                  onClick={() => handleSort('country')} 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 group"
                >
                  <div className="flex items-center space-x-2">
                    <span>Country</span>
                    <SortIcon field="country" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('product_name')} 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 group"
                >
                  <div className="flex items-center space-x-2">
                    <span>Product Name</span>
                    <SortIcon field="product_name" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('total_revenue')} 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 group"
                >
                  <div className="flex items-center space-x-2">
                    <span>Total Revenue</span>
                    <SortIcon field="total_revenue" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('transaction_count')} 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200 group"
                >
                  <div className="flex items-center space-x-2">
                    <span>Transactions</span>
                    <SortIcon field="transaction_count" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((item, index) => (
                <tr 
                  key={`${item.country}-${item.product_name}-${index}`}
                  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  onClick={() => setSelectedCountry(item)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{item.country}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{item.product_name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ${item.total_revenue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.transaction_count.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Country Details</h3>
              <button
                onClick={() => setSelectedCountry(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Country</p>
                <p className="text-base text-gray-900">{selectedCountry.country}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Product</p>
                <p className="text-base text-gray-900">{selectedCountry.product_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-lg font-semibold text-green-600">${selectedCountry.total_revenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Transaction Count</p>
                <p className="text-base text-gray-900">{selectedCountry.transaction_count.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CountryRevenueTable
