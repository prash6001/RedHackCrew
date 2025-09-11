import React from 'react';
import { ExternalLink, Settings, Package, Clock, DollarSign, CheckCircle } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  model: string;
  description: string;
  quantity: number;
  monthlyCost: number;
  totalCost: number;
  rentalDuration: number;
  justification: string[];
  category: string;
  productUrl: string;
  specifications: string[];
  competitiveAdvantages?: string[];
  roi?: number;
  utilizationRate?: number;
  priority?: 'high' | 'medium' | 'standard';
  // Real pricing from Hilti API
  pricing?: {
    standardPrice: number;
    fleetMonthlyPrice: number;
    fleetUpfrontCost: number;
    currency: string;
    priceSource: 'hilti_api' | 'estimated' | 'catalog_updated';
  } | null;
}

interface ToolRecommendationsProps {
  tools: Tool[];
}

const ToolRecommendations: React.FC<ToolRecommendationsProps> = ({ tools }) => {
  const getDiscountPercentage = (tool: Tool) => {
    // Use real pricing data if available
    if (tool.pricing && tool.pricing.standardPrice) {
      const retailPrice = tool.pricing.standardPrice;
      const fleetMonthlyPrice = tool.monthlyCost / tool.quantity; // Per unit monthly price
      const fleetTotalPrice = fleetMonthlyPrice * tool.rentalDuration;
      
      if (retailPrice > 0) {
        return Math.max(0, Math.round(((retailPrice - fleetTotalPrice) / retailPrice) * 100));
      }
    }
    
    // Fallback calculation
    return 25; // Default discount percentage
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
                  <div className="w-full h-48 bg-gradient-to-br from-red-50 to-red-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#e30613] mb-2">{tool.category}</div>
                      <div className="text-sm text-gray-600">{tool.model}</div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-[#e30613] text-white px-2 py-1 rounded text-sm font-bold">
                    -{getDiscountPercentage(tool)}%
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-xl text-gray-900">{tool.name}</h3>
                    {tool.productUrl && (
                      <a
                        href={tool.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#e30613] hover:text-red-700 transition-colors flex items-center space-x-1"
                        title="View on Hilti.com"
                      >
                        <ExternalLink className="h-5 w-5" />
                        <span className="text-sm font-medium">View Product</span>
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tool.category}</p>
                  <p className="text-sm text-gray-700">{tool.description}</p>
                  {tool.pricing && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                      <span className="font-medium text-blue-800">
                        {tool.pricing.priceSource === 'catalog_updated' ? '✅ Real Hilti Pricing' : 
                         tool.pricing.priceSource === 'hilti_api' ? '✅ Live API Pricing' : '⚠️ Estimated Pricing'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Specifications */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">Specifications</h4>
                  {tool.specifications.map((spec, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Settings className="h-3 w-3 mr-2 text-blue-500" />
                      <span className="text-gray-700">{spec}</span>
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
                    <div className="text-2xl font-bold text-purple-600">{tool.rentalDuration} months</div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Monthly Fleet Cost</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(tool.monthlyCost * tool.quantity)}</div>
                  <div className="text-sm text-green-700">{formatCurrency(tool.monthlyCost)} per unit</div>
                  {tool.pricing && tool.pricing.standardPrice && (
                    <div className="text-xs text-gray-600 mt-1">
                      Retail: {formatCurrency(tool.pricing.standardPrice * tool.quantity)}
                    </div>
                  )}
                </div>
                
                <div className="bg-[#e30613] text-white p-4 rounded-lg">
                  <div className="text-sm font-medium mb-1">Total Fleet Investment</div>
                  <div className="text-3xl font-bold">{formatCurrency(tool.totalCost)}</div>
                  <div className="text-sm opacity-90">Over {tool.rentalDuration} months</div>
                  {tool.pricing && tool.pricing.standardPrice && (
                    <div className="text-xs opacity-75 mt-1">
                      vs. {formatCurrency(tool.pricing.standardPrice * tool.quantity)} to purchase
                    </div>
                  )}
                  {/* Show potential pricing issue warning */}
                  {tool.pricing && tool.pricing.standardPrice && 
                   (tool.totalCost / (tool.pricing.standardPrice * tool.quantity)) > 8 && (
                    <div className="text-xs bg-yellow-600 bg-opacity-50 px-2 py-1 rounded mt-2">
                      ⚠️ Check pricing calculation
                    </div>
                  )}
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
                    {(tool.competitiveAdvantages || []).map((advantage, index) => (
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