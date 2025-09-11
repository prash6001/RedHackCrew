import { ProjectData, EnhancedToolRecommendation } from '../types/ProjectData';

// Risk modeling based on Section 4.2 analysis
export interface ProjectRiskProfile {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  contingencyRecommendations: ContingencyPlan[];
  financialImpact: FinancialRiskImpact;
}

export interface RiskFactor {
  category: 'equipment' | 'service' | 'timeline' | 'financial' | 'operational';
  description: string;
  probability: number; // 0-1
  impact: 'low' | 'medium' | 'high' | 'critical';
  costImpact: number; // Dollar amount
  timeImpact: number; // Days
}

export interface MitigationStrategy {
  riskCategory: string;
  strategy: string;
  cost: number;
  effectiveness: number; // 0-1 (probability reduction)
  implementationTime: number; // Days
}

export interface ContingencyPlan {
  scenario: string;
  probability: number;
  response: string;
  additionalCost: number;
  additionalTime: number;
}

export interface FinancialRiskImpact {
  expectedCost: number;
  worstCaseCost: number;
  contingencyBudget: number;
  insuranceValue: number;
}

// Monte Carlo simulation parameters for service gap analysis
export interface MonteCarloConfig {
  iterations: number;
  confidenceLevel: number; // 0.95 for 95% confidence
  timeHorizonDays: number;
}

export interface SimulationResult {
  scenarios: ScenarioOutcome[];
  statistics: {
    mean: number;
    median: number;
    standardDeviation: number;
    percentiles: { [key: string]: number };
    confidenceInterval: { lower: number; upper: number };
  };
  recommendations: string[];
}

export interface ScenarioOutcome {
  scenarioId: number;
  totalDowntime: number; // Days
  totalCost: number;
  criticalPathImpact: boolean;
  serviceFailures: ServiceFailure[];
}

export interface ServiceFailure {
  toolName: string;
  failureType: 'normal_service' | 'minor_delay' | 'critical_failure';
  downtimeDays: number;
  cost: number;
}

// Service gap probabilities from Section 1.2
const SERVICE_PERFORMANCE = {
  normal: { probability: 0.70, durationMultiplier: 1.0, description: 'Service within SLA' },
  delayed: { probability: 0.20, durationMultiplier: 2.5, description: 'Minor delays (6-14 days)' },
  critical: { probability: 0.10, durationMultiplier: 8.0, description: 'Major service failures (>14 days)' }
};

// Risk assessment engine
export class RiskModelingEngine {
  
  static assessProjectRisk(
    projectData: ProjectData,
    recommendations: EnhancedToolRecommendation[]
  ): ProjectRiskProfile {
    const riskFactors = this.identifyRiskFactors(projectData, recommendations);
    const mitigationStrategies = this.generateMitigationStrategies(riskFactors);
    const contingencyPlans = this.createContingencyPlans(projectData, riskFactors);
    const financialImpact = this.calculateFinancialImpact(riskFactors, projectData);
    
    // Calculate overall risk level
    const overallRisk = this.calculateOverallRisk(riskFactors);
    
    return {
      overallRisk,
      riskFactors,
      mitigationStrategies,
      contingencyRecommendations: contingencyPlans,
      financialImpact
    };
  }
  
  private static identifyRiskFactors(
    projectData: ProjectData,
    recommendations: EnhancedToolRecommendation[]
  ): RiskFactor[] {
    const factors: RiskFactor[] = [];
    
    // Equipment reliability risks
    recommendations.forEach(tool => {
      const probability = tool.riskFactors.repairDowntimeProbability;
      const timeImpact = tool.riskFactors.expectedRepairDays;
      const costImpact = tool.monthlyCost * Math.ceil(timeImpact / 30);
      
      if (probability > 0.15) { // High-risk tools
        factors.push({
          category: 'equipment',
          description: `${tool.name} has elevated failure risk (${Math.round(probability * 100)}% probability)`,
          probability,
          impact: tool.riskFactors.criticalPathImpact ? 'high' : 'medium',
          costImpact,
          timeImpact
        });
      }
    });
    
    // Service gap risks based on documented issues
    factors.push({
      category: 'service',
      description: 'Service gap analysis indicates 30% probability of delays beyond promised SLA',
      probability: SERVICE_PERFORMANCE.delayed.probability + SERVICE_PERFORMANCE.critical.probability,
      impact: 'medium',
      costImpact: this.calculateServiceGapCost(projectData, recommendations),
      timeImpact: 7 // Average delay
    });
    
    // Project complexity risks
    if (projectData.projectComplexity === 'high') {
      factors.push({
        category: 'operational',
        description: 'High project complexity increases coordination and equipment demands',
        probability: 0.35,
        impact: 'high',
        costImpact: projectData.budget * 0.05,
        timeImpact: projectData.timeline * 30 * 0.1 // 10% timeline impact
      });
    }
    
    // Timeline pressure risks
    if (projectData.timeline < 6) {
      factors.push({
        category: 'timeline',
        description: 'Compressed timeline increases equipment availability pressure',
        probability: 0.40,
        impact: 'medium',
        costImpact: projectData.budget * 0.03,
        timeImpact: 14
      });
    }
    
    // Financial risks for large capital exposure
    const totalAssetValue = recommendations.reduce((sum, tool) => 
      sum + (tool.monthlyCost * 48 / 1.4), 0); // Reverse engineer asset value
    
    if (totalAssetValue > projectData.budget * 0.2) {
      factors.push({
        category: 'financial',
        description: 'High equipment value creates significant financial exposure',
        probability: 0.15,
        impact: 'critical',
        costImpact: totalAssetValue * 0.1,
        timeImpact: 21
      });
    }
    
    return factors;
  }
  
  private static generateMitigationStrategies(riskFactors: RiskFactor[]): MitigationStrategy[] {
    const strategies: MitigationStrategy[] = [];
    
    riskFactors.forEach(factor => {
      switch (factor.category) {
        case 'equipment':
          strategies.push({
            riskCategory: 'equipment',
            strategy: 'Implement redundant backup equipment for critical tools',
            cost: factor.costImpact * 0.3,
            effectiveness: 0.7,
            implementationTime: 2
          });
          break;
          
        case 'service':
          strategies.push({
            riskCategory: 'service',
            strategy: 'Establish direct communication channel with service center',
            cost: 2000,
            effectiveness: 0.4,
            implementationTime: 1
          });
          strategies.push({
            riskCategory: 'service',
            strategy: 'Pre-order loaner tools for critical equipment',
            cost: factor.costImpact * 0.2,
            effectiveness: 0.6,
            implementationTime: 3
          });
          break;
          
        case 'timeline':
          strategies.push({
            riskCategory: 'timeline',
            strategy: 'Build 15% timeline buffer into project schedule',
            cost: 0,
            effectiveness: 0.5,
            implementationTime: 0
          });
          break;
          
        case 'financial':
          strategies.push({
            riskCategory: 'financial',
            strategy: 'Fleet Management contract reduces capital exposure',
            cost: 0,
            effectiveness: 0.9,
            implementationTime: 0
          });
          break;
      }
    });
    
    return strategies;
  }
  
  private static createContingencyPlans(
    projectData: ProjectData,
    riskFactors: RiskFactor[]
  ): ContingencyPlan[] {
    const plans: ContingencyPlan[] = [];
    
    // Service failure contingency
    plans.push({
      scenario: 'Critical service failure (>14 days repair time)',
      probability: SERVICE_PERFORMANCE.critical.probability,
      response: 'Activate emergency tool rental and expedite replacement',
      additionalCost: 15000,
      additionalTime: 3
    });
    
    // Equipment shortage contingency
    plans.push({
      scenario: 'Multiple tools unavailable simultaneously',
      probability: 0.05,
      response: 'Source alternative equipment from secondary suppliers',
      additionalCost: 8000,
      additionalTime: 5
    });
    
    // Project complexity overrun
    if (projectData.projectComplexity === 'high') {
      plans.push({
        scenario: 'Scope creep requiring additional specialized equipment',
        probability: 0.25,
        response: 'Leverage Tools on Demand for temporary equipment needs',
        additionalCost: projectData.budget * 0.08,
        additionalTime: 7
      });
    }
    
    return plans;
  }
  
  private static calculateFinancialImpact(
    riskFactors: RiskFactor[],
    projectData: ProjectData
  ): FinancialRiskImpact {
    const expectedCost = riskFactors.reduce((sum, factor) => 
      sum + (factor.costImpact * factor.probability), 0);
    
    const worstCaseCost = riskFactors.reduce((sum, factor) => 
      sum + factor.costImpact, 0);
    
    const contingencyBudget = Math.max(expectedCost * 1.5, projectData.budget * 0.05);
    
    const insuranceValue = worstCaseCost * 0.8; // Fleet Management covers 80% of losses
    
    return {
      expectedCost,
      worstCaseCost,
      contingencyBudget,
      insuranceValue
    };
  }
  
  private static calculateOverallRisk(riskFactors: RiskFactor[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalFactors = riskFactors.filter(f => f.impact === 'critical').length;
    const highFactors = riskFactors.filter(f => f.impact === 'high').length;
    const totalRiskScore = riskFactors.reduce((sum, factor) => {
      const impactScore = { low: 1, medium: 2, high: 3, critical: 4 }[factor.impact];
      return sum + (factor.probability * impactScore);
    }, 0);
    
    if (criticalFactors > 0 || totalRiskScore > 3.0) return 'critical';
    if (highFactors > 1 || totalRiskScore > 2.0) return 'high';
    if (totalRiskScore > 1.0) return 'medium';
    return 'low';
  }
  
  private static calculateServiceGapCost(
    projectData: ProjectData,
    recommendations: EnhancedToolRecommendation[]
  ): number {
    return recommendations.reduce((sum, tool) => {
      const delayCost = tool.monthlyCost * 0.5; // Half month cost for average delay
      return sum + (delayCost * 0.3); // 30% probability of service gap
    }, 0);
  }
  
  // Monte Carlo simulation for comprehensive risk analysis
  static runMonteCarloSimulation(
    projectData: ProjectData,
    recommendations: EnhancedToolRecommendation[],
    config: MonteCarloConfig = { iterations: 1000, confidenceLevel: 0.95, timeHorizonDays: projectData.timeline * 30 }
  ): SimulationResult {
    const scenarios: ScenarioOutcome[] = [];
    
    for (let i = 0; i < config.iterations; i++) {
      const scenario = this.simulateSingleScenario(i, projectData, recommendations, config.timeHorizonDays);
      scenarios.push(scenario);
    }
    
    const statistics = this.calculateStatistics(scenarios, config.confidenceLevel);
    const recommendations_list = this.generateMonteCarloRecommendations(scenarios, statistics);
    
    return {
      scenarios,
      statistics,
      recommendations: recommendations_list
    };
  }
  
  private static simulateSingleScenario(
    scenarioId: number,
    projectData: ProjectData,
    recommendations: EnhancedToolRecommendation[],
    timeHorizonDays: number
  ): ScenarioOutcome {
    let totalDowntime = 0;
    let totalCost = 0;
    let criticalPathImpact = false;
    const serviceFailures: ServiceFailure[] = [];
    
    recommendations.forEach(tool => {
      // Simulate potential service events
      const repairProbability = tool.riskFactors.repairDowntimeProbability;
      
      if (Math.random() < repairProbability) {
        // Determine service outcome
        const rand = Math.random();
        let failureType: 'normal_service' | 'minor_delay' | 'critical_failure';
        let durationMultiplier: number;
        
        if (rand < SERVICE_PERFORMANCE.normal.probability) {
          failureType = 'normal_service';
          durationMultiplier = SERVICE_PERFORMANCE.normal.durationMultiplier;
        } else if (rand < SERVICE_PERFORMANCE.normal.probability + SERVICE_PERFORMANCE.delayed.probability) {
          failureType = 'minor_delay';
          durationMultiplier = SERVICE_PERFORMANCE.delayed.durationMultiplier;
        } else {
          failureType = 'critical_failure';
          durationMultiplier = SERVICE_PERFORMANCE.critical.durationMultiplier;
        }
        
        const downtimeDays = tool.riskFactors.expectedRepairDays * durationMultiplier;
        const cost = tool.monthlyCost * Math.ceil(downtimeDays / 30);
        
        totalDowntime += downtimeDays;
        totalCost += cost;
        
        if (tool.riskFactors.criticalPathImpact) {
          criticalPathImpact = true;
        }
        
        serviceFailures.push({
          toolName: tool.name,
          failureType,
          downtimeDays,
          cost
        });
      }
    });
    
    return {
      scenarioId,
      totalDowntime,
      totalCost,
      criticalPathImpact,
      serviceFailures
    };
  }
  
  private static calculateStatistics(
    scenarios: ScenarioOutcome[],
    confidenceLevel: number
  ): SimulationResult['statistics'] {
    const costs = scenarios.map(s => s.totalCost).sort((a, b) => a - b);
    const downtimes = scenarios.map(s => s.totalDowntime).sort((a, b) => a - b);
    
    const mean = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
    const median = costs[Math.floor(costs.length / 2)];
    
    const variance = costs.reduce((sum, cost) => sum + Math.pow(cost - mean, 2), 0) / costs.length;
    const standardDeviation = Math.sqrt(variance);
    
    const percentiles = {
      '5th': costs[Math.floor(costs.length * 0.05)],
      '25th': costs[Math.floor(costs.length * 0.25)],
      '50th': median,
      '75th': costs[Math.floor(costs.length * 0.75)],
      '95th': costs[Math.floor(costs.length * 0.95)]
    };
    
    const alpha = 1 - confidenceLevel;
    const lowerIndex = Math.floor(costs.length * alpha / 2);
    const upperIndex = Math.floor(costs.length * (1 - alpha / 2));
    
    return {
      mean,
      median,
      standardDeviation,
      percentiles,
      confidenceInterval: {
        lower: costs[lowerIndex],
        upper: costs[upperIndex]
      }
    };
  }
  
  private static generateMonteCarloRecommendations(
    scenarios: ScenarioOutcome[],
    statistics: SimulationResult['statistics']
  ): string[] {
    const recommendations: string[] = [];
    
    const criticalPathImpactRate = scenarios.filter(s => s.criticalPathImpact).length / scenarios.length;
    const averageDowntime = scenarios.reduce((sum, s) => sum + s.totalDowntime, 0) / scenarios.length;
    
    if (criticalPathImpactRate > 0.15) {
      recommendations.push(`High critical path risk (${Math.round(criticalPathImpactRate * 100)}%) - consider redundant equipment`);
    }
    
    if (averageDowntime > 10) {
      recommendations.push(`Expected ${Math.round(averageDowntime)} days of equipment downtime - build schedule buffer`);
    }
    
    if (statistics.percentiles['95th'] > statistics.mean * 3) {
      recommendations.push(`High cost variability - establish contingency fund of $${Math.round(statistics.percentiles['95th'])}`);
    }
    
    recommendations.push(`95% confidence: costs will not exceed $${Math.round(statistics.percentiles['95th'])}`);
    recommendations.push(`Recommended contingency: $${Math.round(statistics.mean + statistics.standardDeviation)}`);
    
    return recommendations;
  }
}

// Export utility functions
export const formatRiskLevel = (risk: string): string => {
  const levelMap: { [key: string]: string } = {
    'low': '🟢 Low Risk',
    'medium': '🟡 Medium Risk', 
    'high': '🟠 High Risk',
    'critical': '🔴 Critical Risk'
  };
  return levelMap[risk] || risk;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};