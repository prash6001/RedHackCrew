// System validation script to verify all components work correctly
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

export class SystemValidator {
  private validationResults: ValidationReport[] = [];
  
  async runComprehensiveValidation(projectData?: ProjectData): Promise<{
    overallStatus: 'PASS' | 'FAIL' | 'WARNING';
    results: ValidationReport[];
    summary: ValidationSummary;
  }> {
    // Starting comprehensive system validation
    
    const testProjectData = projectData || this.generateTestProjectData();
    
    // Run all component validations
    await this.validateTCOCalculator(testProjectData);
    await this.validateRecommendationEngine(testProjectData);
    await this.validateRiskModeling(testProjectData);
    await this.validateServiceModeling(testProjectData);
    await this.validateProjectArchetypes();
    await this.validateCostAllocation();
    await this.validateDataIntegrity(testProjectData);
    await this.validatePerformance(testProjectData);
    
    const summary = this.generateValidationSummary();
    const overallStatus = this.determineOverallStatus();
    
    return {
      overallStatus,
      results: this.validationResults,
      summary
    };
  }
  
  private async validateTCOCalculator(projectData: ProjectData): Promise<void> {
    const startTime = performance.now();
    const tests: TestResult[] = [];
    
    try {
      const { calculateTCO } = await import('./tcoCalculator');
      
      // Test with mock recommendations
      const mockRecommendations = [
        {
          name: 'Test Hammer Drill',
          monthlyCost: 150,
          totalCost: 2700,
          quantity: 2,
          category: 'drilling'
        }
      ];
      
      const tcoResult = calculateTCO(projectData, mockRecommendations as any);
      
      // Validate structure
      tests.push({
        testName: 'TCO Structure Validation',
        status: this.hasRequiredProperties(tcoResult, ['ownership', 'fleetManagement', 'savings', 'recommendation']) ? 'PASS' : 'FAIL',
        message: 'TCO result contains all required properties'
      });
      
      // Validate calculations
      tests.push({
        testName: 'TCO Calculations',
        status: (tcoResult.ownership.totalFourYearCost > 0 && tcoResult.fleetManagement.totalFourYearCost > 0) ? 'PASS' : 'FAIL',
        message: 'TCO calculations produce positive values'
      });
      
      // Validate recommendation logic
      tests.push({
        testName: 'Recommendation Logic',
        status: ['ownership', 'fleet'].includes(tcoResult.recommendation) ? 'PASS' : 'FAIL',
        message: 'TCO recommendation is valid'
      });
      
    } catch (error) {
      tests.push({
        testName: 'TCO Calculator Import/Execution',
        status: 'FAIL',
        message: 'Failed to execute TCO calculator',
        errorDetails: error instanceof Error ? error.message : String(error)
      });
    }
    
    const executionTime = performance.now() - startTime;
    
    this.validationResults.push({
      status: tests.every(t => t.status === 'PASS') ? 'PASS' : 'FAIL',
      component: 'TCO Calculator',
      tests,
      performance: {
        executionTime,
        memoryUsage: 0,
        apiCalls: 0,
        cacheHits: 0
      },
      recommendations: tests.some(t => t.status === 'FAIL') ? 
        ['Review TCO calculation logic', 'Verify input data validation'] : 
        ['TCO Calculator is functioning correctly']
    });
  }
  
  private async validateRecommendationEngine(projectData: ProjectData): Promise<void> {
    const startTime = performance.now();
    const tests: TestResult[] = [];
    
    try {
      const { EnhancedRecommendationEngine } = await import('./enhancedRecommendationEngine');
      
      const strategy = EnhancedRecommendationEngine.getStrategicRecommendations(projectData);
      
      tests.push({
        testName: 'Strategy Structure',
        status: this.hasRequiredProperties(strategy, ['coreFleetTools', 'tcoAnalysis', 'riskProfile', 'strategicInsights']) ? 'PASS' : 'FAIL',
        message: 'Strategy contains all required components'
      });
      
      tests.push({
        testName: 'Tool Recommendations',
        status: Array.isArray(strategy.coreFleetTools) && strategy.coreFleetTools.length > 0 ? 'PASS' : 'FAIL',
        message: 'Generated tool recommendations'
      });
      
      tests.push({
        testName: 'Strategic Insights',
        status: Array.isArray(strategy.strategicInsights) && strategy.strategicInsights.length > 0 ? 'PASS' : 'FAIL',
        message: 'Generated strategic insights'
      });
      
    } catch (error) {
      tests.push({
        testName: 'Recommendation Engine',
        status: 'FAIL',
        message: 'Failed to execute recommendation engine',
        errorDetails: error instanceof Error ? error.message : String(error)
      });
    }
    
    const executionTime = performance.now() - startTime;
    
    this.validationResults.push({
      status: tests.every(t => t.status === 'PASS') ? 'PASS' : 'FAIL',
      component: 'Enhanced Recommendation Engine',
      tests,
      performance: { executionTime, memoryUsage: 0, apiCalls: 0, cacheHits: 0 },
      recommendations: ['Recommendation engine is operational']
    });
  }
  
