import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Legend } from 'recharts'
import { BarChart3, Calendar, TrendingUp, Target } from 'lucide-react'

const MonthlySalesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">No sales data available</p>
      </div>
    )
  }

  // Process data for chart display
  const chartData = data
    .sort((a, b) => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December']
      return months.indexOf(a.month) - months.indexOf(b.month)
    })
    .map(item => ({
      ...item,
      // Map backend field names to chart expectations and ensure salesVolume is a number
      salesVolume: Number(item.sales_volume) || 0,
      revenue: item.total_sales || 0,
      // Format month for display
      displayMonth: `${item.month} ${item.year}`
    }))

  const peakMonth = chartData.reduce((max, item) => 
    item.salesVolume > max.salesVolume ? item : max, chartData[0])
  const peakSales = peakMonth?.salesVolume || 0
  const totalRevenue = chartData.reduce((sum, item) => sum + (item.revenue || 0), 0)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="custom-tooltip bg-white border border-gray-200 rounded-lg shadow-xl p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-2 rounded-lg -mt-6 -mx-4 mb-3">
            <p className="font-semibold text-sm">{data.displayMonth}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Sales Volume:</span>
              <span className="font-bold text-orange-600">{data.salesVolume.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Revenue:</span>
              <span className="font-bold text-green-600">${data.revenue?.toLocaleString() || '0'}</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <BarChart3 className="w-3 h-3" />
                <span>Month {data.month}</span>
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
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Peak Month</p>
              <p className="text-lg font-semibold text-gray-900">{peakMonth?.displayMonth || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Target className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Peak Sales</p>
              <p className="text-lg font-semibold text-gray-900">{peakSales.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-lg font-semibold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="displayMonth" 
              tick={{ fontSize: 11, fill: '#374151' }}
              axisLine={{ stroke: '#d1d5db' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-gray-700 font-medium">{value}</span>}
            />
            <Area 
              type="monotone" 
              dataKey="salesVolume" 
              stackId="1"
              stroke="#f97316" 
              fill="#fed7aa" 
              fillOpacity={0.6}
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#22c55e" 
              strokeWidth={3}
              dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Peak Sales Months Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {chartData
          .sort((a, b) => b.salesVolume - a.salesVolume)
          .slice(0, 4)
          .map((item, index) => (
            <div key={`${item.month}-${item.year}`} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                <span className="text-xs text-orange-600 font-semibold">{item.salesVolume.toLocaleString()}</span>
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                {item.displayMonth}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Revenue: ${item.revenue?.toLocaleString() || '0'}</span>
                <TrendingUp className="w-3 h-3" />
              </div>
            </div>
          ))}
      </div>

      {/* Monthly Performance Summary */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Months</p>
            <p className="text-lg font-semibold text-gray-900">{chartData.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Sales</p>
            <p className="text-lg font-semibold text-gray-900">
              {Math.round(chartData.reduce((sum, item) => sum + item.salesVolume, 0) / chartData.length).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Growth Trend</p>
            <p className="text-lg font-semibold text-green-600">↗️</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonthlySalesChart
