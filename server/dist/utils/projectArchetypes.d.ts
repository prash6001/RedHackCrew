import { ProjectArchetypeTools, ProjectArchetype } from '../types/ProjectData';
export declare const RESIDENTIAL_ARCHETYPE: ProjectArchetypeTools;
export declare const COMMERCIAL_ARCHETYPE: ProjectArchetypeTools;
export declare const INDUSTRIAL_ARCHETYPE: ProjectArchetypeTools;
export interface ToolPriorityMatrix {
    [toolName: string]: {
        residential: 'essential' | 'recommended' | 'situational' | 'not_applicable';
        commercial: 'essential' | 'recommended' | 'situational' | 'not_applicable';
        industrial: 'essential' | 'recommended' | 'situational' | 'not_applicable';
    };
}
export declare const TOOL_PRIORITY_MATRIX: ToolPriorityMatrix;
export declare const getArchetypeTools: (archetype: ProjectArchetype) => ProjectArchetypeTools;
export declare const getToolNecessity: (toolName: string, archetype: ProjectArchetype) => "essential" | "recommended" | "situational" | "not_applicable";
export declare const getArchetypeQuantityMultiplier: (archetype: ProjectArchetype, laborCount: number) => number;
export declare const getArchetypeJustification: (toolName: string, archetype: ProjectArchetype, necessity: string) => string[];
export declare const PROJECT_ARCHETYPES: Record<ProjectArchetype, ProjectArchetypeTools>;
