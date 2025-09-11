// Comprehensive Fleet Management Data Schema based on Section 4.3
// This schema enables comprehensive tracking of assets, service events, costs, and project relationships

export interface FleetManagementDatabase {
  tools: Tool[];
  projects: Project[];
  serviceEvents: ServiceEvent[];
  costModels: CostModel[];
  toolKits: ToolKit[];
  invoicing: Invoice[];
  contracts: FleetContract[];
}

// Tools table - tracks individual tool instances
export interface Tool {
  toolID: string; // Unique identifier for each tool instance (e.g., "11234")
  hiltiItemNumber: string; // Manufacturer's product number (e.g., "2246798")
  toolName: string; // Common name (e.g., "Cordl. impact driver SID 6-22")
  category: ToolCategory; // Functional category
  status: ToolStatus; // Current operational status
  assignedProjectID?: string; // Foreign Key to Projects.ProjectID
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

export type ToolCategory = 
  | 'Drilling' 
  | 'Cutting' 
  | 'Fastening' 
  | 'Layout' 
  | 'Measuring' 
  | 'Safety' 
  | 'Demolition'
  | 'Fabrication'
  | 'Access Equipment'
  | 'Material Handling';

export type ToolStatus = 
  | 'Active' 
  | 'In_Repair' 
  | 'Stolen' 
  | 'Out_of_Service'
  | 'In_Transit'
  | 'Available'
  | 'Reserved'
  | 'End_of_Life';

// Projects table - tracks construction projects
export interface Project {
  projectID: string; // Unique identifier (e.g., "501")
  projectName: string; // Name of the project (e.g., "Downtown Office Tower")
  projectType: ProjectType; // Archetype classification
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

export type ProjectType = 
  | 'Residential' 
  | 'Commercial' 
  | 'Industrial' 
  | 'Infrastructure'
  | 'Renovation'
  | 'Roadwork';

export type ProjectComplexity = 'low' | 'medium' | 'high';

export type ProjectStatus = 
  | 'Planning' 
  | 'Active' 
  | 'On_Hold' 
  | 'Completed' 
  | 'Cancelled';

// Service_Events table - tracks all service interactions (Section 1.3 - 6-step process)
export interface ServiceEvent {
  eventID: string; // Unique identifier (e.g., "9087")
  toolID: string; // Foreign Key to Tools.ToolID
  eventType: ServiceEventType;
  startDate: Date;
  promisedEndDate: Date; // SLA-based expected completion
  actualEndDate?: Date; // Actual completion date
  statusDetail: ServiceStatusDetail; // Current step in 6-step process
  customerNotes?: string;
  technicianNotes?: string;
  cost: number; // Any additional costs beyond contract
  partsUsed?: string[];
  laborHours?: number;
  serviceCenter: string;
  priority: ServicePriority;
  customerSatisfaction?: number; // 1-5 rating
}

export type ServiceEventType = 
  | 'Repair' 
  | 'Theft' 
  | 'Maintenance' 
  | 'Calibration'
  | 'Warranty'
  | 'Training'
  | 'Inspection';

export type ServiceStatusDetail = 
  | 'Order_Received'           // Step 1
  | 'Tool_Pickup'             // Step 2
  | 'Arrived_Service_Center'  // Step 3
  | 'Tool_In_Service'         // Step 4
  | 'Service_Completed_Shipping' // Step 5
  | 'Tool_Returned';          // Step 6

export type ServicePriority = 'low' | 'normal' | 'high' | 'urgent';

// Cost_Models table - stores TCO and financial analyses
export interface CostModel {
  modelID: string; // Unique identifier (e.g., "45")
  toolKitID?: string; // Foreign Key to Tool_Kits table
  projectID?: string; // Foreign Key to Projects table
  modelType: CostModelType;
  costComponent: CostComponent;
  value: number; // Calculated monetary value
  calculationDate: Date;
  assumptions: string; // JSON string of model assumptions
  validityPeriod: number; // Days the model is valid
}

export type CostModelType = 
  | 'TCO' 
  | 'Lease' 
  | 'Purchase_vs_Lease'
  | 'Risk_Assessment'
  | 'ROI_Analysis';

export type CostComponent = 
  | 'Upfront_Capital'
  | 'Monthly_Payment'
  | 'Maintenance'
  | 'Insurance'
  | 'Training'
  | 'Administrative'
  | 'Depreciation'
  | 'Opportunity_Cost'
  | 'Risk_Premium';

// Tool_Kits table - groups tools for analysis
export interface ToolKit {
  toolKitID: string; // Identifier for tool groupings (e.g., "12")
  kitName: string; // Descriptive name (e.g., "Glazing Crew Kit")
  description: string;
  projectArchetype: ProjectType;
  toolIDs: string[]; // Array of Tool IDs in this kit
  totalMonthlyRate: number;
  totalAssetValue: number;
  recommendedCrewSize: number;
  lastUpdated: Date;
}

// Invoicing and cost allocation (Section 2.3)
export interface Invoice {
  invoiceID: string;
  projectID?: string; // Can allocate to specific projects
  costCenter?: string; // Or to cost centers
  crew?: string; // Or to specific crews
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

export type InvoiceStatus = 
  | 'Draft' 
  | 'Sent' 
  | 'Paid' 
  | 'Overdue' 
  | 'Disputed'
  | 'Cancelled';

// Fleet Contracts - comprehensive contract tracking
export interface FleetContract {
  contractID: string;
  projectID: string;
  contractType: ContractType;
  startDate: Date;
  endDate: Date;
  totalContractValue: number;
  monthlyPayment: number;
  toolsIncluded: string[]; // Array of Tool IDs
  serviceLevel: ServiceLevel;
  terms: ContractTerm[];
  status: ContractStatus;
  renewalOptions: RenewalOption[];
  performanceMetrics: ContractMetrics;
}

export type ContractType = 
  | 'Standard_Fleet' 
  | 'Premium_Fleet' 
  | 'Hybrid_Fleet_ToD'
  | 'Tools_on_Demand_Only'
  | 'Custom';

export type ServiceLevel = {
  repairSLA: number; // Hours for repair turnaround
  replacementSLA: number; // Hours for tool replacement
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

export type ContractStatus = 
  | 'Draft' 
  | 'Active' 
  | 'Suspended' 
  | 'Expired'
  | 'Terminated'
  | 'Under_Review';

export interface RenewalOption {
  optionType: 'Auto_Renew' | 'Manual_Renew' | 'Upgrade' | 'Terminate';
  noticePeriodDays: number;
  newTermMonths?: number;
  adjustmentPercent?: number;
}

export interface ContractMetrics {
  uptimePercentage: number;
  serviceCallsCount: number;
  averageRepairTime: number; // Hours
  customerSatisfactionScore: number; // 1-5
  costPerUtilizationHour: number;
  toolsReplacedCount: number;
  theftClaims: number;
}

// Analytics and reporting interfaces
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
  overallUtilization: number; // Percentage
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
  costBreakdown: { [component: string]: number };
  projectedROI: number;
  paybackPeriod: number; // Months
}

export interface ServiceReport {
  period: BillingPeriod;
  totalServiceEvents: number;
  serviceEventsByType: { [type: string]: number };
  averageResolutionTime: number;
  slaCompliance: number; // Percentage
  customerSatisfaction: number;
  serviceGapAnalysis: ServiceGapMetric[];
}

export interface ServiceGapMetric {
  eventType: ServiceEventType;
  promisedTime: number; // Hours
  actualTime: number; // Hours
  variance: number; // Percentage
  frequency: number; // Count
  impact: 'low' | 'medium' | 'high';
}

export interface RiskReport {
  period: BillingPeriod;
  overallRiskScore: number; // 0-100
  riskFactors: RiskFactor[];
  mitigationEffectiveness: number;
  financialExposure: number;
  insuranceClaims: number;
  predictedIssues: PredictedIssue[];
}

export interface RiskFactor {
  category: 'equipment' | 'service' | 'financial' | 'operational';
  description: string;
  probability: number; // 0-1
  impact: number; // Dollar amount
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

// Database operations interface
export interface FleetManagementDatabase {
  // Tool operations
  addTool(tool: Tool): Promise<void>;
  updateTool(toolID: string, updates: Partial<Tool>): Promise<void>;
  getToolById(toolID: string): Promise<Tool | null>;
  getToolsByProject(projectID: string): Promise<Tool[]>;
  getToolsByStatus(status: ToolStatus): Promise<Tool[]>;
  
