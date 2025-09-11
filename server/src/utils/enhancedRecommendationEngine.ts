import { ProjectData, EnhancedToolRecommendation } from '../types/ProjectData';
import { 
  getArchetypeTools, 
  getToolNecessity, 
  getArchetypeQuantityMultiplier,
  getArchetypeJustification,
  TOOL_PRIORITY_MATRIX 
} from './projectArchetypes';
import { 
  enhanceToolWithServiceFeatures,
  evaluateToolsOnDemand,
  ToD_Recommendation,
  HILTI_FLEET_SERVICES 
} from './fleetServiceModeling';
import { calculateTCO, TCOComparison } from './tcoCalculator';
import { RiskModelingEngine, ProjectRiskProfile } from './riskModelingEngine';

// Enhanced recommendation strategy from Section 4.1
export interface RecommendationStrategy {
  coreFleetTools: EnhancedToolRecommendation[];
  toolsOnDemandCandidates: ToD_Recommendation[];
  hybridRecommendations: HybridToolStrategy[];
  tcoAnalysis: TCOComparison;
  riskProfile: ProjectRiskProfile;
  strategicInsights: StrategicInsight[];
}

export interface HybridToolStrategy {
  toolName: string;
  coreFleetDuration: number; // months
  todDuration: number; // months
  totalSavings: number;
  strategy: 'seasonal_scaling' | 'phase_based' | 'backup_coverage';
  implementation: string;
}

export interface StrategicInsight {
  category: 'cost_optimization' | 'risk_mitigation' | 'operational_efficiency' | 'service_value';
  insight: string;
  impact: 'high' | 'medium' | 'low';
  actionItem: string;
}

// Enhanced tool database with Fleet Management features
const ENHANCED_HILTI_TOOLS = {
  drilling: [
    {
      name: 'TE 60-ATC/AVR Rotary Hammer',
      model: 'TE 60-ATC/AVR',
      description: 'Heavy-duty rotary hammer with active torque control and anti-vibration technology',
      baseMonthlyRate: 145,
      category: 'Drilling',
      productUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_ROTARY_HAMMERS_7124/CLS_ROTARY_HAMMERS_SDS_MAX_7124/r185',
      applicableProjects: ['commercial', 'industrial', 'infrastructure'],
      laborRequirement: 10,
      specifications: ['SDS-max chuck', '1500W motor', 'Active Torque Control', 'Anti-vibration system'],
      todEligibility: { eligible: true, premiumMultiplier: 1.3, minDuration: 1 },
      servicePriority: 'high', // Critical for project timeline
      repairComplexity: 'medium'
    },
    {
      name: 'TE 7-C Rotary Hammer',
      model: 'TE 7-C',
      description: 'Versatile SDS-plus rotary hammer for drilling and light chiseling',
      baseMonthlyRate: 85,
      category: 'Drilling',
      productUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_ROTARY_HAMMERS_7124/CLS_ROTARY_HAMMERS_SDS_PLUS_7124/r7c',
      applicableProjects: ['residential', 'commercial', 'renovation'],
      laborRequirement: 5,
      specifications: ['SDS-plus chuck', '720W motor', '2.4J impact energy', 'Compact design'],
      todEligibility: { eligible: true, premiumMultiplier: 1.25, minDuration: 1 },
      servicePriority: 'medium',
      repairComplexity: 'low'
    }
  ],
  cutting: [
    {
      name: 'WSC 85 Wall Saw',
      model: 'WSC 85',
      description: 'Professional wall saw for precise cutting with dust management',
      baseMonthlyRate: 320,
      category: 'Cutting',
      productUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_DIAMOND_SYSTEMS_7124/CLS_WALL_SAWS_7124/r85',
      applicableProjects: ['commercial', 'infrastructure', 'renovation'],
      laborRequirement: 15,
      specifications: ['85mm cutting depth', 'Dust management', 'Electronic speed control'],
      todEligibility: { eligible: true, premiumMultiplier: 1.4, minDuration: 2 },
      servicePriority: 'critical', // Specialized equipment
      repairComplexity: 'high'
    },
    {
      name: 'AG 500-A36 Angle Grinder',
      model: 'AG 500-A36',
      description: 'High-power cordless angle grinder with brushless motor',
      baseMonthlyRate: 75,
      category: 'Cutting',
      productUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_GRINDERS_7124/CLS_ANGLE_GRINDERS_7124/r500a36',
      applicableProjects: ['residential', 'commercial', 'industrial', 'renovation'],
      laborRequirement: 5,
      specifications: ['36V battery system', 'Brushless motor', '125mm disc', 'Electronic brake'],
      todEligibility: { eligible: true, premiumMultiplier: 1.2, minDuration: 1 },
      servicePriority: 'medium',
      repairComplexity: 'low'
    },
    {
      name: 'DSH 700-X Hand-held Gas Saw',
      model: 'DSH 700-X',
      description: 'Powerful gas-powered cut-off saw for outdoor applications',
      baseMonthlyRate: 195,
      category: 'Cutting',
      productUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_DIAMOND_SYSTEMS_7124/CLS_HANDHELD_GAS_SAWS_7124/r700x',
      applicableProjects: ['infrastructure', 'roadwork', 'commercial'],
      laborRequirement: 8,
      specifications: ['70cc engine', '350mm cutting depth', 'X-Torq engine', 'Low vibration'],
      todEligibility: { eligible: true, premiumMultiplier: 1.35, minDuration: 2 },
      servicePriority: 'high',
      repairComplexity: 'high'
    }
  ],
  measuring: [
    {
      name: 'PM 30-MG Multi-Line Laser',
      model: 'PM 30-MG',
      description: 'Advanced multi-line laser with green beam technology',
      baseMonthlyRate: 95,
      category: 'Layout',
      productUrl: 'https://www.hilti.com/c/CLS_MEASURING_SYSTEMS_7125/CLS_LASER_LEVELS_7125/CLS_LINE_LASERS_7125/r30mg',
      applicableProjects: ['residential', 'commercial', 'industrial'],
      laborRequirement: 8,
      specifications: ['Green laser technology', '3 lines', '30m range', 'Self-leveling'],
      todEligibility: { eligible: false, premiumMultiplier: 1.0, minDuration: 6 }, // Precision tools better as long-term
      servicePriority: 'medium',
      repairComplexity: 'medium'
    },
    {
      name: 'PR 30-HVS Rotating Laser',
      model: 'PR 30-HVS', 
      description: 'High-precision rotating laser with remote control',
      baseMonthlyRate: 125,
      category: 'Layout',
      productUrl: 'https://www.hilti.com/c/CLS_MEASURING_SYSTEMS_7125/CLS_LASER_LEVELS_7125/CLS_ROTATING_LASERS_7125/r30hvs',
      applicableProjects: ['commercial', 'industrial', 'infrastructure'],
      laborRequirement: 12,
      specifications: ['600m diameter range', 'Remote control', 'Dual grade capability'],
      todEligibility: { eligible: false, premiumMultiplier: 1.0, minDuration: 6 },
      servicePriority: 'high',
      repairComplexity: 'high'
    }
  ],
  safety: [
    {
      name: 'TE-CD Dust Management System',
      model: 'TE-CD',
      description: 'Advanced dust collection with HEPA filtration',
      baseMonthlyRate: 150,
      category: 'Safety',
      productUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_DUST_MANAGEMENT_7124/CLS_DUST_REMOVAL_SYSTEMS_7124/rtecd',
      applicableProjects: ['commercial', 'industrial', 'renovation', 'infrastructure'],
      laborRequirement: 5,
      specifications: ['HEPA filtration', 'Auto-start function', 'High suction power'],
      todEligibility: { eligible: false, premiumMultiplier: 1.0, minDuration: 12 }, // Safety equipment should be permanent
      servicePriority: 'critical',
      repairComplexity: 'medium'
    }
  ]
};

// Enhanced recommendation engine with ToD logic
export class EnhancedRecommendationEngine {
  
  static generateRecommendationStrategy(projectData: ProjectData): RecommendationStrategy {
    // Step 1: Get archetype-based tool requirements
    const archetypeTools = getArchetypeTools(projectData.projectType as any);
    
    // Step 2: Generate base recommendations
    const baseRecommendations = this.generateBaseRecommendations(projectData, archetypeTools);
    
    // Step 3: Apply ToD analysis
    const todCandidates = this.evaluateToolsOnDemand(baseRecommendations, projectData);
    
    // Step 4: Create hybrid strategies
    const hybridStrategies = this.createHybridStrategies(baseRecommendations, projectData);
    
    // Step 5: Finalize core fleet (tools not suitable for ToD)
    const coreFleetTools = this.finalizeCoreFleet(baseRecommendations, todCandidates);
    
    // Step 6: Perform TCO analysis
    const tcoAnalysis = calculateTCO(projectData, coreFleetTools);
    
    // Step 7: Assess risk profile
    const riskProfile = RiskModelingEngine.assessProjectRisk(projectData, coreFleetTools);
    
    // Step 8: Generate strategic insights
    const strategicInsights = this.generateStrategicInsights(
      projectData, coreFleetTools, todCandidates, tcoAnalysis, riskProfile
    );
    
    return {
      coreFleetTools,
      toolsOnDemandCandidates: todCandidates,
      hybridRecommendations: hybridStrategies,
      tcoAnalysis,
      riskProfile,
      strategicInsights
    };
  }
  
  private static generateBaseRecommendations(
    projectData: ProjectData,
    archetypeTools: any
  ): EnhancedToolRecommendation[] {
    const recommendations: EnhancedToolRecommendation[] = [];
    const allTools = Object.values(ENHANCED_HILTI_TOOLS).flat();
    
    // Filter tools based on project type and requirements
    const relevantTools = allTools.filter(tool => 
      tool.applicableProjects.includes(projectData.projectType) &&
      projectData.laborCount >= tool.laborRequirement
    );
    
    const quantityMultiplier = getArchetypeQuantityMultiplier(
      projectData.projectType as any, 
      projectData.laborCount
    );
    
    relevantTools.forEach(tool => {
      // Skip tools already owned
      if (projectData.existingTools.some(existing => 
        tool.name.toLowerCase().includes(existing.toLowerCase()) ||
        existing.toLowerCase().includes(tool.category.toLowerCase())
      )) {
        return;
      }
      
      const baseQuantity = Math.max(1, Math.floor(projectData.laborCount / tool.laborRequirement));
      const adjustedQuantity = Math.ceil(baseQuantity * quantityMultiplier);
      const rentalDuration = projectData.timeline;
      const monthlyCost = tool.baseMonthlyRate * adjustedQuantity;
      const totalCost = monthlyCost * rentalDuration;
      
      const necessity = getToolNecessity(tool.name, projectData.projectType as any);
      const justification = [
        ...getArchetypeJustification(tool.name, projectData.projectType as any, necessity),
        ...this.generateServiceJustification(tool),
        ...this.generateCompetitiveAdvantages(tool)
      ];
      
      const enhancedTool = enhanceToolWithServiceFeatures({
        name: tool.name,
        model: tool.model,
        description: tool.description,
        quantity: adjustedQuantity,
        monthlyCost,
        totalCost,
        rentalDuration,
        justification,
        category: tool.category,
        productUrl: tool.productUrl,
        specifications: tool.specifications
      }, projectData.projectComplexity);
      
      recommendations.push(enhancedTool);
    });
    
    return recommendations.sort((a, b) => b.totalCost - a.totalCost).slice(0, 12);
  }
  
