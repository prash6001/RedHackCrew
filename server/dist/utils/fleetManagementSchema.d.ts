export interface FleetManagementDatabase {
    tools: Tool[];
    projects: Project[];
    serviceEvents: ServiceEvent[];
    costModels: CostModel[];
    toolKits: ToolKit[];
    invoicing: Invoice[];
    contracts: FleetContract[];
}
export interface Tool {
    toolID: string;
    hiltiItemNumber: string;
    toolName: string;
    category: ToolCategory;
    status: ToolStatus;
    assignedProjectID?: string;
    serialNumber?: string;
    acquisitionDate: Date;
    warrantyExpiration?: Date;
    lastServiceDate?: Date;
    nextServiceDate?: Date;
    currentLocation: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_service';
    utilizationHours?: number;
    monthlyRate: number;
    assetValue: number;
}
export type ToolCategory = 'Drilling' | 'Cutting' | 'Fastening' | 'Layout' | 'Measuring' | 'Safety' | 'Demolition' | 'Fabrication' | 'Access Equipment' | 'Material Handling';
export type ToolStatus = 'Active' | 'In_Repair' | 'Stolen' | 'Out_of_Service' | 'In_Transit' | 'Available' | 'Reserved' | 'End_of_Life';
export interface Project {
    projectID: string;
    projectName: string;
    projectType: ProjectType;
    location: string;
    startDate: Date;
    endDate: Date;
    projectManager: string;
    laborCount: number;
    budgetTotal: number;
    budgetTools: number;
    complexity: ProjectComplexity;
    status: ProjectStatus;
    clientName: string;
    contractValue: number;
}
export type ProjectType = 'Residential' | 'Commercial' | 'Industrial' | 'Infrastructure' | 'Renovation' | 'Roadwork';
export type ProjectComplexity = 'low' | 'medium' | 'high';
export type ProjectStatus = 'Planning' | 'Active' | 'On_Hold' | 'Completed' | 'Cancelled';
export interface ServiceEvent {
    eventID: string;
    toolID: string;
    eventType: ServiceEventType;
    startDate: Date;
    promisedEndDate: Date;
    actualEndDate?: Date;
    statusDetail: ServiceStatusDetail;
    customerNotes?: string;
    technicianNotes?: string;
    cost: number;
    partsUsed?: string[];
    laborHours?: number;
    serviceCenter: string;
    priority: ServicePriority;
    customerSatisfaction?: number;
}
export type ServiceEventType = 'Repair' | 'Theft' | 'Maintenance' | 'Calibration' | 'Warranty' | 'Training' | 'Inspection';
export type ServiceStatusDetail = 'Order_Received' | 'Tool_Pickup' | 'Arrived_Service_Center' | 'Tool_In_Service' | 'Service_Completed_Shipping' | 'Tool_Returned';
export type ServicePriority = 'low' | 'normal' | 'high' | 'urgent';
export interface CostModel {
    modelID: string;
    toolKitID?: string;
    projectID?: string;
    modelType: CostModelType;
    costComponent: CostComponent;
    value: number;
    calculationDate: Date;
    assumptions: string;
    validityPeriod: number;
}
export type CostModelType = 'TCO' | 'Lease' | 'Purchase_vs_Lease' | 'Risk_Assessment' | 'ROI_Analysis';
export type CostComponent = 'Upfront_Capital' | 'Monthly_Payment' | 'Maintenance' | 'Insurance' | 'Training' | 'Administrative' | 'Depreciation' | 'Opportunity_Cost' | 'Risk_Premium';
export interface ToolKit {
    toolKitID: string;
    kitName: string;
    description: string;
    projectArchetype: ProjectType;
    toolIDs: string[];
    totalMonthlyRate: number;
    totalAssetValue: number;
    recommendedCrewSize: number;
    lastUpdated: Date;
}
export interface Invoice {
    invoiceID: string;
    projectID?: string;
    costCenter?: string;
    crew?: string;
    billingPeriod: BillingPeriod;
    lineItems: InvoiceLineItem[];
    subtotal: number;
    taxes: number;
    total: number;
    dueDate: Date;
    paidDate?: Date;
    status: InvoiceStatus;
}
export interface BillingPeriod {
    startDate: Date;
    endDate: Date;
    month: number;
    year: number;
}
export interface InvoiceLineItem {
    toolID: string;
    toolName: string;
    quantity: number;
    monthlyRate: number;
    daysUsed: number;
    lineTotal: number;
    description?: string;
}
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Disputed' | 'Cancelled';
export interface FleetContract {
    contractID: string;
    projectID: string;
    contractType: ContractType;
    startDate: Date;
    endDate: Date;
    totalContractValue: number;
    monthlyPayment: number;
    toolsIncluded: string[];
    serviceLevel: ServiceLevel;
    terms: ContractTerm[];
    status: ContractStatus;
    renewalOptions: RenewalOption[];
    performanceMetrics: ContractMetrics;
}
export type ContractType = 'Standard_Fleet' | 'Premium_Fleet' | 'Hybrid_Fleet_ToD' | 'Tools_on_Demand_Only' | 'Custom';
export type ServiceLevel = {
    repairSLA: number;
    replacementSLA: number;
    theftCoveragePercent: number;
    loanerToolsIncluded: boolean;
    onSiteSupport: boolean;
    trainingIncluded: boolean;
    reportingFrequency: 'weekly' | 'monthly' | 'quarterly';
};
export interface ContractTerm {
    termType: string;
    description: string;
    effectiveDate: Date;
    expirationDate?: Date;
}
export type ContractStatus = 'Draft' | 'Active' | 'Suspended' | 'Expired' | 'Terminated' | 'Under_Review';
export interface RenewalOption {
    optionType: 'Auto_Renew' | 'Manual_Renew' | 'Upgrade' | 'Terminate';
    noticePeriodDays: number;
    newTermMonths?: number;
    adjustmentPercent?: number;
}
export interface ContractMetrics {
    uptimePercentage: number;
    serviceCallsCount: number;
    averageRepairTime: number;
    customerSatisfactionScore: number;
    costPerUtilizationHour: number;
    toolsReplacedCount: number;
    theftClaims: number;
}
export interface FleetAnalytics {
    utilization: UtilizationReport;
    financial: FinancialReport;
    service: ServiceReport;
    risk: RiskReport;
}
export interface UtilizationReport {
    period: BillingPeriod;
    toolUtilization: ToolUtilizationMetric[];
    projectUtilization: ProjectUtilizationMetric[];
    overallUtilization: number;
    recommendations: string[];
}
export interface ToolUtilizationMetric {
    toolID: string;
    toolName: string;
    hoursUsed: number;
    hoursAvailable: number;
    utilizationRate: number;
    revenue: number;
    costPerHour: number;
}
export interface ProjectUtilizationMetric {
    projectID: string;
    projectName: string;
    toolCount: number;
    totalCost: number;
    budgetVariance: number;
    efficiencyScore: number;
}
export interface FinancialReport {
    period: BillingPeriod;
    revenue: number;
    costs: number;
    profit: number;
    marginPercent: number;
    costBreakdown: {
        [component: string]: number;
    };
    projectedROI: number;
    paybackPeriod: number;
}
export interface ServiceReport {
    period: BillingPeriod;
    totalServiceEvents: number;
    serviceEventsByType: {
        [type: string]: number;
    };
    averageResolutionTime: number;
    slaCompliance: number;
    customerSatisfaction: number;
    serviceGapAnalysis: ServiceGapMetric[];
}
export interface ServiceGapMetric {
    eventType: ServiceEventType;
    promisedTime: number;
    actualTime: number;
    variance: number;
    frequency: number;
    impact: 'low' | 'medium' | 'high';
}
export interface RiskReport {
    period: BillingPeriod;
    overallRiskScore: number;
    riskFactors: RiskFactor[];
    mitigationEffectiveness: number;
    financialExposure: number;
    insuranceClaims: number;
    predictedIssues: PredictedIssue[];
}
export interface RiskFactor {
    category: 'equipment' | 'service' | 'financial' | 'operational';
    description: string;
    probability: number;
    impact: number;
    mitigation: string;
    status: 'identified' | 'mitigating' | 'resolved';
}
export interface PredictedIssue {
    toolID: string;
    toolName: string;
    issueType: 'failure' | 'maintenance_due' | 'replacement_needed';
    probability: number;
    predictedDate: Date;
    estimatedCost: number;
    recommendedAction: string;
}
export interface FleetManagementDatabase {
    addTool(tool: Tool): Promise<void>;
    updateTool(toolID: string, updates: Partial<Tool>): Promise<void>;
    getToolById(toolID: string): Promise<Tool | null>;
    getToolsByProject(projectID: string): Promise<Tool[]>;
    getToolsByStatus(status: ToolStatus): Promise<Tool[]>;
    addProject(project: Project): Promise<void>;
    updateProject(projectID: string, updates: Partial<Project>): Promise<void>;
    getProjectById(projectID: string): Promise<Project | null>;
    getActiveProjects(): Promise<Project[]>;
    createServiceEvent(event: ServiceEvent): Promise<string>;
    updateServiceEvent(eventID: string, updates: Partial<ServiceEvent>): Promise<void>;
    getServiceEventsByTool(toolID: string): Promise<ServiceEvent[]>;
    getActiveServiceEvents(): Promise<ServiceEvent[]>;
    saveCostModel(model: CostModel): Promise<void>;
    getCostModelsByProject(projectID: string): Promise<CostModel[]>;
    generateUtilizationReport(period: BillingPeriod): Promise<UtilizationReport>;
    generateFinancialReport(period: BillingPeriod): Promise<FinancialReport>;
    generateServiceReport(period: BillingPeriod): Promise<ServiceReport>;
    generateRiskReport(period: BillingPeriod): Promise<RiskReport>;
}
export declare const FLEET_QUERIES: {
    TOOLS_DUE_FOR_SERVICE: string;
    PROJECT_PROFITABILITY: string;
    SERVICE_PERFORMANCE_BY_CATEGORY: string;
    HIGH_RISK_TOOLS: string;
};
export declare const formatToolStatus: (status: ToolStatus) => string;
export declare const calculateToolUtilization: (tool: Tool, totalAvailableHours: number) => number;
export declare const getServiceSLAStatus: (event: ServiceEvent) => "on_time" | "delayed" | "critical";
