import { EnhancedToolRecommendation, ServiceEvent } from '../types/ProjectData';

// Service workflow modeling based on Section 1.3 of the document
export interface ServiceWorkflow {
  step: number;
  status: string;
  description: string;
  estimatedDuration: string;
  customerAction?: string;
}

// 6-step repair tracking system from Hilti Online portal
export const REPAIR_WORKFLOW_STEPS: ServiceWorkflow[] = [
  {
    step: 1,
    status: 'order_received',
    description: 'Order received',
    estimatedDuration: '1-2 hours',
    customerAction: 'Wait for pickup confirmation'
  },
  {
    step: 2,
    status: 'tool_pickup',
    description: 'Tool is picked up',
    estimatedDuration: '1-2 business days',
    customerAction: 'Package tool with provided shipping label'
  },
  {
    step: 3,
    status: 'arrived_service_center',
    description: 'Arrived in the Tool Service Center',
    estimatedDuration: '1 business day',
    customerAction: 'None - Hilti processing'
  },
  {
    step: 4,
    status: 'tool_in_service',
    description: 'Tool in service',
    estimatedDuration: '1-3 business days',
    customerAction: 'Loaner tool available if requested'
  },
  {
    step: 5,
    status: 'service_completed_shipping',
    description: 'Tool service completed and shipping',
    estimatedDuration: '1-2 business days',
    customerAction: 'Track return shipment'
  },
  {
    step: 6,
    status: 'tool_returned',
    description: 'Tool returned',
    estimatedDuration: 'Same day',
    customerAction: 'Resume normal operations'
  }
];

// Service gap probabilities from Section 1.2 - real world vs promised SLA
export const SERVICE_GAP_ANALYSIS = {
  normalService: {
    probability: 0.70, // 70% probability of normal service
    durationMultiplier: 1.0,
    description: 'Service completed within promised timeframe'
  },
  minorDelay: {
    probability: 0.20, // 20% probability of minor delay
    durationMultiplier: 2.5,
    description: 'Minor delays due to parts availability or logistics'
  },
  criticalFailure: {
    probability: 0.10, // 10% probability of critical service failure
    durationMultiplier: 8.0,
    description: 'Extended delays, tool lost in system, or incomplete repairs'
  }
};

// Enhanced service features based on Fleet Management program
export interface FleetServiceFeatures {
  repairServices: {
    unlimitedCoverage: boolean;
    expeditedRepairs: boolean;
    loanerTools: boolean;
    proactiveMaintenance: boolean;
    calibrationServices: boolean;
  };
  
  theftProtection: {
    coveragePercentage: number;
    policeReportRequired: boolean;
    immediateReplacement: boolean;
    geographicRestrictions: string[];
  };
  
  supportServices: {
    technicalSupport24x7: boolean;
    onSiteAnalysis: boolean;
    safetyTraining: boolean;
    performanceReporting: boolean;
    dedicatedAccountManager: boolean;
  };
  
  flexibilityOptions: {
    toolsOnDemand: boolean;
    contractAdjustments: boolean;
    seasonalScaling: boolean;
    earlyTermination: boolean;
  };
}

// Standard Hilti Fleet Management service package
export const HILTI_FLEET_SERVICES: FleetServiceFeatures = {
  repairServices: {
    unlimitedCoverage: true,
    expeditedRepairs: true,
    loanerTools: true,
    proactiveMaintenance: true,
    calibrationServices: true
  },
  theftProtection: {
    coveragePercentage: 80,
    policeReportRequired: true,
    immediateReplacement: true,
    geographicRestrictions: []
  },
  supportServices: {
    technicalSupport24x7: true,
    onSiteAnalysis: true,
    safetyTraining: true,
    performanceReporting: true,
    dedicatedAccountManager: true
  },
  flexibilityOptions: {
    toolsOnDemand: true,
    contractAdjustments: true,
    seasonalScaling: true,
    earlyTermination: false
  }
};

// Service exclusions from Section 1.2
export const SERVICE_EXCLUSIONS = {
  deckingTools: {
    models: ['DX 860', 'DX 9', 'DX 76'],
    excludedParts: ['pistons', 'buffers', 'stop rings']
  },
  vacuumSystems: {
    excludedParts: ['filters']
  }
};

// Monte Carlo simulation for service reliability
export interface ServiceReliabilitySimulation {
  scenarios: ServiceScenario[];
  averageDowntime: number;
  worstCaseDowntime: number;
  reliabilityScore: number;
}

