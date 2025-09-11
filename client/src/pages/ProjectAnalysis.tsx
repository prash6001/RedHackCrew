import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, DollarSign, Shield, Clock, FileImage, AlertCircle } from 'lucide-react';
import ToolRecommendations from '../components/ToolRecommendations';
import SavingsChart from '../components/SavingsChart';
import ProductivityChart from '../components/ProductivityChart';
import { api, handleApiError, withRetry, type ProjectFormData, type ProjectAnalysis } from '../utils/api';

const ProjectAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisData, setAnalysisData] = useState<ProjectAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { selectedScopes, projectDetails, blueprint, geminiResult } = location.state || {};

  // Helper function to map old project types to new API format
  const mapProjectType = (oldType: string): ProjectFormData['projectType'] => {
    const typeMap: Record<string, ProjectFormData['projectType']> = {
      'residential': 'residential',
      'commercial': 'commercial', 
      'industrial': 'industrial',
      'infrastructure': 'infrastructure',
      'renovation': 'renovation',
      'roadwork': 'roadwork'
    };
    return typeMap[oldType] || 'commercial';
  };

  // Helper function to convert budget ranges to numeric values
  const convertBudgetToNumber = (budgetRange: string): number => {
    const budgetMap: Record<string, number> = {
      '25k-50k': 37500,      // Average of range
      '50k-100k': 75000,
      '100k-250k': 175000,
      '250k-500k': 375000,
      '500k-1m': 750000,
      '1m-2.5m': 1750000,
      '2.5m-5m': 3750000,
      '5m+': 7500000         // Conservative estimate for 5M+
    };
    return budgetMap[budgetRange] || 500000; // Default to 500k if not found
  };

  useEffect(() => {
    if ((!selectedScopes && !blueprint) || !projectDetails) {
      navigate('/');
      return;
    }

    const performAnalysis = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Convert the old projectDetails format to new API format
        // Priority: Use Gemini analysis text as blueprint, otherwise send blueprint file
        const projectData: ProjectFormData = {
          projectName: projectDetails.name || 'Unnamed Project',
          projectType: mapProjectType(projectDetails.projectType || 'commercial'),
          location: 'Location TBD', // HomePage doesn't collect location yet
          laborCount: parseInt(projectDetails.teamSize) || 10,
          timeline: parseInt(projectDetails.duration) || 12,
          budget: convertBudgetToNumber(projectDetails.budget) || 500000,
          existingTools: projectDetails.existingTools ? 
            (typeof projectDetails.existingTools === 'string' ? 
              projectDetails.existingTools.split(',').map((t: string) => t.trim()).filter((t: string) => t) : 
              projectDetails.existingTools
            ) : [],
          specialRequirements: projectDetails.specialRequirements || '',
          projectComplexity: (projectDetails.complexity as 'low' | 'medium' | 'high') || 'medium',
          // Send Gemini analysis text as blueprint if available, otherwise send file
          blueprint: geminiResult || blueprint
        };

        console.log('🔍 Sending project data to server:', projectData);
        
        if (geminiResult) {
          console.log('📄 Blueprint processed by Gemini - sending text analysis in blueprint field');
          console.log('✨ Gemini Analysis Preview:', geminiResult.substring(0, 200) + '...');
        } else if (blueprint) {
          console.log('📁 Sending blueprint file for server-side analysis');
        }

        console.log('🔍 Starting server-side analysis...');

        // Call the enhanced server API with retry logic
        const analysis = await withRetry(() => api.analyzeProject(projectData), 3, 2000);

        setAnalysisData(analysis);
        setAnalysisComplete(true);

        console.log('✅ Analysis completed successfully:', analysis);

      } catch (error) {
        console.error('❌ Analysis failed:', error);
        const errorInfo = handleApiError(error);
        setError(`Analysis failed: ${errorInfo.message}`);
        
        // Still show completion for fallback UI
        setAnalysisComplete(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Add realistic loading delay for better UX
    const timer = setTimeout(performAnalysis, blueprint ? 1500 : 1000);
    return () => clearTimeout(timer);
  }, [selectedScopes, projectDetails, blueprint, navigate]);

  if (!analysisComplete || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#e30613] mx-auto mb-8"></div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {blueprint && geminiResult ? 'AI Blueprint Analysis Complete - Processing Recommendations' : 
             blueprint ? 'AI Blueprint Analysis in Progress' : 
             'Analyzing Your Project Requirements'}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {blueprint && geminiResult 
              ? 'Using Gemini blueprint analysis results to generate optimal tool recommendations...'
              : analysisData?.analysis.method === 'bedrock' 
              ? 'AWS Bedrock Claude 3.5 Sonnet is generating intelligent recommendations...' 
              : 'Our enhanced AI system is processing your scope and generating optimal tool recommendations...'
            }
          </p>
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center text-green-600">
                <Zap className="h-5 w-5 mr-3" />
                <span>Matching tools to project requirements with AI precision</span>
              </div>
              <div className="flex items-center text-blue-600">
                <DollarSign className="h-5 w-5 mr-3" />
                <span>Calculating comprehensive TCO and ROI analysis</span>
              </div>
              <div className="flex items-center text-purple-600">
                <Shield className="h-5 w-5 mr-3" />
                <span>Determining fleet management service coverage needs</span>
              </div>
              <div className="flex items-center text-orange-600">
                <Clock className="h-5 w-5 mr-3" />
                <span>Optimizing fleet sizing, mix, and productivity metrics</span>
              </div>
              {blueprint && (
                <div className="flex items-center text-indigo-600">
                  <FileImage className="h-5 w-5 mr-3" />
                  <span>{geminiResult ? 'Blueprint analyzed with Gemini AI - integrating insights' : 'Processing blueprint for intelligent scope detection'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if analysis failed
  if (error && !analysisData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="bg-red-50 rounded-lg p-8 shadow-lg">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-900 mb-4">
              Analysis Failed
            </h1>
            <p className="text-red-700 mb-6">{error}</p>
            <div className="space-y-2 text-sm text-red-600">
              <p>Please check that the server is running and try again.</p>
              <p>Server should be available at: <code>http://localhost:3002</code></p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use analysisData if available, otherwise show basic fallback
  const displayData = analysisData || {
    project: { name: projectDetails?.name || 'Project', hasBlueprint: !!blueprint },
    analysis: { method: 'enhanced_rules' as const, model: 'Enhanced Fleet Management Engine' },
    financial: { totalInvestment: 0, estimatedSavings: 0, savingsPercentage: 0, budgetUtilization: 0 },
    metrics: { productivityIncrease: 0.25, downtimeReduction: 0.30 },
    recommendations: []
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {analysisData ? 'Project Analysis Complete' : 'Analysis Results'}
        </h1>
        <p className="text-xl text-gray-600">
          {displayData.analysis.method === 'bedrock' ? '🤖 AWS Bedrock AI Analysis' : '📊 Enhanced AI Analysis'} for <strong>{displayData.project.name}</strong>
        </p>
        {displayData.project.hasBlueprint && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm">
            <FileImage className="h-4 w-4 mr-2" />
            Blueprint processed with {geminiResult ? 'Gemini 2.0 Flash + ' : ''}{displayData.analysis.method === 'bedrock' ? 'Claude 3.5 Sonnet' : 'Enhanced AI'}
          </div>
        )}
        {analysisData && (
          <div className="mt-4 text-sm text-gray-500">
            Analysis Method: {analysisData.analysis.model}
          </div>
        )}
        {error && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            Using fallback analysis due to server issues
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="text-3xl font-bold text-[#e30613] mb-2">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(displayData.financial.estimatedSavings)}
          </div>
          <div className="text-sm text-gray-600">Total Savings</div>
          <div className="text-lg font-semibold text-green-600">
            {displayData.financial.savingsPercentage.toFixed(1)}% off retail
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {displayData.recommendations.length}
          </div>
          <div className="text-sm text-gray-600">Recommended Tools</div>
          <div className="text-lg font-semibold text-gray-800">
            {displayData.analysis.method === 'bedrock' ? 'AI-Optimized Fleet' : 'Enhanced Fleet'}
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            +{Math.round(displayData.metrics.productivityIncrease * 100)}%
          </div>
          <div className="text-sm text-gray-600">Productivity Improvement</div>
          <div className="text-lg font-semibold text-gray-800">
            vs. Owned Tools
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            -{Math.round(displayData.metrics.downtimeReduction * 100)}%
          </div>
          <div className="text-sm text-gray-600">Downtime Reduction</div>
          <div className="text-lg font-semibold text-gray-800">
            Fleet Management Service
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <SavingsChart recommendations={displayData} />
        <ProductivityChart recommendations={displayData} />
      </div>

      {/* Tool Recommendations */}
      <ToolRecommendations tools={displayData.recommendations} />

      {/* Generate Proposal Button */}
      <div className="text-center mt-12">
        <button
          onClick={() => navigate('/proposal', { 
            state: { 
              analysisData: displayData, 
              recommendations: displayData.recommendations,
              projectDetails, 
              selectedScopes, 
              blueprint,
              geminiResult,
              serverConnected: !!analysisData // Pass connection status
            } 
          })}
          className="inline-flex items-center px-8 py-4 bg-[#e30613] text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Generate {analysisData ? 'AI-Enhanced' : 'Enhanced'} Fleet Proposal
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
      
      {/* Server Status Indicator */}
      {analysisData && (
        <div className="text-center mt-6">
          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
            {analysisData.analysis.method === 'bedrock' ? 'AWS Bedrock Connected' : 'Enhanced Server Connected'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectAnalysis;