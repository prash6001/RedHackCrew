import { ProjectData, ToolRecommendation, FleetContract } from '../types/ProjectData.js';
export declare const generateEnhancedRecommendations: (projectData: ProjectData) => Promise<ToolRecommendation[]>;
export declare const generateFleetContract: (projectData: ProjectData, recommendations: ToolRecommendation[]) => FleetContract;
