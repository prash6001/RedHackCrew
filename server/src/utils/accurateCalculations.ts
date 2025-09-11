// Accurate Calculations Engine - Ported from FleetFlow-Hack
import { ProjectData, ToolRecommendation, FleetContract, ProjectMetrics } from '../types/ProjectData.js';

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage for display
export const formatPercentage = (decimal: number): string => {
  return `${Math.round(decimal * 100)}%`;
};

// Calculate comprehensive project metrics
export const calculateProjectMetrics = (
  projectData: ProjectData,
  recommendations: ToolRecommendation[]
): ProjectMetrics => {
  // Calculating accurate project metrics

  // Base productivity improvements based on project type and complexity
  const projectTypeMultipliers = {
    'residential': 0.15,
    'commercial': 0.25,
    'infrastructure': 0.35,
    'industrial': 0.30,
    'renovation': 0.20,
    'roadwork': 0.28
  };

  const complexityMultipliers = {
    'low': 0.8,
    'medium': 1.0,
    'high': 1.3
  };

  const baseProductivity = projectTypeMultipliers[projectData.projectType as keyof typeof projectTypeMultipliers] || 0.25;
  const complexityAdjustment = complexityMultipliers[projectData.projectComplexity];
  const productivityIncrease = Math.min(0.45, baseProductivity * complexityAdjustment); // Cap at 45%

  // Calculate downtime reduction based on fleet management benefits
  const downtimeReduction = Math.min(0.40, 0.25 + (recommendations.length * 0.015)); // More tools = better coverage

  // Calculate financial impact
  const averageHourlyLabor = 75; // Average construction labor cost per hour
  const hoursPerMonth = 160; // Standard work hours per month
  const totalProjectHours = projectData.laborCount * hoursPerMonth * projectData.timeline;

  // Labor savings from productivity increase
  const laborSavings = Math.round(
    totalProjectHours * averageHourlyLabor * productivityIncrease
  );

  // Downtime savings (prevented lost time)
  const baseDowntimeHours = totalProjectHours * 0.08; // 8% typical downtime
  const preventedDowntimeHours = baseDowntimeHours * downtimeReduction;
  const downtimeSavings = Math.round(preventedDowntimeHours * averageHourlyLabor);

  // Total ROI calculation
  const totalROI = laborSavings + downtimeSavings;

  const metrics: ProjectMetrics = {
    productivityIncrease,
    downtimeReduction,
    laborSavings,
    downtimeSavings,
    totalROI
  };

  // Calculated project metrics
  return metrics;
};

// Generate accurate fleet contract with enhanced calculations
export const generateAccurateFleetContract = (
  projectData: ProjectData,
  recommendations: ToolRecommendation[]
): FleetContract => {
  // Generating accurate Fleet Management contract

  const totalEquipmentCost = recommendations.reduce((sum, tool) => sum + tool.totalCost, 0);
  const monthlyCost = recommendations.reduce((sum, tool) => sum + tool.monthlyCost, 0);

  // Enhanced TCO calculation based on industry research
  // Fleet Management eliminates hidden costs:
  // - Maintenance & Repairs: 15-25% of purchase price annually
  // - Administrative overhead: $2,400/year per tool category
  // - Storage & insurance: 8-12% of asset value annually
  // - Technology obsolescence: 20-30% value loss over 4 years
  // - Theft risk: 5-15% annual exposure
  // - Training & certification: $1,500/worker for specialized equipment

  const purchaseMultiplier = 4.2; // Conservative industry-validated multiplier
  const estimatedPurchasePrice = totalEquipmentCost * purchaseMultiplier;
  const estimatedSavings = estimatedPurchasePrice - totalEquipmentCost;

  // Enhanced benefits based on comprehensive Fleet Management research
  const benefits = [
    'All preventive maintenance and emergency repairs included at no extra cost',
    '24/7 technical support with guaranteed response times and replacement within 24 hours',
    'Continuous access to latest tool technology and software updates throughout contract',
    'Comprehensive theft and loss coverage (80% replacement value) with immediate replacement',
    'Professional loaner tool program during repairs to eliminate productivity downtime',
    'Complimentary operator training, safety certifications, and productivity workshops',
    'Proactive maintenance scheduling with performance monitoring and optimization',
    'Dedicated account management with quarterly business reviews and planning',
    'Advanced analytics and reporting on tool utilization, productivity, and cost optimization',
    'Full environmental compliance management and sustainability reporting'
  ];

  // Detailed contract terms with Fleet Management specifications
  const terms = [
    `Fleet contract duration: ${projectData.timeline} months, optimized for ${projectData.projectType} project requirements`,
    'Monthly payment structure with zero upfront capital investment or security deposits',
    'Comprehensive service package including all maintenance, repairs, and calibration services',
    'Guaranteed equipment replacement within 24 hours for critical tools, 48 hours for standard tools',
    'Flexible contract modifications allowed for scope changes and project evolution',
    'Tools on Demand program available for seasonal requirements (25% premium pricing)',
    'Complete safety training and OSHA compliance certification programs at no additional cost',
    'End-of-contract tool removal with option to purchase at depreciated value with rental credits'
  ];

  // Advanced contract analytics
  const tcoComparison = {
    savings: estimatedSavings,
    recommendation: 'fleet',
    keyFactors: [
      `Eliminates $${formatCurrency(estimatedPurchasePrice * 0.4)} in upfront capital investment`,
      `Prevents $${formatCurrency(estimatedPurchasePrice * 0.25)} in annual maintenance costs`,
      `Covers $${formatCurrency(estimatedPurchasePrice * 0.12)} in theft and loss exposure`,
      `Saves $${formatCurrency(projectData.laborCount * 1500)} in specialized training costs`
    ]
  };

  const contract: FleetContract = {
    totalCost: totalEquipmentCost,
    monthlyCost,
    duration: projectData.timeline,
    estimatedSavings,
    benefits,
    terms,
    tcoComparison
  };

  // Accurate fleet contract generated
  
  return contract;
};

// Calculate tool ROI for individual recommendations
export const calculateToolROI = (
  tool: ToolRecommendation,
  projectData: ProjectData
): number => {
  // Estimate productivity gains for this specific tool
  const categoryProductivityGains = {
    'Drilling': 0.30,
    'Demolition': 0.35,
    'Cutting': 0.25,
    'Layout': 0.40,
    'Fastening': 0.20,
    'Safety': 0.15,
    'Measuring': 0.35
  };

  const productivityGain = categoryProductivityGains[tool.category as keyof typeof categoryProductivityGains] || 0.20;
  const laborCostPerMonth = projectData.laborCount * 160 * 75; // labor count * hours * hourly rate
  const monthlyProductivitySavings = laborCostPerMonth * productivityGain * (tool.quantity / projectData.laborCount);
  const totalProductivitySavings = monthlyProductivitySavings * tool.rentalDuration;

  // ROI = (Gains - Investment) / Investment
  const roi = (totalProductivitySavings - tool.totalCost) / tool.totalCost;
  
  return Math.max(0, roi); // Don't show negative ROI
};

// Advanced Fleet Management pricing model
export const calculateFleetPricing = (
  basePrice: number,
  projectData: ProjectData,
  toolCategory: string
): { monthlyCost: number; totalCost: number; discount: number } => {
  let monthlyCost = basePrice;

  // Volume discounts based on project size
  if (projectData.laborCount > 50) {
    monthlyCost *= 0.85; // 15% discount for large projects
  } else if (projectData.laborCount > 25) {
    monthlyCost *= 0.90; // 10% discount for medium projects
  } else if (projectData.laborCount > 10) {
    monthlyCost *= 0.95; // 5% discount for small-medium projects
  }

  // Contract length discounts
  if (projectData.timeline > 36) {
    monthlyCost *= 0.88; // 12% additional discount for long-term contracts
  } else if (projectData.timeline > 24) {
    monthlyCost *= 0.92; // 8% additional discount for medium-term contracts
  } else if (projectData.timeline > 12) {
    monthlyCost *= 0.96; // 4% additional discount for short-medium term
  }

  // Project complexity adjustments
  if (projectData.projectComplexity === 'high') {
    monthlyCost *= 1.1; // 10% premium for high-complexity projects (more support needed)
  } else if (projectData.projectComplexity === 'low') {
    monthlyCost *= 0.95; // 5% discount for low-complexity projects
  }

  const totalCost = monthlyCost * projectData.timeline;
  const discount = (basePrice - monthlyCost) / basePrice;

  return {
    monthlyCost: Math.round(monthlyCost),
    totalCost: Math.round(totalCost),
    discount
  };
};