export interface ServiceScenario {
  probability: number;
  downtimeDays: number;
  cost: number;
  description: string;
}

export const simulateServiceReliability = (
  tools: EnhancedToolRecommendation[],
  projectDurationMonths: number
): ServiceReliabilitySimulation => {
  const scenarios: ServiceScenario[] = [];
  let totalWeightedDowntime = 0;
  let worstCase = 0;
  
  tools.forEach(tool => {
    const baseRepairDays = tool.riskFactors.expectedRepairDays;
    
    // Normal service scenario
    const normalDays = baseRepairDays * SERVICE_GAP_ANALYSIS.normalService.durationMultiplier;
    scenarios.push({
      probability: SERVICE_GAP_ANALYSIS.normalService.probability,
      downtimeDays: normalDays,
      cost: 0, // Covered under Fleet contract
      description: `${tool.name}: Normal repair turnaround`
    });
    
    // Minor delay scenario
    const delayDays = baseRepairDays * SERVICE_GAP_ANALYSIS.minorDelay.durationMultiplier;
    scenarios.push({
      probability: SERVICE_GAP_ANALYSIS.minorDelay.probability,
      downtimeDays: delayDays,
      cost: 0,
      description: `${tool.name}: Minor service delays`
    });
    
    // Critical failure scenario
    const criticalDays = baseRepairDays * SERVICE_GAP_ANALYSIS.criticalFailure.durationMultiplier;
    scenarios.push({
      probability: SERVICE_GAP_ANALYSIS.criticalFailure.probability,
      downtimeDays: criticalDays,
      cost: tool.monthlyCost * Math.ceil(criticalDays / 30), // Cost of extended downtime
      description: `${tool.name}: Critical service failure`
    });
    
    // Calculate weighted average
    totalWeightedDowntime += 
      (normalDays * SERVICE_GAP_ANALYSIS.normalService.probability) +
      (delayDays * SERVICE_GAP_ANALYSIS.minorDelay.probability) +
      (criticalDays * SERVICE_GAP_ANALYSIS.criticalFailure.probability);
    
    worstCase = Math.max(worstCase, criticalDays);
  });
  
  const averageDowntime = totalWeightedDowntime / tools.length;
  const reliabilityScore = Math.max(0, 100 - (averageDowntime / 30) * 10); // 10 points per month of downtime
  
  return {
    scenarios,
    averageDowntime,
    worstCaseDowntime: worstCase,
    reliabilityScore
  };
};

// Tools on Demand (ToD) recommendation engine from Section 1.4
export interface ToD_Recommendation {
  toolName: string;
  scenario: 'peak_season' | 'specialty_project' | 'backup_equipment';
  durationMonths: number;
  costComparison: {
    todMonthlyCost: number;
    fleetMonthlyCost: number;
    savings: number;
  };
  justification: string;
}

export const evaluateToolsOnDemand = (
  tool: EnhancedToolRecommendation,
  projectDurationMonths: number,
  peakSeasonMonths: number = 0,
  specialtyWorkMonths: number = 0
): ToD_Recommendation | null => {
  if (!tool.todEligible) return null;
  
  // Calculate break-even point (typically ToD is more expensive per month)
  const todPremiumMultiplier = 1.25; // 25% premium for short-term rentals
  const todMonthlyCost = tool.monthlyCost * todPremiumMultiplier;
  
  // Determine recommendation scenario
  let scenario: 'peak_season' | 'specialty_project' | 'backup_equipment';
  let recommendedDuration: number;
  let justification: string;
  
  if (peakSeasonMonths > 0 && peakSeasonMonths < projectDurationMonths * 0.6) {
    scenario = 'peak_season';
    recommendedDuration = peakSeasonMonths;
    justification = `Use ToD for ${peakSeasonMonths}-month peak season instead of full ${projectDurationMonths}-month Fleet contract`;
  } else if (specialtyWorkMonths > 0 && specialtyWorkMonths < projectDurationMonths * 0.4) {
    scenario = 'specialty_project';
    recommendedDuration = specialtyWorkMonths;
    justification = `Specialized tool only needed for ${specialtyWorkMonths} months of specialty work`;
  } else {
    scenario = 'backup_equipment';
    recommendedDuration = Math.min(3, projectDurationMonths); // Maximum 3 months for backup
    justification = `Keep as backup equipment for critical path protection`;
  }
  
  const todTotalCost = todMonthlyCost * recommendedDuration;
  const fleetTotalCost = tool.monthlyCost * projectDurationMonths;
  const savings = fleetTotalCost - todTotalCost;
  
  // Only recommend if savings > 20%
  if (savings > fleetTotalCost * 0.2) {
    return {
      toolName: tool.name,
      scenario,
      durationMonths: recommendedDuration,
      costComparison: {
        todMonthlyCost,
        fleetMonthlyCost: tool.monthlyCost,
        savings
      },
      justification
    };
  }
  
  return null;
};

// Service event tracking system
export class ServiceEventTracker {
  private events: ServiceEvent[] = [];
  
  createServiceEvent(
    toolId: string,
    eventType: 'repair' | 'theft' | 'maintenance' | 'replacement',
    promisedCompletionDays: number = 3
  ): ServiceEvent {
    const event: ServiceEvent = {
      eventId: `SE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      toolId,
      eventType,
      startDate: new Date(),
      promisedEndDate: new Date(Date.now() + promisedCompletionDays * 24 * 60 * 60 * 1000),
      status: 'initiated',
      statusDetail: 'Service request initiated',
    };
    
    this.events.push(event);
    return event;
  }
  
  updateServiceEvent(eventId: string, status: ServiceEvent['status'], notes?: string): void {
    const event = this.events.find(e => e.eventId === eventId);
    if (event) {
      event.status = status;
      event.statusDetail = this.getStatusDescription(status);
      if (notes) event.notes = notes;
      if (status === 'returned') {
        event.actualEndDate = new Date();
      }
    }
  }
  
  private getStatusDescription(status: ServiceEvent['status']): string {
    const statusMap = {
      'initiated': 'Service request initiated',
      'pickup_scheduled': 'Pickup scheduled with courier',
      'in_transit': 'Tool in transit to service center',
      'at_service_center': 'Tool received at service center',
      'in_service': 'Tool being serviced',
      'completed': 'Service completed, preparing for return',
      'returned': 'Tool returned to customer'
    };
    return statusMap[status] || 'Status updated';
  }
  
  getServiceMetrics(): {
    averageResolutionTime: number;
    onTimePerformance: number;
    activeEvents: number;
  } {
    const completedEvents = this.events.filter(e => e.actualEndDate);
    
    let totalResolutionTime = 0;
    let onTimeCount = 0;
    
    completedEvents.forEach(event => {
      const resolutionTime = event.actualEndDate!.getTime() - event.startDate.getTime();
      totalResolutionTime += resolutionTime;
      
      if (event.actualEndDate! <= event.promisedEndDate) {
        onTimeCount++;
      }
    });
    
    return {
      averageResolutionTime: completedEvents.length > 0 ? 
        totalResolutionTime / completedEvents.length / (24 * 60 * 60 * 1000) : 0,
      onTimePerformance: completedEvents.length > 0 ? 
        (onTimeCount / completedEvents.length) * 100 : 100,
      activeEvents: this.events.filter(e => !e.actualEndDate).length
    };
  }
}

// Enhanced tool recommendations with service features
export const enhanceToolWithServiceFeatures = (
  tool: any,
  projectComplexity: string
): EnhancedToolRecommendation => {
  // Determine service risk factors based on tool category and project complexity
  const getRiskFactors = (category: string, complexity: string) => {
    const baseRisk = {
      'drilling': { probability: 0.15, days: 3, critical: true },
      'cutting': { probability: 0.20, days: 4, critical: true },
      'measuring': { probability: 0.10, days: 2, critical: false },
      'fastening': { probability: 0.12, days: 3, critical: false },
      'safety': { probability: 0.08, days: 2, critical: false },
      'demolition': { probability: 0.18, days: 5, critical: true }
    };
    
    const risk = (baseRisk as any)[category.toLowerCase()] || baseRisk['drilling'];
    const complexityMultiplier = complexity === 'high' ? 1.3 : complexity === 'medium' ? 1.1 : 1.0;
    
    return {
      repairDowntimeProbability: risk.probability * complexityMultiplier,
      expectedRepairDays: Math.ceil(risk.days * complexityMultiplier),
      criticalPathImpact: risk.critical
    };
  };
  
  return {
    ...tool,
    serviceFeatures: {
      repairCoverage: true,
      theftCoverage: 80,
      loanerTools: true,
      onSiteMaintenance: ['measuring', 'layout'].includes(tool.category.toLowerCase()),
      trainingIncluded: true
    },
    todEligible: !['safety', 'measuring'].includes(tool.category.toLowerCase()), // Safety and precision tools less suitable for short-term
    riskFactors: getRiskFactors(tool.category, projectComplexity)
  };
};