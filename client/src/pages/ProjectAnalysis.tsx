import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, DollarSign, Shield, Clock, FileImage } from 'lucide-react';
import ToolRecommendations from '../components/ToolRecommendations';
import SavingsChart from '../components/SavingsChart';
import ProductivityChart from '../components/ProductivityChart';

const ProjectAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);

  const { selectedScopes, projectDetails, blueprint } = location.state || {};

  useEffect(() => {
    if ((!selectedScopes && !blueprint) || !projectDetails) {
      navigate('/');
      return;
    }

    // Simulate AI analysis
    const timer = setTimeout(() => {
      setAnalysisComplete(true);
      setRecommendations(generateRecommendations(selectedScopes, projectDetails, blueprint));
    }, blueprint ? 4000 : 3000); // Longer analysis time for blueprint

    return () => clearTimeout(timer);
  }, [selectedScopes, projectDetails, blueprint, navigate]);

  const generateRecommendations = (scopes: string[], details: any, blueprintFile?: File) => {
    // AI-powered tool recommendation logic
    const toolDatabase = getToolDatabase();
    const recommendedTools: any[] = [];
    
    if (blueprintFile) {
      // AI blueprint analysis - simulate intelligent scope detection
      const detectedScopes = ['heavy-drilling', 'concrete-cutting', 'layout-leveling', 'fastening'];
      detectedScopes.forEach(scope => {
        const scopeTools = toolDatabase.filter(tool => tool.categories.includes(scope));
        const optimizedTools = scopeTools.map(tool => ({
          ...tool,
          quantity: calculateQuantity(tool, details),
          duration: parseInt(details.duration) || 12,
          monthlyRate: Math.round(tool.fleetPrice / 12),
          totalCost: tool.fleetPrice,
          justification: generateJustification(tool, details),
          advantages: generateAdvantages(tool)
        }));
        recommendedTools.push(...optimizedTools);
      });
    } else {
      scopes.forEach(scope => {
        const scopeTools = toolDatabase.filter(tool => tool.categories.includes(scope));
        const optimizedTools = scopeTools.map(tool => ({
          ...tool,
          quantity: calculateQuantity(tool, details),
          duration: parseInt(details.duration) || 12,
          monthlyRate: Math.round(tool.fleetPrice / 12),
          totalCost: tool.fleetPrice,
          justification: generateJustification(tool, details),
          advantages: generateAdvantages(tool)
        }));
        recommendedTools.push(...optimizedTools);
      });
    }

    const totalRetailValue = recommendedTools.reduce((sum, tool) => sum + tool.retailPrice, 0);
    const totalFleetValue = recommendedTools.reduce((sum, tool) => sum + tool.fleetPrice, 0);
    const savings = totalRetailValue - totalFleetValue;
    const savingsPercentage = (savings / totalRetailValue) * 100;

    return {
      tools: recommendedTools,
      totalRetailValue,
      totalFleetValue,
      savings,
      savingsPercentage,
      analysisMethod: blueprintFile ? 'blueprint' : 'manual',
      detectedScopes: blueprintFile ? ['Heavy Drilling', 'Concrete Cutting', 'Layout/Leveling', 'Fastening'] : null,
      productivity: {
        uptimeImprovement: blueprintFile ? 30 : 25, // Better optimization with blueprint
        maintenanceReduction: 40,
        projectEfficiency: blueprintFile ? 35 : 30
      }
    };
  };

  const calculateQuantity = (tool: any, details: any) => {
    const teamSize = parseInt(details.teamSize) || 8;
    const complexity = details.complexity;
    const projectType = details.projectType;
    
    let baseQuantity = Math.ceil(teamSize / 4); // Base: 1 tool per 4 workers
    
    // Adjust based on project type
    if (projectType === 'industrial' || projectType === 'infrastructure') {
      baseQuantity = Math.ceil(baseQuantity * 1.5);
    } else if (projectType === 'commercial') {
      baseQuantity = Math.ceil(baseQuantity * 1.2);
    }
    
    // Adjust based on complexity
    if (complexity === 'high') {
      baseQuantity = Math.ceil(baseQuantity * 1.3);
    } else if (complexity === 'low') {
      baseQuantity = Math.max(1, Math.ceil(baseQuantity * 0.8));
    }
    
    return Math.max(1, baseQuantity);
  };

  const generateJustification = (tool: any, details: any) => {
    const teamSize = parseInt(details.teamSize) || 8;
    const duration = parseInt(details.duration) || 12;
    const projectType = details.projectType;
    
    const justifications = [
      `${teamSize > 10 ? 'Large' : teamSize > 5 ? 'Medium' : 'Small'} workforce requires ${teamSize > 10 ? 'multiple units' : 'adequate coverage'} for efficiency`,
      `${duration > 24 ? 'Long-term' : duration > 12 ? 'Medium-term' : 'Short-term'} project benefits from reliable fleet vs. purchase`,
      `${projectType === 'industrial' ? 'Industrial demands' : projectType === 'commercial' ? 'Commercial requirements' : 'Project specifications'} require professional-grade tools`
    ];
    
    return justifications;
  };

  const generateAdvantages = (tool: any) => {
    const advantages = [
      'Superior safety features',
      '30% higher productivity',
      'Reduced maintenance time',
      'Latest technology integration',
      'Professional support included',
      'Predictable operating costs'
    ];
    
    return advantages.slice(0, 3); // Return 3 random advantages
  };
  const getToolDatabase = () => {
    return [
      {
        id: 'te-3000-avr',
        name: 'TE 3000-AVR',
        category: 'Heavy Drilling',
        image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
        hiltiUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_ROTARY_HAMMERS_7124/CLS_COMBIHAMMERS_7124/r4574',
        retailPrice: 2899,
        fleetPrice: 1739,
        categories: ['heavy-drilling', 'demolition'],
        specs: {
          power: '1500W',
          weight: '11.2 kg',
          impactEnergy: '41 J'
        },
        description: 'Professional rotary hammer for heavy-duty drilling and chiseling applications'
      },
      {
        id: 'dd-120',
        name: 'DD 120',
        category: 'Diamond Coring',
        image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
        hiltiUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_DIAMOND_DRILLING_7124/r4575',
        retailPrice: 3299,
        fleetPrice: 1979,
        categories: ['diamond-coring'],
        specs: {
          power: '2000W',
          maxDiameter: '120mm',
          weight: '8.5 kg'
        },
        description: 'High-performance diamond core drilling system for precise concrete coring'
      },
      {
        id: 'dsh-700-x',
        name: 'DSH 700-X',
        category: 'Cutting',
        image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
        hiltiUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_HANDHELD_SAWS_7124/r4576',
        retailPrice: 1899,
        fleetPrice: 1139,
        categories: ['concrete-cutting'],
        specs: {
          power: '2300W',
          bladeDiameter: '300mm',
          cuttingDepth: '100mm'
        },
        description: 'Electric handheld saw for cutting concrete, stone and other masonry materials'
      },
      {
        id: 'sco-6-22',
        name: 'SCO 6-22',
        category: 'Cordless Cutting',
        image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
        hiltiUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_CORDLESS_SYSTEMS_7124/r4577',
        retailPrice: 899,
        fleetPrice: 539,
        categories: ['indoor-cutting'],
        specs: {
          voltage: '22V',
          bladeDiameter: '150mm',
          runtime: '45 min'
        },
        description: 'Cordless cut-off saw for indoor cutting applications with minimal dust'
      },
      {
        id: 'pm-40-mg',
        name: 'PM 40-MG',
        category: 'Layout',
        image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
        hiltiUrl: 'https://www.hilti.com/c/CLS_MEASURING_SYSTEMS_7125/CLS_LASER_LEVELS_7125/r4578',
        retailPrice: 1299,
        fleetPrice: 779,
        categories: ['layout-leveling'],
        specs: {
          range: '40m',
          accuracy: '±1.5mm',
          laserClass: 'Class 2'
        },
        description: 'Multi-line laser for accurate layout and leveling in construction projects'
      },
      {
        id: 'gx-3',
        name: 'GX 3',
        category: 'Fastening',
        image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
        hiltiUrl: 'https://www.hilti.com/c/CLS_FASTENING_SYSTEMS_7126/CLS_DIRECT_FASTENING_7126/r4579',
        retailPrice: 449,
        fleetPrice: 269,
        categories: ['fastening'],
        specs: {
          nailLength: '15-40mm',
          weight: '1.8 kg',
          capacity: '1100 nails'
        },
        description: 'Gas-actuated fastening tool for quick and reliable fastening to concrete and steel'
      }
    ];
  };

  if (!analysisComplete) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#e30613] mx-auto mb-8"></div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Analyzing Your Project Requirements
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Our AI is processing your scope of work and generating optimal tool recommendations...
          </p>
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center text-green-600">
                <Zap className="h-5 w-5 mr-3" />
                <span>Matching tools to project requirements</span>
              </div>
              <div className="flex items-center text-blue-600">
                <DollarSign className="h-5 w-5 mr-3" />
                <span>Calculating cost optimizations</span>
              </div>
              <div className="flex items-center text-purple-600">
                <Shield className="h-5 w-5 mr-3" />
                <span>Determining service coverage needs</span>
              </div>
              <div className="flex items-center text-orange-600">
                <Clock className="h-5 w-5 mr-3" />
                <span>Optimizing fleet sizing and mix</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Project Analysis Complete
        </h1>
        <p className="text-xl text-gray-600">
          {recommendations.analysisMethod === 'blueprint' ? 'AI Blueprint Analysis' : 'AI-powered recommendations'} for <strong>{projectDetails.name}</strong>
        </p>
        {recommendations.analysisMethod === 'blueprint' && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm">
            <FileImage className="h-4 w-4 mr-2" />
            Detected Scopes: {recommendations.detectedScopes.join(', ')}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="text-3xl font-bold text-[#e30613] mb-2">
            ${recommendations.savings.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Savings</div>
          <div className="text-lg font-semibold text-green-600">
            {recommendations.savingsPercentage.toFixed(1)}% off retail
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {recommendations.tools.length}
          </div>
          <div className="text-sm text-gray-600">Recommended Tools</div>
          <div className="text-lg font-semibold text-gray-800">
            Optimized Fleet
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            +{recommendations.productivity.uptimeImprovement}%
          </div>
          <div className="text-sm text-gray-600">Uptime Improvement</div>
          <div className="text-lg font-semibold text-gray-800">
            vs. Owned Tools
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            -{recommendations.productivity.maintenanceReduction}%
          </div>
          <div className="text-sm text-gray-600">Maintenance Costs</div>
          <div className="text-lg font-semibold text-gray-800">
            Full Service Included
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <SavingsChart recommendations={recommendations} />
        <ProductivityChart recommendations={recommendations} />
      </div>

      {/* Tool Recommendations */}
      <ToolRecommendations tools={recommendations.tools} />

      {/* Generate Proposal Button */}
      <div className="text-center mt-12">
        <button
          onClick={() => navigate('/proposal', { state: { recommendations, projectDetails, selectedScopes, blueprint } })}
          className="inline-flex items-center px-8 py-4 bg-[#e30613] text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Generate Fleet Proposal
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ProjectAnalysis;