  // Project operations
  addProject(project: Project): Promise<void>;
  updateProject(projectID: string, updates: Partial<Project>): Promise<void>;
  getProjectById(projectID: string): Promise<Project | null>;
  getActiveProjects(): Promise<Project[]>;
  
  // Service event operations
  createServiceEvent(event: ServiceEvent): Promise<string>; // Returns eventID
  updateServiceEvent(eventID: string, updates: Partial<ServiceEvent>): Promise<void>;
  getServiceEventsByTool(toolID: string): Promise<ServiceEvent[]>;
  getActiveServiceEvents(): Promise<ServiceEvent[]>;
  
  // Cost model operations
  saveCostModel(model: CostModel): Promise<void>;
  getCostModelsByProject(projectID: string): Promise<CostModel[]>;
  
  // Analytics operations
  generateUtilizationReport(period: BillingPeriod): Promise<UtilizationReport>;
  generateFinancialReport(period: BillingPeriod): Promise<FinancialReport>;
  generateServiceReport(period: BillingPeriod): Promise<ServiceReport>;
  generateRiskReport(period: BillingPeriod): Promise<RiskReport>;
}

// Example queries for common operations
export const FLEET_QUERIES = {
  // Find tools needing service
  TOOLS_DUE_FOR_SERVICE: `
    SELECT toolID, toolName, nextServiceDate, utilizationHours
    FROM Tools 
    WHERE nextServiceDate <= CURRENT_DATE 
    OR (utilizationHours > 500 AND lastServiceDate < DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH))
  `,
  
  // Calculate project profitability
  PROJECT_PROFITABILITY: `
    SELECT p.projectID, p.projectName, 
           SUM(t.monthlyRate) as monthlyToolCost,
           p.contractValue,
           (p.contractValue - SUM(t.monthlyRate) * p.durationMonths) as profit
    FROM Projects p
    JOIN Tools t ON t.assignedProjectID = p.projectID
    GROUP BY p.projectID
  `,
  
  // Service performance by tool category
  SERVICE_PERFORMANCE_BY_CATEGORY: `
    SELECT t.category,
           AVG(DATEDIFF(se.actualEndDate, se.startDate)) as avgRepairDays,
           COUNT(*) as serviceCount,
           SUM(CASE WHEN se.actualEndDate <= se.promisedEndDate THEN 1 ELSE 0 END) / COUNT(*) as slaCompliance
    FROM ServiceEvents se
    JOIN Tools t ON se.toolID = t.toolID
    WHERE se.eventType = 'Repair' AND se.actualEndDate IS NOT NULL
    GROUP BY t.category
  `,
  
  // High-risk tools analysis
  HIGH_RISK_TOOLS: `
    SELECT t.toolID, t.toolName, t.category,
           COUNT(se.eventID) as serviceEventCount,
           AVG(se.cost) as avgServiceCost,
           (COUNT(se.eventID) * AVG(se.cost)) as riskScore
    FROM Tools t
    LEFT JOIN ServiceEvents se ON t.toolID = se.toolID
    GROUP BY t.toolID
    HAVING serviceEventCount > 3 OR avgServiceCost > 1000
    ORDER BY riskScore DESC
  `
};

// Export utility functions for schema operations
export const formatToolStatus = (status: ToolStatus): string => {
  return status.replace(/_/g, ' ');
};

export const calculateToolUtilization = (tool: Tool, totalAvailableHours: number): number => {
  return tool.utilizationHours ? (tool.utilizationHours / totalAvailableHours) * 100 : 0;
};

export const getServiceSLAStatus = (event: ServiceEvent): 'on_time' | 'delayed' | 'critical' => {
  if (!event.actualEndDate) {
    const now = new Date();
    if (now > event.promisedEndDate) {
      const delayDays = Math.floor((now.getTime() - event.promisedEndDate.getTime()) / (1000 * 60 * 60 * 24));
      return delayDays > 7 ? 'critical' : 'delayed';
    }
    return 'on_time';
  }
  
  return event.actualEndDate <= event.promisedEndDate ? 'on_time' : 'delayed';
};