  private async validateRiskModeling(projectData: ProjectData): Promise<void> {
    const startTime = performance.now();
    const tests: TestResult[] = [];
    
    try {
      const { RiskModelingEngine } = await import('./riskModelingEngine');
      const { enhanceToolWithServiceFeatures } = await import('./fleetServiceModeling');
      
      const mockTool = enhanceToolWithServiceFeatures({
        name: 'Test Tool',
        category: 'drilling',
        monthlyCost: 200,
        totalCost: 3600
      }, 'medium');
      
      const riskProfile = RiskModelingEngine.assessProjectRisk(projectData, [mockTool]);
      
      tests.push({
        testName: 'Risk Profile Structure',
        status: this.hasRequiredProperties(riskProfile, ['overallRisk', 'riskFactors', 'mitigationStrategies']) ? 'PASS' : 'FAIL',
        message: 'Risk profile structure is valid'
      });
      
      tests.push({
        testName: 'Risk Level Classification',
        status: ['low', 'medium', 'high', 'critical'].includes(riskProfile.overallRisk) ? 'PASS' : 'FAIL',
        message: 'Risk level is properly classified'
      });
      
      // Test Monte Carlo simulation
      const simulation = RiskModelingEngine.runMonteCarloSimulation(projectData, [mockTool]);
      
      tests.push({
        testName: 'Monte Carlo Simulation',
        status: simulation.scenarios.length > 0 && simulation.statistics ? 'PASS' : 'FAIL',
        message: 'Monte Carlo simulation executed successfully'
      });
      
    } catch (error) {
      tests.push({
        testName: 'Risk Modeling Engine',
        status: 'FAIL',
        message: 'Failed to execute risk modeling',
        errorDetails: error instanceof Error ? error.message : String(error)
      });
    }
    
    const executionTime = performance.now() - startTime;
    
    this.validationResults.push({
      status: tests.every(t => t.status === 'PASS') ? 'PASS' : 'FAIL',
      component: 'Risk Modeling Engine',
      tests,
      performance: { executionTime, memoryUsage: 0, apiCalls: 0, cacheHits: 0 },
      recommendations: ['Risk modeling is functioning correctly']
    });
  }
  
  private async validateServiceModeling(projectData: ProjectData): Promise<void> {
    const tests: TestResult[] = [];
    
    try {
      const { enhanceToolWithServiceFeatures, ServiceEventTracker } = await import('./fleetServiceModeling');
      
      const enhancedTool = enhanceToolWithServiceFeatures({
        name: 'Test Tool',
        category: 'drilling',
        monthlyCost: 150
      }, 'high');
      
      tests.push({
        testName: 'Service Feature Enhancement',
        status: this.hasRequiredProperties(enhancedTool, ['serviceFeatures', 'todEligible', 'riskFactors']) ? 'PASS' : 'FAIL',
        message: 'Tool service features enhanced correctly'
      });
      
      // Test service event tracker
      const tracker = new ServiceEventTracker();
      const event = tracker.createServiceEvent('T001', 'repair');
      
      tests.push({
        testName: 'Service Event Tracking',
        status: event.eventId && event.toolId === 'T001' ? 'PASS' : 'FAIL',
        message: 'Service event tracking operational'
      });
      
    } catch (error) {
      tests.push({
        testName: 'Service Modeling',
        status: 'FAIL',
        message: 'Failed to execute service modeling',
        errorDetails: error instanceof Error ? error.message : String(error)
      });
    }
    
    this.validationResults.push({
      status: tests.every(t => t.status === 'PASS') ? 'PASS' : 'FAIL',
      component: 'Service Modeling',
      tests,
      performance: { executionTime: 0, memoryUsage: 0, apiCalls: 0, cacheHits: 0 },
      recommendations: ['Service modeling is operational']
    });
  }
  
