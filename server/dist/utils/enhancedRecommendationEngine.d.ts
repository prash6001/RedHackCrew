import { ProjectData, EnhancedToolRecommendation } from '../types/ProjectData';
import { ToD_Recommendation } from './fleetServiceModeling';
import { TCOComparison } from './tcoCalculator';
import { ProjectRiskProfile } from './riskModelingEngine';
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
    coreFleetDuration: number;
    todDuration: number;
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
export declare class EnhancedRecommendationEngine {
    static generateRecommendationStrategy(projectData: ProjectData): RecommendationStrategy;
    private static generateBaseRecommendations;
    private static evaluateToolsOnDemand;
    private static analyzeToD_Scenarios;
    private static createHybridStrategies;
    private static finalizeCoreFleet;
    private static generateServiceJustification;
    private static generateCompetitiveAdvantages;
    private static generateStrategicInsights;
    static generateEnhancedRecommendations(projectData: ProjectData): EnhancedToolRecommendation[];
    static getStrategicRecommendations(projectData: ProjectData): RecommendationStrategy;
}
export declare const formatToolOnDemandSavings: (savings: number) => string;
export declare const formatHybridStrategy: (strategy: HybridToolStrategy) => string;
