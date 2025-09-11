// Project Data Types - Ported from FleetFlow-Hack implementation
export interface ProjectData {
  projectName: string;
  projectType: 'residential' | 'commercial' | 'infrastructure' | 'industrial' | 'renovation' | 'roadwork' | string;
  location: string;
  laborCount: number;
  timeline: number; // in months
  budget: number;
  existingTools: string[];
  blueprint?: File | null;
  specialRequirements?: string;
  projectComplexity: 'low' | 'medium' | 'high';
}

export interface ToolRecommendation {
  id?: string;
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
  // Real pricing from Hilti API
  pricing?: {
    standardPrice: number;
    fleetMonthlyPrice: number;
    fleetUpfrontCost: number;
    currency: string;
    priceSource: 'hilti_api' | 'estimated';
  } | null;
}

export interface FleetContract {
  totalCost: number;
  monthlyCost: number;
  duration: number;
  estimatedSavings: number;
  benefits: string[];
  terms: string[];
  tcoComparison?: {
    savings: number;
    recommendation: string;
    keyFactors: string[];
  };
}

export interface ProjectMetrics {
  productivityIncrease: number;
  downtimeReduction: number;
  laborSavings: number;
  downtimeSavings: number;
  totalROI: number;
}

// Enhanced tool recommendation with Fleet Management features
export interface EnhancedToolRecommendation extends ToolRecommendation {
  // Service features from Section 1.2 of the document
  serviceFeatures: {
    repairCoverage: boolean;
    theftCoverage: number; // percentage covered
    loanerTools: boolean;
    onSiteMaintenance: boolean;
    trainingIncluded: boolean;
  };
  
  // Tools on Demand eligibility
  todEligible: boolean;
  
  // Risk factors for service gap analysis
  riskFactors: {
    repairDowntimeProbability: number; // 0-1
    expectedRepairDays: number;
    criticalPathImpact: boolean;
  };
}

// Project archetype definitions from Section 3
export type ProjectArchetype = 'residential' | 'commercial' | 'industrial';

export interface ProjectArchetypeTools {
  archetype: ProjectArchetype;
  requiredTools: {
    category: string;
    priority: 'essential' | 'recommended' | 'situational';
    tools: string[];
  }[];
}

// Service tracking for workflow emulation (Section 4.1)
export interface ServiceEvent {
  eventId: string;
  toolId: string;
  eventType: 'repair' | 'theft' | 'maintenance' | 'replacement';
  startDate: Date;
  promisedEndDate: Date;
  actualEndDate?: Date;
  status: 'initiated' | 'pickup_scheduled' | 'in_transit' | 'at_service_center' | 'in_service' | 'completed' | 'returned';
  statusDetail: string;
  notes?: string;
}

// TCO Calculator interfaces
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

export interface RiskAssessment {
  level: string;
  description: string;
}