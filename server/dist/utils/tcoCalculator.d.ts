import { ProjectData, ToolRecommendation } from '../types/ProjectData';
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
export declare const calculateTCO: (projectData: ProjectData, recommendations: ToolRecommendation[], managerHourlyRate?: number) => TCOComparison;
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
export declare const generateDetailedBreakdown: (tcoComparison: TCOComparison, projectTimeline?: number) => DetailedCostBreakdown;
export declare const formatCurrency: (amount: number) => string;
export declare const formatPercentage: (value: number) => string;
export interface RiskAssessment {
    capitalRisk: 'low' | 'medium' | 'high';
    operationalRisk: 'low' | 'medium' | 'high';
    maintenanceRisk: 'low' | 'medium' | 'high';
    cashFlowRisk: 'low' | 'medium' | 'high';
    overallRecommendation: string;
    riskFactors: string[];
}
export declare const assessProjectRisk: (projectData: ProjectData, tcoComparison: TCOComparison) => RiskAssessment;
