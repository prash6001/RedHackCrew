import { Invoice, BillingPeriod, Tool, Project, InvoiceStatus } from './fleetManagementSchema';
export interface CostAllocationConfig {
    allocationMethod: 'project' | 'cost_center' | 'crew' | 'employee' | 'mixed';
    billingFrequency: 'weekly' | 'monthly' | 'quarterly';
    includeTaxes: boolean;
    taxRate: number;
    currency: 'USD' | 'CAD' | 'EUR' | 'GBP';
    detailLevel: 'summary' | 'detailed' | 'itemized';
}
export interface CostCenter {
    costCenterID: string;
    name: string;
    department: string;
    budgetAllocation: number;
    manager: string;
    accountingCode: string;
}
export interface CrewAssignment {
    crewID: string;
    crewName: string;
    foreman: string;
    laborCount: number;
    activeProjects: string[];
    tools: string[];
}
export interface AllocationRule {
    ruleID: string;
    ruleName: string;
    criteria: AllocationCriteria;
    splitMethod: SplitMethod;
    isActive: boolean;
    effectiveDate: Date;
    expirationDate?: Date;
}
export interface AllocationCriteria {
    toolCategories?: string[];
    projectTypes?: string[];
    costRange?: {
        min: number;
        max: number;
    };
    utilizationThreshold?: number;
}
export interface SplitMethod {
    type: 'equal' | 'weighted' | 'usage_based' | 'time_based';
    weights?: {
        [key: string]: number;
    };
    basedOnField?: 'labor_count' | 'project_value' | 'utilization_hours';
}
export declare class CostAllocationEngine {
    private config;
    private allocationRules;
    constructor(config: CostAllocationConfig);
    generateInvoices(tools: Tool[], projects: Project[], costCenters: CostCenter[], crews: CrewAssignment[], billingPeriod: BillingPeriod): Invoice[];
    private generateProjectBasedInvoices;
    private generateCostCenterInvoices;
    private generateCrewBasedInvoices;
    private generateMixedAllocationInvoices;
    private groupToolsByProject;
    private allocateToolsToCostCenters;
    private findSuitableCostCenter;
    private createLineItems;
    private calculateDaysInPeriod;
    private generateLineItemDescription;
    private applyTaxesAndFormatting;
    private generateInvoiceID;
    private calculateDueDate;
    private applyAllocationRules;
    addAllocationRule(rule: AllocationRule): void;
    removeAllocationRule(ruleID: string): void;
    updateInvoiceStatus(invoiceID: string, status: InvoiceStatus, paidDate?: Date): void;
}
export declare class InvoiceReportingEngine {
    static generateInvoiceSummary(invoices: Invoice[]): InvoiceSummary;
    static generateCostCenterReport(invoices: Invoice[]): CostCenterReport[];
}
interface InvoiceSummary {
    totalInvoices: number;
    totalRevenue: number;
    averageInvoiceValue: number;
    statusBreakdown: {
        [status: string]: number;
    };
    paymentMetrics: {
        onTimePayments: number;
        overdueAmount: number;
        averageDaysToPayment: number;
    };
}
interface CostCenterReport {
    costCenterID: string;
    totalCost: number;
    invoiceCount: number;
    averageCost: number;
    toolCategories: {
        [category: string]: number;
    };
    utilizationMetrics: {
        totalHours: number;
        costPerHour: number;
        efficiency: number;
    };
}
export declare const formatCurrency: (amount: number, currency?: string) => string;
export declare const formatInvoiceStatus: (status: InvoiceStatus) => string;
export declare const calculateProjectProfitability: (project: Project, associatedInvoices: Invoice[]) => ProjectProfitability;
interface ProjectProfitability {
    projectID: string;
    projectName: string;
    contractValue: number;
    toolCosts: number;
    profit: number;
    marginPercent: number;
    roi: number;
}
export {};
