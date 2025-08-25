import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { BarChart3, Package, TrendingUp, Zap } from 'lucide-react'

const TopProductsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">No product data available</p>
      </div>
    )
  }

  // Process data for chart display - sort by purchase count first
  const chartData = data
    .sort((a, b) => {
      const aCount = a.purchase_count || a.purchaseCount || a.purchases || a.count || 0;
      const bCount = b.purchase_count || b.purchaseCount || b.purchases || b.count || 0;
      return bCount - aCount; // Sort descending (highest first)
    })
    .slice(0, 20) // Show top 20 products
    .map((item, index) => {
      // Try multiple possible field names for purchase count
      const purchaseCount = item.purchase_count || item.purchaseCount || item.purchases || item.count || 0
      const stockQuantity = item.current_stock || item.stock || item.quantity || 0
      const productName = item.product_name || item.name || item.product || 'Unknown Product'
      
      const processed = {
        ...item,
        purchaseCount: purchaseCount,
        stockQuantity: stockQuantity,
        displayName: productName.length > 25 
          ? productName.substring(0, 25) + '...' 
          : productName,
        index
      }
      
      return processed
    })

  const totalProducts = data.length
  const topProduct = chartData[0]?.product_name || chartData[0]?.name || 'N/A'
  const avgPurchases = Math.round(chartData.reduce((sum, item) => sum + item.purchaseCount, 0) / chartData.length)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="custom-tooltip bg-white border border-gray-200 rounded-lg shadow-xl p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 rounded-lg -mt-6 -mx-4 mb-3">
            <p className="font-semibold text-sm">{data.product_name}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Purchase Count:</span>
              <span className="font-bold text-blue-600">{data.purchaseCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Stock Quantity:</span>
              <span className="font-bold text-green-600">{data.stockQuantity.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <BarChart3 className="w-3 h-3" />
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Top 20 Products</p>
                <p className="text-lg font-semibold text-gray-900">{chartData.length}</p>
              </div>
            </div>
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Product</p>
              <p className="text-lg font-semibold text-gray-900">{topProduct}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Purchases</p>
              <p className="text-lg font-semibold text-gray-900">{avgPurchases}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="displayName" 
              tick={{ fontSize: 11, fill: '#374151', textAnchor: 'end' }}
              axisLine={{ stroke: '#d1d5db' }}
              angle={-45}
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-gray-700 font-medium">{value}</span>}
            />
            <Bar 
              dataKey="purchaseCount" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 5 Products Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {chartData.slice(0, 5).map((item, index) => (
          <div key={item.product_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
              <span className="text-xs text-blue-600 font-semibold">{item.purchaseCount.toLocaleString()}</span>
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
              {item.product_name}
            </h4>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Stock: {item.stockQuantity.toLocaleString()}</span>
              <Zap className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopProductsChart
