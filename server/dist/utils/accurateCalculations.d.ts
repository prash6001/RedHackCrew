import { ProjectData, ToolRecommendation, FleetContract, ProjectMetrics } from '../types/ProjectData.js';
export declare const formatCurrency: (amount: number) => string;
export declare const formatPercentage: (decimal: number) => string;
export declare const calculateProjectMetrics: (projectData: ProjectData, recommendations: ToolRecommendation[]) => ProjectMetrics;
export declare const generateAccurateFleetContract: (projectData: ProjectData, recommendations: ToolRecommendation[]) => FleetContract;
export declare const calculateToolROI: (tool: ToolRecommendation, projectData: ProjectData) => number;
export declare const calculateFleetPricing: (basePrice: number, projectData: ProjectData, toolCategory: string) => {
    monthlyCost: number;
    totalCost: number;
    discount: number;
};
