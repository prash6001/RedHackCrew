import React from "react";
import { useLocation } from "react-router-dom";
import {
  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  FileImage,
} from "lucide-react";

const FleetProposal = () => {
  const location = useLocation();
  const {
    analysisData,
    recommendations,
    projectDetails,
    selectedScopes,
    blueprint,
    serverConnected,
  } = location.state || {};

  // Use analysisData from server if available, otherwise fallback to recommendations
  const displayData = analysisData || recommendations || {};
  const totalFleetValue = displayData.financial?.totalInvestment || 0;

  // Get the current project duration in months
  const currentDuration = parseInt(
    projectDetails?.duration || displayData.project?.timeline || "24"
  );

  // Calculate dynamic contract terms based on project duration
  const leftDuration = Math.max(12, currentDuration - 12); // Minimum 12 months
  const centerDuration = currentDuration;
  const rightDuration = currentDuration + 12;

  // Base monthly rate (center option gets standard pricing)
  const baseMonthlyRate = Math.round(totalFleetValue / centerDuration) || 0;

  const contractTerms = [
    {
      duration: `${leftDuration} months`,
      monthlyRate: Math.round(baseMonthlyRate * 1.2), // 20% higher price
      setupFee: 500,
      savings: "Standard",
    },
    {
      duration: `${centerDuration} months`,
      monthlyRate: baseMonthlyRate, // Base price
      setupFee: 250,
      savings: "Recommended",
    },
    {
      duration: `${rightDuration} months`,
      monthlyRate: Math.round(baseMonthlyRate * 0.8), // 20% discount
      setupFee: 0,
      savings: "Maximum",
    },
  ];

  const serviceInclusions = [
    "Preventive maintenance and calibration",
    "Repair and replacement coverage",
    "Tool tracking and inventory management",
    "Technical support and training",
    "Software updates and upgrades",
    "Emergency tool replacement (24-48 hrs)",
    "End-of-contract tool removal",
  ];

  if (
    !displayData ||
    (!displayData.financial && !displayData.recommendations)
  ) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-xl text-gray-600">
          No proposal data available. Please start from the beginning.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Fleet Management Proposal
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Project: {projectDetails.name}
            </p>
            <p className="text-sm text-gray-500">
              Generated on {new Date().toLocaleDateString()}
            </p>
            {blueprint && (
              <div className="mt-2 inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                <FileImage className="h-3 w-3 mr-1" />
                AI Blueprint Analysis
              </div>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <DollarSign className="h-8 w-8 text-[#e30613] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#e30613]">
              ${(displayData.financial?.estimatedSavings || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Savings</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">100%</div>
            <div className="text-sm text-gray-600">Service Coverage</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {displayData.recommendations?.length ||
                displayData.tools?.length ||
                0}
            </div>
            <div className="text-sm text-gray-600">Optimized Tools</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {projectDetails?.duration ||
                displayData.project?.timeline ||
                "12"}
            </div>
            <div className="text-sm text-gray-600">
              Contract Duration (in months)
            </div>
          </div>
        </div>
      </div>

      {/* Contract Options */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Fleet Contract Options
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {contractTerms.map((term, index) => (
            <div
              key={term.duration}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                index === 1
                  ? "border-[#e30613] bg-red-50 relative"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#e30613] text-white px-3 py-1 rounded-full text-sm font-medium">
                    RECOMMENDED
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {term.duration}
                </h3>
                <div className="text-3xl font-bold text-[#e30613] mb-1">
                  ${term.monthlyRate.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">per month</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Setup Fee:</span>
                  <span className="font-medium">${term.setupFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Savings Level:</span>
                  <span className="font-medium text-green-600">
                    {term.savings}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Contract:</span>
                  <span className="font-bold">
                    $
                    {(
                      term.monthlyRate * parseInt(term.duration) +
                      term.setupFee
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                className={`w-full mt-4 py-2 rounded-lg font-medium transition-colors ${
                  index === 1
                    ? "bg-[#e30613] text-white hover:bg-red-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Service Inclusions */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Complete Service Package
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              What's Included
            </h3>
            <div className="space-y-3">
              {serviceInclusions.map((service) => (
                <div key={service} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{service}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Fleet Management Benefits
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#e30613] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Predictable Costs</p>
                  <p className="text-sm text-gray-600">
                    Fixed monthly payments with no surprises
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Latest Technology</p>
                  <p className="text-sm text-gray-600">
                    Always access to newest tools and features
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Expert Support</p>
                  <p className="text-sm text-gray-600">
                    Dedicated technical support team
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Summary */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Recommended Fleet Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">Tool</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-right py-3 px-4">Monthly Cost</th>
                <th className="text-right py-3 px-4">Total Cost</th>
                <th className="text-right py-3 px-4">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {(displayData.recommendations || displayData.tools || []).map(
                (tool: any) => (
                  <tr
                    key={tool.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100 rounded flex items-center justify-center">
                          <span className="text-[#e30613] font-bold text-xs">
                            {tool.category?.[0] || "T"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">{tool.name}</span>
                          <div className="text-xs text-gray-500">
                            {tool.model || tool.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{tool.category}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#e30613]">
                      $
                      {(
                        (tool.monthlyCost || tool.monthlyRate || 0) /
                        (tool.quantity || 1)
                      ).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      ${(tool.totalCost || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {tool.quantity || 1}
                    </td>
                  </tr>
                )
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 font-bold text-lg">
                <td colSpan={2} className="py-4 px-4">
                  Total Fleet Value
                </td>
                <td className="py-4 px-4 text-right text-[#e30613]">
                  $
                  {(displayData.recommendations || displayData.tools || [])
                    .reduce(
                      (sum: number, tool: any) =>
                        sum + (tool.monthlyCost || tool.monthlyRate || 0),
                      0
                    )
                    .toLocaleString()}
                  /mo
                </td>
                <td className="py-4 px-4 text-right text-gray-900">
                  $
                  {(
                    displayData.financial?.totalInvestment ||
                    displayData.contract?.totalCost ||
                    0
                  ).toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right text-green-600">
                  Save $
                  {(
                    displayData.financial?.estimatedSavings || 0
                  ).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gray-50 rounded-xl p-8 mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Fleet Proposal Summary
        </h2>
        <p className="text-gray-600 mb-6">
          This comprehensive fleet analysis has been prepared for your
          construction project. Our consultant will review these recommendations
          with you to finalize the optimal fleet configuration.
        </p>
        <div className="bg-white p-6 rounded-lg border-l-4 border-[#e30613]">
          <h3 className="font-semibold text-gray-900 mb-2">Next Steps</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              • Review detailed tool recommendations with your Hilti consultant
            </p>
            <p>
              • Customize fleet configuration based on specific project needs
            </p>
            <p>• Finalize contract terms and deployment schedule</p>
            <p>• Begin fleet deployment and on-site support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetProposal;
