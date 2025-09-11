import React from 'react';
import { BarChart3, TrendingDown } from 'lucide-react';

interface SavingsChartProps {
  recommendations: {
    financial: {
      totalInvestment: number;
      estimatedSavings: number;
      savingsPercentage: number;
    };
  };
}

const SavingsChart: React.FC<SavingsChartProps> = ({ recommendations }) => {
  const retailPrice = recommendations.financial.totalInvestment + recommendations.financial.estimatedSavings;
  const fleetPrice = recommendations.financial.totalInvestment;
  const savings = recommendations.financial.estimatedSavings;
  
  const data = [
    { label: 'Retail Price', value: retailPrice, color: '#ef4444' },
    { label: 'Fleet Price', value: fleetPrice, color: '#e30613' },
    { label: 'Your Savings', value: savings, color: '#22c55e' }
  ];

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="h-6 w-6 text-[#e30613] mr-2" />
        <h2 className="text-xl font-bold text-gray-900">Cost Analysis</h2>
      </div>
      
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <span className="text-lg font-bold" style={{ color: item.color }}>
                ${item.value.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-1000"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <div className="flex items-center text-green-800 mb-2">
          <TrendingDown className="h-5 w-5 mr-2" />
          <span className="font-semibold">Total Savings Breakdown</span>
        </div>
        <div className="text-sm text-green-700">
          <p>• Fleet pricing reduces costs by {recommendations.financial.savingsPercentage.toFixed(1)}%</p>
          <p>• Service & maintenance included</p>
          <p>• No upfront capital investment required</p>
          <p>• Predictable monthly payments</p>
        </div>
      </div>
    </div>
  );
};

export default SavingsChart;