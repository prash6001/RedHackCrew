import { ProjectData } from '../types/ProjectData';
export interface ValidationReport {
    status: 'PASS' | 'FAIL' | 'WARNING';
    component: string;
    tests: TestResult[];
    performance: PerformanceMetric;
    recommendations: string[];
}
export interface TestResult {
    testName: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    message: string;
    executionTime?: number;
    errorDetails?: string;
}
export interface PerformanceMetric {
    executionTime: number;
    memoryUsage: number;
    apiCalls: number;
    cacheHits: number;
}
export declare class SystemValidator {
    private validationResults;
    runComprehensiveValidation(projectData?: ProjectData): Promise<{
        overallStatus: 'PASS' | 'FAIL' | 'WARNING';
        results: ValidationReport[];
        summary: ValidationSummary;
    }>;
    private validateTCOCalculator;
    private validateRecommendationEngine;
    private validateRiskModeling;
    private validateServiceModeling;
    private validateProjectArchetypes;
    private validateCostAllocation;
    private validateDataIntegrity;
    private validatePerformance;
    private generateTestProjectData;
    private hasRequiredProperties;
    private validateProjectDataStructure;
    private generateValidationSummary;
    private determineOverallStatus;
}
interface ValidationSummary {
    totalComponents: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    warningTests: number;
    successRate: number;
    criticalIssues: number;
    recommendations: string[];
}
export declare const runSystemValidation: (projectData?: ProjectData) => Promise<{
    overallStatus: "PASS" | "FAIL" | "WARNING";
    results: ValidationReport[];
    summary: ValidationSummary;
}>;
export {};