  private async validateProjectArchetypes(): Promise<void> {
    const tests: TestResult[] = [];
    
    try {
      const { getArchetypeTools, getToolNecessity, TOOL_PRIORITY_MATRIX } = await import('./projectArchetypes');
      
      const commercialTools = getArchetypeTools('commercial');
      const necessity = getToolNecessity('Rotary Hammer', 'commercial');
      
      tests.push({
        testName: 'Archetype Tools Retrieval',
        status: commercialTools && commercialTools.requiredTools.length > 0 ? 'PASS' : 'FAIL',
        message: 'Successfully retrieved archetype tools'
      });
      
      tests.push({
        testName: 'Tool Necessity Classification',
        status: ['essential', 'recommended', 'situational', 'not_applicable'].includes(necessity) ? 'PASS' : 'FAIL',
        message: 'Tool necessity properly classified'
      });
      
      tests.push({
        testName: 'Priority Matrix Coverage',
        status: Object.keys(TOOL_PRIORITY_MATRIX).length > 10 ? 'PASS' : 'FAIL',
        message: 'Priority matrix has adequate coverage'
      });
      
    } catch (error) {
      tests.push({
        testName: 'Project Archetypes',
        status: 'FAIL',
        message: 'Failed to execute project archetypes',
        errorDetails: error instanceof Error ? error.message : String(error)
      });
    }
    
    this.validationResults.push({
      status: tests.every(t => t.status === 'PASS') ? 'PASS' : 'FAIL',
      component: 'Project Archetypes',
      tests,
      performance: { executionTime: 0, memoryUsage: 0, apiCalls: 0, cacheHits: 0 },
      recommendations: ['Project archetypes are functioning correctly']
    });
  }
  
  private async validateCostAllocation(): Promise<void> {
    const tests: TestResult[] = [];
    
    try {
      const { CostAllocationEngine, InvoiceReportingEngine } = await import('./costAllocationEngine');
      
      const engine = new CostAllocationEngine({
        allocationMethod: 'project',
        billingFrequency: 'monthly',
        includeTaxes: true,
        taxRate: 0.08,
        currency: 'USD',
        detailLevel: 'detailed'
      });
      
      tests.push({
        testName: 'Cost Allocation Engine Creation',
        status: engine ? 'PASS' : 'FAIL',
        message: 'Cost allocation engine created successfully'
      });
      
      // Test invoice generation with mock data
      const mockInvoices = [
        {
          invoiceID: 'TEST001',
          total: 1000,
          status: 'Paid' as any,
          dueDate: new Date(),
          paidDate: new Date(),
          billingPeriod: {
            startDate: new Date(),
            endDate: new Date(),
            month: 1,
            year: 2024
          },
          lineItems: [],
          subtotal: 1000,
          taxes: 80
        }
      ];
      
      const summary = InvoiceReportingEngine.generateInvoiceSummary(mockInvoices);
      
      tests.push({
        testName: 'Invoice Reporting',
        status: summary.totalInvoices === 1 && summary.totalRevenue === 1000 ? 'PASS' : 'FAIL',
        message: 'Invoice reporting generates correct summaries'
      });
      
    } catch (error) {
      tests.push({
        testName: 'Cost Allocation',
        status: 'FAIL',
        message: 'Failed to execute cost allocation',
        errorDetails: error instanceof Error ? error.message : String(error)
      });
    }
    
    this.validationResults.push({
      status: tests.every(t => t.status === 'PASS') ? 'PASS' : 'FAIL',
      component: 'Cost Allocation Engine',
      tests,
      performance: { executionTime: 0, memoryUsage: 0, apiCalls: 0, cacheHits: 0 },
      recommendations: ['Cost allocation is functioning correctly']
    });
  }
  
