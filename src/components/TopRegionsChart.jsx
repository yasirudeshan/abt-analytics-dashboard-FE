import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { BarChart3, Globe, Award, TrendingUp } from 'lucide-react'

const TopRegionsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">No regional data available</p>
      </div>
    )
  }

  // Process data for chart display
  const chartData = data
    .slice(0, 30) // Show top 30 regions
    .map((item, index) => ({
      ...item,
      // Map backend field names to chart expectations
      totalRevenue: item.total_revenue || 0,
      itemsSold: item.items_sold || 0,
      // Truncate long region names for better display
      displayName: item.region.length > 20 
        ? item.region.substring(0, 20) + '...' 
        : item.region,
      index
    }))

  const totalRevenue = chartData.reduce((sum, item) => sum + item.totalRevenue, 0)
  const totalItems = chartData.reduce((sum, item) => sum + item.itemsSold, 0)
  const topRegion = chartData[0]?.region || 'N/A'

  // Enhanced color palette for bars
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#FBBF24', '#F87171', '#A78BFA', '#22D3EE',
    '#4ADE80', '#FB923C', '#F472B6', '#818CF8', '#2DD4BF',
    '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16',
    '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#FBBF24'
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="custom-tooltip bg-white border border-gray-200 rounded-lg shadow-xl p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-2 rounded-lg -mt-6 -mx-4 mb-3">
            <p className="font-semibold text-sm">{data.region}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Total Revenue:</span>
              <span className="font-bold text-purple-600">${data.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Items Sold:</span>
              <span className="font-bold text-green-600">{data.itemsSold.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Award className="w-3 h-3" />
                <span>Rank #{data.index + 1}</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Chart Header with Quick Stats */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-lg font-semibold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-lg font-semibold text-gray-900">{totalItems.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Region</p>
              <p className="text-lg font-semibold text-gray-900">{topRegion}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-xl p-4">
        {/* Debug Info */}
        <div className="mb-4 p-2 bg-blue-100 rounded text-xs text-blue-800">
          <p>Chart Data: {chartData.length} regions | Total Revenue: ${totalRevenue.toLocaleString()} | Total Items: {totalItems.toLocaleString()}</p>
        </div>
        
        <ResponsiveContainer width="100%" height={600}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="displayName" 
              tick={{ fontSize: 9, fill: '#374151' }}
              axisLine={{ stroke: '#d1d5db' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={120}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-gray-700 font-medium">{value}</span>}
            />
            <Bar 
              dataKey="totalRevenue" 
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 5 Revenue Regions Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {chartData.slice(0, 5).map((item, index) => (
          <div key={item.region} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
              <span className="text-xs text-purple-600 font-semibold">${item.totalRevenue.toLocaleString()}</span>
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
              {item.region}
            </h4>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Items: {item.itemsSold.toLocaleString()}</span>
              <Award className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Regional Performance Summary */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Regions</p>
            <p className="text-lg font-semibold text-gray-900">{chartData.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Revenue</p>
            <p className="text-lg font-semibold text-gray-900">
              ${Math.round(totalRevenue / chartData.length).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Performance</p>
            <p className="text-lg font-semibold text-green-600">↗️</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopRegionsChart
