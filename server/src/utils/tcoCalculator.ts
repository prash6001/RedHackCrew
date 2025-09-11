import { ProjectData, ToolRecommendation } from '../types/ProjectData';

// TCO Calculator based on Section 2.2 analysis from Hilti Fleet Management document
export interface TCOComparison {
  ownership: OwnershipCosts;
  fleetManagement: FleetManagementCosts;
  savings: number;
  savingsPercentage: number;
  recommendation: 'ownership' | 'fleet';
  keyFactors: string[];
}

export interface OwnershipCosts {
  upfrontCapital: number;
  monthlyCost: number;
  maintenanceRepair: number;
  theftLossRisk: number;
  administrativeOverhead: number;
  totalFourYearCost: number;
  annualizedCost: number;
}

export interface FleetManagementCosts {
  upfrontCapital: number;
  monthlyCost: number;
  totalFourYearCost: number;
  annualizedCost: number;
  includedServices: string[];
}

// Industry benchmarks based on research data
const INDUSTRY_BENCHMARKS = {
  // Maintenance & repair as percentage of asset value per year
  MAINTENANCE_RATE: 0.075, // 7.5% per year
  
  // Administrative overhead (manager time)
  ADMIN_HOURS_PER_MONTH: 2,
  MANAGER_HOURLY_RATE: 50,
  
  // Theft probability over 4 years by tool category
  THEFT_PROBABILITY: {
    'cutting': 0.25, // Higher theft rate for portable saws
    'drilling': 0.15,
    'fastening': 0.10,
    'measuring': 0.20, // Laser equipment is attractive to thieves
    'safety': 0.05,
    'default': 0.15
  },
  
  // Fleet markup to cover services, risk, and profit
  FLEET_MARKUP: 1.40, // 40% markup over amortized cost
  
  // Contract duration
  CONTRACT_DURATION_MONTHS: 48
};

export const calculateTCO = (
  projectData: ProjectData,
  recommendations: ToolRecommendation[],
  managerHourlyRate: number = INDUSTRY_BENCHMARKS.MANAGER_HOURLY_RATE
): TCOComparison => {
  // Calculate total asset value from recommendations
  const totalAssetValue = recommendations.reduce((sum, tool) => {
    // Reverse-engineer purchase price from monthly cost
    const purchasePrice = (tool.monthlyCost / INDUSTRY_BENCHMARKS.FLEET_MARKUP) * INDUSTRY_BENCHMARKS.CONTRACT_DURATION_MONTHS;
    return sum + (purchasePrice * tool.quantity);
  }, 0);

  // OWNERSHIP MODEL CALCULATION
  const ownership: OwnershipCosts = {
    upfrontCapital: totalAssetValue,
    monthlyCost: 0, // After initial purchase
    maintenanceRepair: totalAssetValue * INDUSTRY_BENCHMARKS.MAINTENANCE_RATE * 4, // 4 years
    theftLossRisk: calculateTheftRisk(recommendations, totalAssetValue),
    administrativeOverhead: INDUSTRY_BENCHMARKS.ADMIN_HOURS_PER_MONTH * managerHourlyRate * INDUSTRY_BENCHMARKS.CONTRACT_DURATION_MONTHS,
    totalFourYearCost: 0,
    annualizedCost: 0
  };

  ownership.totalFourYearCost = ownership.upfrontCapital + ownership.maintenanceRepair + 
                                ownership.theftLossRisk + ownership.administrativeOverhead;
  ownership.annualizedCost = ownership.totalFourYearCost / 4;

  // FLEET MANAGEMENT MODEL CALCULATION
  const totalMonthlyCost = recommendations.reduce((sum, tool) => sum + tool.monthlyCost, 0);
  const fleetManagement: FleetManagementCosts = {
    upfrontCapital: 0,
    monthlyCost: totalMonthlyCost,
    totalFourYearCost: totalMonthlyCost * INDUSTRY_BENCHMARKS.CONTRACT_DURATION_MONTHS,
    annualizedCost: totalMonthlyCost * 12,
    includedServices: [
      'All maintenance and repairs',
      'Theft coverage (80% replacement cost)',
      'Loaner tools during repairs',
      '24/7 technical support',
      'Tool upgrades at contract end',
      'Administrative overhead elimination',
      'Safety training and certifications',
      'Performance analytics and reporting'
    ]
  };

  // CALCULATE SAVINGS AND RECOMMENDATION
  const savings = ownership.totalFourYearCost - fleetManagement.totalFourYearCost;
  const savingsPercentage = (savings / ownership.totalFourYearCost) * 100;
  
  const recommendation = savings > 0 ? 'fleet' : 'ownership';
  
  const keyFactors = generateKeyFactors(projectData, ownership, fleetManagement, savings);

  return {
    ownership,
    fleetManagement,
    savings,
    savingsPercentage,
    recommendation,
    keyFactors
  };
};

const calculateTheftRisk = (recommendations: ToolRecommendation[], totalAssetValue: number): number => {
  let weightedTheftRisk = 0;
  let totalWeight = 0;

  recommendations.forEach(tool => {
    const toolValue = (tool.monthlyCost / INDUSTRY_BENCHMARKS.FLEET_MARKUP) * 
                     INDUSTRY_BENCHMARKS.CONTRACT_DURATION_MONTHS * tool.quantity;
    const categoryProbability = (INDUSTRY_BENCHMARKS.THEFT_PROBABILITY as any)[tool.category.toLowerCase()] || 
                                INDUSTRY_BENCHMARKS.THEFT_PROBABILITY.default;
    
    weightedTheftRisk += toolValue * categoryProbability;
    totalWeight += toolValue;
  });

  return totalWeight > 0 ? weightedTheftRisk : totalAssetValue * INDUSTRY_BENCHMARKS.THEFT_PROBABILITY.default;
};

const generateKeyFactors = (
  projectData: ProjectData,
  ownership: OwnershipCosts,
  fleet: FleetManagementCosts,
  savings: number
): string[] => {
  const factors: string[] = [];

  // Capital preservation factor
  if (ownership.upfrontCapital > 100000) {
    factors.push(`Preserves ${formatCurrency(ownership.upfrontCapital)} in working capital for other business needs`);
  }

  // Risk mitigation factor
  if (ownership.theftLossRisk > 10000) {
    factors.push(`Eliminates ${formatCurrency(ownership.theftLossRisk)} in theft/loss risk exposure`);
  }

  // Administrative efficiency factor
  if (ownership.administrativeOverhead > 5000) {
    factors.push(`Saves ${Math.round(ownership.administrativeOverhead / (INDUSTRY_BENCHMARKS.MANAGER_HOURLY_RATE * 12))} hours of management time annually`);
  }

  // Project complexity factor
  if (projectData.projectComplexity === 'high') {
    factors.push('High-complexity projects benefit most from guaranteed equipment availability and expert support');
  }

  // Timeline factor
  if (projectData.timeline > 24) {
    factors.push('Long-term projects maximize Fleet Management value through continuous technology updates');
  }

  // Team size factor
  if (projectData.laborCount > 20) {
    factors.push('Large teams require reliable equipment uptime that Fleet Management guarantees');
  }

  // Financial impact
  if (savings > 0) {
    factors.push(`Total 4-year savings of ${formatCurrency(savings)} (${Math.round((savings / ownership.totalFourYearCost) * 100)}%)`);
  } else {
    factors.push(`Fleet Management premium of ${formatCurrency(Math.abs(savings))} provides risk mitigation and service value`);
  }

  return factors.slice(0, 6); // Return top 6 factors
};

// Enhanced cost breakdown for detailed analysis
export interface DetailedCostBreakdown {
  ownership: {
    capitalCost: number;
    yearOneTotal: number;
    yearTwoTotal: number;
    yearThreeTotal: number;
    yearFourTotal: number;
    cumulativeCosts: number[];
    cashFlowImpact: number[];
  };
  fleet: {
    yearOneTotal: number;
    yearTwoTotal: number;
    yearThreeTotal: number;
    yearFourTotal: number;
    cumulativeCosts: number[];
    cashFlowImpact: number[];
  };
}

export const generateDetailedBreakdown = (
  tcoComparison: TCOComparison,
  projectTimeline: number = 48
): DetailedCostBreakdown => {
  const { ownership, fleetManagement } = tcoComparison;
  
  // Ownership cash flow (front-loaded)
  const ownershipYearlyCosts = [
    ownership.upfrontCapital + (ownership.maintenanceRepair + ownership.administrativeOverhead + ownership.theftLossRisk) / 4,
    (ownership.maintenanceRepair + ownership.administrativeOverhead + ownership.theftLossRisk) / 4,
    (ownership.maintenanceRepair + ownership.administrativeOverhead + ownership.theftLossRisk) / 4,
    (ownership.maintenanceRepair + ownership.administrativeOverhead + ownership.theftLossRisk) / 4
  ];

  // Fleet cash flow (evenly distributed)
  const fleetYearlyCost = fleetManagement.monthlyCost * 12;
  const fleetYearlyCosts = [fleetYearlyCost, fleetYearlyCost, fleetYearlyCost, fleetYearlyCost];

  // Cumulative costs
  const ownershipCumulative = ownershipYearlyCosts.reduce((acc, cost, index) => {
    acc.push((acc[index - 1] || 0) + cost);
    return acc;
  }, [] as number[]);

  const fleetCumulative = fleetYearlyCosts.reduce((acc, cost, index) => {
    acc.push((acc[index - 1] || 0) + cost);
    return acc;
  }, [] as number[]);

  // Cash flow impact (negative numbers represent cash outflow)
  const ownershipCashFlow = ownershipYearlyCosts.map(cost => -cost);
  const fleetCashFlow = fleetYearlyCosts.map(cost => -cost);

  return {
    ownership: {
      capitalCost: ownership.upfrontCapital,
      yearOneTotal: ownershipYearlyCosts[0],
      yearTwoTotal: ownershipYearlyCosts[1],
      yearThreeTotal: ownershipYearlyCosts[2],
      yearFourTotal: ownershipYearlyCosts[3],
      cumulativeCosts: ownershipCumulative,
      cashFlowImpact: ownershipCashFlow
    },
    fleet: {
      yearOneTotal: fleetYearlyCosts[0],
      yearTwoTotal: fleetYearlyCosts[1],
      yearThreeTotal: fleetYearlyCosts[2],
      yearFourTotal: fleetYearlyCosts[3],
      cumulativeCosts: fleetCumulative,
      cashFlowImpact: fleetCashFlow
    }
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

// Risk assessment for decision making
export interface RiskAssessment {
  capitalRisk: 'low' | 'medium' | 'high';
  operationalRisk: 'low' | 'medium' | 'high';
  maintenanceRisk: 'low' | 'medium' | 'high';
  cashFlowRisk: 'low' | 'medium' | 'high';
  overallRecommendation: string;
  riskFactors: string[];
}

export const assessProjectRisk = (
  projectData: ProjectData,
  tcoComparison: TCOComparison
): RiskAssessment => {
  const risks: string[] = [];
  
  // Capital risk assessment
  let capitalRisk: 'low' | 'medium' | 'high' = 'low';
  if (tcoComparison.ownership.upfrontCapital > projectData.budget * 0.2) {
    capitalRisk = 'high';
    risks.push('High upfront capital requirement may strain cash flow');
  } else if (tcoComparison.ownership.upfrontCapital > projectData.budget * 0.1) {
    capitalRisk = 'medium';
    risks.push('Moderate capital investment required');
  }

  // Operational risk assessment
  let operationalRisk: 'low' | 'medium' | 'high' = 'low';
  if (projectData.projectComplexity === 'high' || projectData.timeline > 24) {
    operationalRisk = 'high';
    risks.push('Complex projects require guaranteed equipment availability');
  } else if (projectData.laborCount > 15) {
    operationalRisk = 'medium';
    risks.push('Large teams need reliable equipment to maintain productivity');
  }

  // Maintenance risk
  let maintenanceRisk: 'low' | 'medium' | 'high' = 'low';
  if (tcoComparison.ownership.maintenanceRepair > 50000) {
    maintenanceRisk = 'high';
    risks.push('High expected maintenance costs create budget uncertainty');
  } else if (tcoComparison.ownership.maintenanceRepair > 20000) {
    maintenanceRisk = 'medium';
    risks.push('Moderate maintenance costs require management attention');
  }

  // Cash flow risk
  let cashFlowRisk: 'low' | 'medium' | 'high' = 'low';
  if (tcoComparison.ownership.upfrontCapital > projectData.budget * 0.15) {
    cashFlowRisk = 'high';
    risks.push('Large upfront investment impacts working capital availability');
  }

  const riskLevels = [capitalRisk, operationalRisk, maintenanceRisk, cashFlowRisk];
  const highRiskCount = riskLevels.filter(r => r === 'high').length;
  
  let overallRecommendation = '';
  if (highRiskCount >= 2) {
    overallRecommendation = 'Fleet Management strongly recommended to mitigate multiple high-risk factors';
  } else if (highRiskCount === 1) {
    overallRecommendation = 'Fleet Management recommended to reduce identified risks';
  } else if (tcoComparison.savings > 0) {
    overallRecommendation = 'Fleet Management provides both cost savings and risk mitigation';
  } else {
    overallRecommendation = 'Consider ownership if cost is primary concern and risks are manageable';
  }

  return {
    capitalRisk,
    operationalRisk,
    maintenanceRisk,
    cashFlowRisk,
    overallRecommendation,
    riskFactors: risks
  };
};