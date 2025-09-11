import { ProjectData, ToolRecommendation } from '../types/ProjectData';
export interface EnhancedToolRecommendation extends ToolRecommendation {
    serviceAdvantages?: string[];
    riskMitigation?: string[];
    todSuitability?: 'excellent' | 'good' | 'limited' | 'not_suitable';
    archetypeMatch?: 'essential' | 'recommended' | 'situational';
}
export declare const enhanceRecommendations: (projectData: ProjectData, baseRecommendations: ToolRecommendation[]) => EnhancedToolRecommendation[];
export declare const generateQuickInsights: (projectData: ProjectData, recommendations: ToolRecommendation[]) => {
    totalFleetCost: number;
    monthlyPayment: number;
    estimatedSavings: number;
    paybackPeriod: number;
    toolCount: number;
    criticalTools: number;
    riskReduction: string;
    serviceGuarantee: string;
    keyRecommendations: string[];
};
export declare const analyzeToolsOnDemand: (recommendations: ToolRecommendation[], projectData: ProjectData) => {
    candidates: ToolRecommendation[];
    potentialSavings: number;
    recommendation: string;
};
export declare const assessProjectRisks: (projectData: ProjectData, recommendations: ToolRecommendation[]) => {
    riskLevel: string;
    riskFactors: string[];
    mitigation: string;
};
export declare const getEnhancedAnalysis: (projectData: ProjectData, baseRecommendations: ToolRecommendation[]) => {
    enhancedTools: EnhancedToolRecommendation[];
    insights: {
        totalFleetCost: number;
        monthlyPayment: number;
        estimatedSavings: number;
        paybackPeriod: number;
        toolCount: number;
        criticalTools: number;
        riskReduction: string;
        serviceGuarantee: string;
        keyRecommendations: string[];
    };
    todAnalysis: {
        candidates: ToolRecommendation[];
        potentialSavings: number;
        recommendation: string;
    };
    riskAssessment: {
        riskLevel: string;
        riskFactors: string[];
        mitigation: string;
    };
};
