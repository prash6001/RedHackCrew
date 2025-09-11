import { ProjectData, ToolRecommendation, FleetContract } from '../types/ProjectData.js';
export declare const generateRecommendations: (projectData: ProjectData) => ToolRecommendation[];
export declare const generateFleetContract: (projectData: ProjectData, recommendations: ToolRecommendation[]) => FleetContract;