  private static evaluateToolsOnDemand(
    recommendations: EnhancedToolRecommendation[],
    projectData: ProjectData
  ): ToD_Recommendation[] {
    const todCandidates: ToD_Recommendation[] = [];
    
    recommendations.forEach(tool => {
      if (tool.todEligible) {
        // Analyze different scenarios for ToD usage
        const scenarios = this.analyzeToD_Scenarios(tool, projectData);
        
        scenarios.forEach(scenario => {
          if ((scenario as any).savings > tool.totalCost * 0.15) { // 15% savings threshold
            todCandidates.push(scenario);
          }
        });
      }
    });
    
    return todCandidates;
  }
  
  private static analyzeToD_Scenarios(
    tool: EnhancedToolRecommendation,
    projectData: ProjectData
  ): ToD_Recommendation[] {
    const scenarios: ToD_Recommendation[] = [];
    const baseTool = ENHANCED_HILTI_TOOLS.drilling.find(t => t.name === tool.name) ||
                    ENHANCED_HILTI_TOOLS.cutting.find(t => t.name === tool.name) ||
                    ENHANCED_HILTI_TOOLS.measuring.find(t => t.name === tool.name) ||
                    ENHANCED_HILTI_TOOLS.safety.find(t => t.name === tool.name);
    
    if (!baseTool?.todEligibility.eligible) return scenarios;
    
    // Peak season scenario (30% of project duration)
    const peakMonths = Math.max(1, Math.floor(projectData.timeline * 0.3));
    if (peakMonths >= baseTool.todEligibility.minDuration) {
      const peakScenario = evaluateToolsOnDemand(tool, projectData.timeline, peakMonths, 0);
      if (peakScenario) scenarios.push(peakScenario);
    }
    
    // Specialty work scenario (25% of project duration)  
    const specialtyMonths = Math.max(1, Math.floor(projectData.timeline * 0.25));
    if (specialtyMonths >= baseTool.todEligibility.minDuration) {
      const specialtyScenario = evaluateToolsOnDemand(tool, projectData.timeline, 0, specialtyMonths);
      if (specialtyScenario) scenarios.push(specialtyScenario);
    }
    
    // Backup/contingency scenario (20% of project duration)
    if (tool.riskFactors.criticalPathImpact) {
      const backupMonths = Math.max(1, Math.floor(projectData.timeline * 0.2));
      const backupScenario = evaluateToolsOnDemand(tool, projectData.timeline, 0, 0);
      if (backupScenario) {
        backupScenario.scenario = 'backup_equipment';
        backupScenario.durationMonths = backupMonths;
        backupScenario.justification = 'Critical path protection and emergency backup';
        scenarios.push(backupScenario);
      }
    }
    
    return scenarios;
  }
  
  private static createHybridStrategies(
    recommendations: EnhancedToolRecommendation[],
    projectData: ProjectData
  ): HybridToolStrategy[] {
    const strategies: HybridToolStrategy[] = [];
    
    recommendations.forEach(tool => {
      if (tool.todEligible && projectData.timeline > 12) {
        // Long projects benefit from hybrid approach
        const coreFleetMonths = Math.ceil(projectData.timeline * 0.7); // 70% core fleet
        const todMonths = Math.floor(projectData.timeline * 0.3); // 30% ToD for peak/specialty
        
        const coreFleetCost = tool.monthlyCost * coreFleetMonths;
        const todCost = tool.monthlyCost * 1.25 * todMonths; // 25% ToD premium
        const totalHybridCost = coreFleetCost + todCost;
        const savings = tool.totalCost - totalHybridCost;
        
        if (savings > tool.totalCost * 0.1) { // 10% savings threshold
          strategies.push({
            toolName: tool.name,
            coreFleetDuration: coreFleetMonths,
            todDuration: todMonths,
            totalSavings: savings,
            strategy: 'seasonal_scaling',
            implementation: `Use core Fleet contract for ${coreFleetMonths} months, supplement with ToD for ${todMonths} months during peak demand`
          });
        }
      }
    });
    
    return strategies;
  }
  
  private static finalizeCoreFleet(
    recommendations: EnhancedToolRecommendation[],
    todCandidates: ToD_Recommendation[]
  ): EnhancedToolRecommendation[] {
    const todToolNames = new Set(todCandidates.map(t => t.toolName));
    
    return recommendations.filter(tool => {
      // Keep tools that are not suitable for ToD or have limited ToD benefits
      return !tool.todEligible || 
             !todToolNames.has(tool.name) ||
             tool.serviceFeatures.onSiteMaintenance || // Precision tools need consistent calibration
             tool.riskFactors.criticalPathImpact; // Critical tools should be permanently available
    });
  }
  
  private static generateServiceJustification(tool: any): string[] {
    const justifications: string[] = [];
    
    if (tool.servicePriority === 'critical') {
      justifications.push('Critical equipment with priority service and dedicated support');
    }
    
    if (tool.repairComplexity === 'high') {
      justifications.push('Complex equipment benefits from expert maintenance and authentic parts');
    }
    
    justifications.push('Includes unlimited repairs, theft coverage, and loaner tools');
    
    return justifications;
  }
  
  private static generateCompetitiveAdvantages(tool: any): string[] {
    return [
      'Latest Hilti technology with continuous updates',
      'Professional service network ensures minimal downtime',
      'Comprehensive safety features and certifications'
    ];
  }
  
  private static generateStrategicInsights(
    projectData: ProjectData,
    coreFleet: EnhancedToolRecommendation[],
    todCandidates: ToD_Recommendation[],
    tcoAnalysis: TCOComparison,
    riskProfile: ProjectRiskProfile
  ): StrategicInsight[] {
    const insights: StrategicInsight[] = [];
    
    // Cost optimization insights
    const totalTodSavings = todCandidates.reduce((sum, t) => sum + t.costComparison.savings, 0);
    if (totalTodSavings > 10000) {
      insights.push({
        category: 'cost_optimization',
        insight: `Tools on Demand strategy could save $${totalTodSavings.toLocaleString()} over project duration`,
        impact: 'high',
        actionItem: 'Implement hybrid Fleet + ToD strategy for seasonal/specialty tools'
      });
    }
    
    // Risk mitigation insights
    if (riskProfile.overallRisk === 'high' || riskProfile.overallRisk === 'critical') {
      insights.push({
        category: 'risk_mitigation',
        insight: 'High project risk profile detected - Fleet Management provides critical service guarantees',
        impact: 'high',
        actionItem: 'Prioritize Fleet contract over ownership to transfer operational risks'
      });
    }
    
    // Service value insights
    const criticalTools = coreFleet.filter(t => t.riskFactors.criticalPathImpact).length;
    if (criticalTools > 3) {
      insights.push({
        category: 'service_value',
        insight: `${criticalTools} critical path tools benefit significantly from 24/7 support and guaranteed replacement`,
        impact: 'medium',
        actionItem: 'Ensure service level agreements include priority support for critical equipment'
      });
    }
    
    // Operational efficiency insights
    if (projectData.projectComplexity === 'high') {
      insights.push({
        category: 'operational_efficiency',
        insight: 'High complexity projects require consistent tool availability and expert support',
        impact: 'high',
        actionItem: 'Leverage dedicated account manager and on-site analysis services'
      });
    }
    
    return insights;
  }
  
  // Generate comprehensive recommendations for the UI
  static generateEnhancedRecommendations(projectData: ProjectData): EnhancedToolRecommendation[] {
    const strategy = this.generateRecommendationStrategy(projectData);
    return strategy.coreFleetTools;
  }
  
  // Get strategic recommendations
  static getStrategicRecommendations(projectData: ProjectData): RecommendationStrategy {
    return this.generateRecommendationStrategy(projectData);
  }
}

// Export utility functions
export const formatToolOnDemandSavings = (savings: number): string => {
  return `$${savings.toLocaleString()} saved vs full Fleet contract`;
};

export const formatHybridStrategy = (strategy: HybridToolStrategy): string => {
  return `${strategy.coreFleetDuration}m Fleet + ${strategy.todDuration}m ToD = $${strategy.totalSavings.toLocaleString()} savings`;
};