  private async validateDataIntegrity(projectData: ProjectData): Promise<void> {
    const tests: TestResult[] = [];
    
    // Test data consistency across components
    tests.push({
      testName: 'Project Data Validation',
      status: this.validateProjectDataStructure(projectData) ? 'PASS' : 'FAIL',
      message: 'Project data structure is valid'
    });
    
    // Test type consistency
    tests.push({
      testName: 'Type Consistency',
      status: typeof projectData.laborCount === 'number' && typeof projectData.timeline === 'number' ? 'PASS' : 'FAIL',
      message: 'Data types are consistent'
    });
    
    this.validationResults.push({
      status: tests.every(t => t.status === 'PASS') ? 'PASS' : 'FAIL',
      component: 'Data Integrity',
      tests,
      performance: { executionTime: 0, memoryUsage: 0, apiCalls: 0, cacheHits: 0 },
      recommendations: ['Data integrity checks passed']
    });
  }
  
  private async validatePerformance(projectData: ProjectData): Promise<void> {
    const tests: TestResult[] = [];
    
    const startTime = performance.now();
    
    try {
      const { EnhancedRecommendationEngine } = await import('./enhancedRecommendationEngine');
      const strategy = EnhancedRecommendationEngine.getStrategicRecommendations(projectData);
      
      const executionTime = performance.now() - startTime;
      
      tests.push({
        testName: 'Response Time',
        status: executionTime < 5000 ? 'PASS' : executionTime < 10000 ? 'WARNING' : 'FAIL',
        message: `Full analysis completed in ${Math.round(executionTime)}ms`,
        executionTime
      });
      
      tests.push({
        testName: 'Result Quality',
        status: strategy.coreFleetTools.length > 0 && strategy.strategicInsights.length > 0 ? 'PASS' : 'FAIL',
        message: 'Analysis produces meaningful results'
      });
      
    } catch (error) {
      tests.push({
        testName: 'Performance Test',
        status: 'FAIL',
        message: 'Performance test failed',
        errorDetails: error instanceof Error ? error.message : String(error)
      });
    }
    
    this.validationResults.push({
      status: tests.every(t => t.status === 'PASS') ? 'PASS' : 'FAIL',
      component: 'Performance',
      tests,
      performance: { executionTime: 0, memoryUsage: 0, apiCalls: 0, cacheHits: 0 },
      recommendations: ['Performance is within acceptable limits']
    });
  }
  
  private generateTestProjectData(): ProjectData {
    return {
      projectName: 'Validation Test Project',
      projectType: 'commercial',
      location: 'Test City, TS',
      laborCount: 25,
      timeline: 18,
      budget: 2000000,
      existingTools: ['Safety Equipment'],
      blueprint: null,
      specialRequirements: 'System validation test',
      projectComplexity: 'medium'
    };
  }
  
  private hasRequiredProperties(obj: any, properties: string[]): boolean {
    return properties.every(prop => obj.hasOwnProperty(prop));
  }
  
  private validateProjectDataStructure(data: ProjectData): boolean {
    const requiredFields = ['projectName', 'projectType', 'location', 'laborCount', 'timeline', 'budget'];
    return requiredFields.every(field => data.hasOwnProperty(field) && (data as any)[field] !== null && (data as any)[field] !== undefined);
  }
  
  private generateValidationSummary(): ValidationSummary {
    const totalTests = this.validationResults.reduce((sum, result) => sum + result.tests.length, 0);
    const passedTests = this.validationResults.reduce((sum, result) => 
      sum + result.tests.filter(test => test.status === 'PASS').length, 0);
    const failedTests = this.validationResults.reduce((sum, result) => 
      sum + result.tests.filter(test => test.status === 'FAIL').length, 0);
    const warningTests = this.validationResults.reduce((sum, result) => 
      sum + result.tests.filter(test => test.status === 'WARNING').length, 0);
    
    return {
      totalComponents: this.validationResults.length,
      totalTests,
      passedTests,
      failedTests,
      warningTests,
      successRate: (passedTests / totalTests) * 100,
      criticalIssues: this.validationResults.filter(r => r.status === 'FAIL').length,
      recommendations: this.validationResults.flatMap(r => r.recommendations)
    };
  }
  
  private determineOverallStatus(): 'PASS' | 'FAIL' | 'WARNING' {
    const hasFailures = this.validationResults.some(r => r.status === 'FAIL');
    const hasWarnings = this.validationResults.some(r => r.status === 'WARNING');
    
    if (hasFailures) return 'FAIL';
    if (hasWarnings) return 'WARNING';
    return 'PASS';
  }
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

// Export validation runner
export const runSystemValidation = async (projectData?: ProjectData) => {
  const validator = new SystemValidator();
  return await validator.runComprehensiveValidation(projectData);
};