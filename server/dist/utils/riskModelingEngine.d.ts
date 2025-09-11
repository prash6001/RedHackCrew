import { ProjectData, EnhancedToolRecommendation } from '../types/ProjectData';
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
    probability: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
    costImpact: number;
    timeImpact: number;
}
export interface MitigationStrategy {
    riskCategory: string;
    strategy: string;
    cost: number;
    effectiveness: number;
    implementationTime: number;
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
export interface MonteCarloConfig {
    iterations: number;
    confidenceLevel: number;
    timeHorizonDays: number;
}
export interface SimulationResult {
    scenarios: ScenarioOutcome[];
    statistics: {
        mean: number;
        median: number;
        standardDeviation: number;
        percentiles: {
            [key: string]: number;
        };
        confidenceInterval: {
            lower: number;
            upper: number;
        };
    };
    recommendations: string[];
}
export interface ScenarioOutcome {
    scenarioId: number;
    totalDowntime: number;
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
export declare class RiskModelingEngine {
    static assessProjectRisk(projectData: ProjectData, recommendations: EnhancedToolRecommendation[]): ProjectRiskProfile;
    private static identifyRiskFactors;
    private static generateMitigationStrategies;
    private static createContingencyPlans;
    private static calculateFinancialImpact;
    private static calculateOverallRisk;
    private static calculateServiceGapCost;
    static runMonteCarloSimulation(projectData: ProjectData, recommendations: EnhancedToolRecommendation[], config?: MonteCarloConfig): SimulationResult;
    private static simulateSingleScenario;
    private static calculateStatistics;
    private static generateMonteCarloRecommendations;
}
export declare const formatRiskLevel: (risk: string) => string;
export declare const formatCurrency: (amount: number) => string;
