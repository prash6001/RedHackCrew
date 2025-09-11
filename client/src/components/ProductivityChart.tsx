import React from 'react';
import { TrendingUp, Clock, Shield, Zap } from 'lucide-react';

interface ProductivityChartProps {
  recommendations: {
    metrics: {
      productivityIncrease: number;
      downtimeReduction: number;
    };
  };
}

const ProductivityChart: React.FC<ProductivityChartProps> = ({ recommendations }) => {
  const metrics = [
    {
      label: 'Productivity Increase',
      value: Math.round(recommendations.metrics.productivityIncrease * 100),
      icon: Clock,
      color: '#3b82f6',
      description: 'Overall project efficiency improvement'
    },
    {
      label: 'Downtime Reduction',
      value: Math.round(recommendations.metrics.downtimeReduction * 100),
      icon: Shield,
      color: '#10b981',
      description: 'Less downtime due to fleet management'
    },
    {
      label: 'Fleet Efficiency',
      value: 30, // Fixed value for fleet efficiency
      icon: Zap,
      color: '#f59e0b',
      description: 'Right tools available when needed'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <TrendingUp className="h-6 w-6 text-[#e30613] mr-2" />
        <h2 className="text-xl font-bold text-gray-900">Productivity Impact</h2>
      </div>
      
      <div className="space-y-6">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <div key={metric.label} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${metric.color}15` }}
                  >
                    <IconComponent className="h-4 w-4" style={{ color: metric.color }} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{metric.label}</p>
                    <p className="text-xs text-gray-600">{metric.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold" style={{ color: metric.color }}>
                    +{metric.value}%
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${metric.value}%`,
                    backgroundColor: metric.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center text-blue-800 mb-2">
          <TrendingUp className="h-5 w-5 mr-2" />
          <span className="font-semibold">Fleet Management Benefits</span>
        </div>
        <div className="text-sm text-blue-700">
          <p>• Professional maintenance keeps tools running</p>
          <p>• Instant replacement for failed equipment</p>
          <p>• Latest technology and software updates</p>
          <p>• Dedicated field support technicians</p>
        </div>
      </div>
    </div>
  );
};

export default ProductivityChart;