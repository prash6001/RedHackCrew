import React from 'react';
import { ExternalLink, Zap, Weight, Settings, Package, Clock, DollarSign, CheckCircle } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  hiltiUrl: string;
  retailPrice: number;
  fleetPrice: number;
  quantity: number;
  duration: number;
  monthlyRate: number;
  totalCost: number;
  justification: string[];
  advantages: string[];
  specs: {
    [key: string]: string;
  };
}

interface ToolRecommendationsProps {
  tools: Tool[];
}

const ToolRecommendations: React.FC<ToolRecommendationsProps> = ({ tools }) => {
  const getDiscountPercentage = (retail: number, fleet: number) => {
    return Math.round(((retail - fleet) / retail) * 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        Detailed Fleet Analysis & Tool Recommendations
      </h2>
      
      <div className="space-y-8">
        {tools.map((tool) => (
          <div key={tool.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            <div className="grid md:grid-cols-3 gap-6 p-6">
              {/* Tool Image and Basic Info */}
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={tool.image}
                    alt={tool.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 bg-[#e30613] text-white px-2 py-1 rounded text-sm font-bold">
                    -{getDiscountPercentage(tool.retailPrice, tool.fleetPrice)}%
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-xl text-gray-900">{tool.name}</h3>
                    <a
                      href={tool.hiltiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#e30613] hover:text-red-700 transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tool.category}</p>
                  <p className="text-sm text-gray-700">{tool.description}</p>
                </div>
                
                {/* Specifications */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">Specifications</h4>
                  {Object.entries(tool.specs).map(([key, value]) => (
                    <div key={key} className="flex items-center text-sm">
                      {key.toLowerCase().includes('power') && <Zap className="h-3 w-3 mr-2 text-yellow-500" />}
                      {key.toLowerCase().includes('weight') && <Weight className="h-3 w-3 mr-2 text-gray-500" />}
                      {!key.toLowerCase().includes('power') && !key.toLowerCase().includes('weight') && <Settings className="h-3 w-3 mr-2 text-blue-500" />}
                      <span className="text-gray-600">{key}:</span>
                      <span className="ml-1 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Fleet Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 text-lg">Fleet Requirements</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Package className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">Quantity</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{tool.quantity}</div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-800">Duration</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{tool.duration} weeks</div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Monthly Cost</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">${(tool.monthlyRate * tool.quantity).toLocaleString()}</div>
                  <div className="text-sm text-green-700">${tool.monthlyRate.toLocaleString()} per unit</div>
                </div>
                
                <div className="bg-[#e30613] text-white p-4 rounded-lg">
                  <div className="text-sm font-medium mb-1">Total Fleet Cost</div>
                  <div className="text-3xl font-bold">${(tool.totalCost * tool.quantity).toLocaleString()}</div>
                  <div className="text-sm opacity-90">vs ${(tool.retailPrice * tool.quantity).toLocaleString()} retail</div>
                </div>
              </div>
              
              {/* Justification and Advantages */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-3">Why This Tool?</h4>
                  <div className="space-y-2">
                    {tool.justification.map((reason, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-3">Competitive Advantages</h4>
                  <div className="space-y-2">
                    {tool.advantages.map((advantage, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-[#e30613] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{advantage}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">Fleet Benefits</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Maintenance & repair included</p>
                    <p>• 24/7 technical support</p>
                    <p>• Replacement guarantee</p>
                    <p>• Latest software updates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Why These Tools Were Selected
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-[#e30613] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Smart Matching</p>
              <p className="text-sm text-gray-600">Tools selected based on your specific scope of work requirements</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">$</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Cost Optimization</p>
              <p className="text-sm text-gray-600">Right-sized fleet prevents over/under-investment in tools</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolRecommendations;