import { EnhancedToolRecommendation, ServiceEvent } from '../types/ProjectData';
export interface ServiceWorkflow {
    step: number;
    status: string;
    description: string;
    estimatedDuration: string;
    customerAction?: string;
}
export declare const REPAIR_WORKFLOW_STEPS: ServiceWorkflow[];
export declare const SERVICE_GAP_ANALYSIS: {
    normalService: {
        probability: number;
        durationMultiplier: number;
        description: string;
    };
    minorDelay: {
        probability: number;
        durationMultiplier: number;
        description: string;
    };
    criticalFailure: {
        probability: number;
        durationMultiplier: number;
        description: string;
    };
};
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
export declare const HILTI_FLEET_SERVICES: FleetServiceFeatures;
export declare const SERVICE_EXCLUSIONS: {
    deckingTools: {
        models: string[];
        excludedParts: string[];
    };
    vacuumSystems: {
        excludedParts: string[];
    };
};
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
export declare const simulateServiceReliability: (tools: EnhancedToolRecommendation[], projectDurationMonths: number) => ServiceReliabilitySimulation;
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
export declare const evaluateToolsOnDemand: (tool: EnhancedToolRecommendation, projectDurationMonths: number, peakSeasonMonths?: number, specialtyWorkMonths?: number) => ToD_Recommendation | null;
export declare class ServiceEventTracker {
    private events;
    createServiceEvent(toolId: string, eventType: 'repair' | 'theft' | 'maintenance' | 'replacement', promisedCompletionDays?: number): ServiceEvent;
    updateServiceEvent(eventId: string, status: ServiceEvent['status'], notes?: string): void;
    private getStatusDescription;
    getServiceMetrics(): {
        averageResolutionTime: number;
        onTimePerformance: number;
        activeEvents: number;
    };
}
export declare const enhanceToolWithServiceFeatures: (tool: any, projectComplexity: string) => EnhancedToolRecommendation;
