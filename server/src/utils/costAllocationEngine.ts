import { 
  Invoice, 
  InvoiceLineItem, 
  BillingPeriod, 
  Tool, 
  Project,
  InvoiceStatus 
} from './fleetManagementSchema';

// Cost Allocation Engine based on Section 2.3 - Invoicing Architecture
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
  costRange?: { min: number; max: number };
  utilizationThreshold?: number;
}

export interface SplitMethod {
  type: 'equal' | 'weighted' | 'usage_based' | 'time_based';
  weights?: { [key: string]: number };
  basedOnField?: 'labor_count' | 'project_value' | 'utilization_hours';
}

// Multi-project cost allocation engine
export class CostAllocationEngine {
  private config: CostAllocationConfig;
  private allocationRules: AllocationRule[];
  
  constructor(config: CostAllocationConfig) {
    this.config = config;
    this.allocationRules = [];
  }
  
  // Generate invoices with flexible cost allocation
  generateInvoices(
    tools: Tool[],
    projects: Project[],
    costCenters: CostCenter[],
    crews: CrewAssignment[],
    billingPeriod: BillingPeriod
  ): Invoice[] {
    const invoices: Invoice[] = [];
    
    switch (this.config.allocationMethod) {
      case 'project':
        invoices.push(...this.generateProjectBasedInvoices(tools, projects, billingPeriod));
        break;
      case 'cost_center':
        invoices.push(...this.generateCostCenterInvoices(tools, costCenters, billingPeriod));
        break;
      case 'crew':
        invoices.push(...this.generateCrewBasedInvoices(tools, crews, billingPeriod));
        break;
      case 'mixed':
        invoices.push(...this.generateMixedAllocationInvoices(tools, projects, costCenters, crews, billingPeriod));
        break;
    }
    
    return invoices.map(invoice => this.applyTaxesAndFormatting(invoice));
  }
  
  private generateProjectBasedInvoices(
    tools: Tool[],
    projects: Project[],
    billingPeriod: BillingPeriod
  ): Invoice[] {
    const invoices: Invoice[] = [];
    
    // Group tools by project
    const toolsByProject = this.groupToolsByProject(tools);
    
    Object.entries(toolsByProject).forEach(([projectID, projectTools]) => {
      const project = projects.find(p => p.projectID === projectID);
      if (!project) return;
      
      const lineItems = this.createLineItems(projectTools, billingPeriod);
      const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
      
      const invoice: Invoice = {
        invoiceID: this.generateInvoiceID('PRJ', projectID, billingPeriod),
        projectID: projectID,
        billingPeriod,
        lineItems,
        subtotal,
        taxes: 0, // Will be calculated in applyTaxesAndFormatting
        total: subtotal,
        dueDate: this.calculateDueDate(billingPeriod.endDate),
        status: 'Draft'
      };
      
      invoices.push(invoice);
    });
    
    return invoices;
  }
  
  private generateCostCenterInvoices(
    tools: Tool[],
    costCenters: CostCenter[],
    billingPeriod: BillingPeriod
  ): Invoice[] {
    const invoices: Invoice[] = [];
    
    // Allocate tools to cost centers based on rules or project assignments
    const allocationMap = this.allocateToolsToCostCenters(tools, costCenters);
    
    Object.entries(allocationMap).forEach(([costCenterID, allocatedTools]) => {
      const costCenter = costCenters.find(cc => cc.costCenterID === costCenterID);
      if (!costCenter) return;
      
      const lineItems = this.createLineItems(allocatedTools, billingPeriod);
      const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
      
      const invoice: Invoice = {
        invoiceID: this.generateInvoiceID('CC', costCenterID, billingPeriod),
        costCenter: costCenterID,
        billingPeriod,
        lineItems,
        subtotal,
        taxes: 0,
        total: subtotal,
        dueDate: this.calculateDueDate(billingPeriod.endDate),
        status: 'Draft'
      };
      
      invoices.push(invoice);
    });
    
    return invoices;
  }
  
  private generateCrewBasedInvoices(
    tools: Tool[],
    crews: CrewAssignment[],
    billingPeriod: BillingPeriod
  ): Invoice[] {
    const invoices: Invoice[] = [];
    
    crews.forEach(crew => {
      const crewTools = tools.filter(tool => crew.tools.includes(tool.toolID));
      
      if (crewTools.length === 0) return;
      
      const lineItems = this.createLineItems(crewTools, billingPeriod);
      const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
      
      const invoice: Invoice = {
        invoiceID: this.generateInvoiceID('CREW', crew.crewID, billingPeriod),
        crew: crew.crewID,
        billingPeriod,
        lineItems,
        subtotal,
        taxes: 0,
        total: subtotal,
        dueDate: this.calculateDueDate(billingPeriod.endDate),
        status: 'Draft'
      };
      
      invoices.push(invoice);
    });
    
    return invoices;
  }
  
  private generateMixedAllocationInvoices(
    tools: Tool[],
    projects: Project[],
    costCenters: CostCenter[],
    crews: CrewAssignment[],
    billingPeriod: BillingPeriod
  ): Invoice[] {
    const invoices: Invoice[] = [];
    
    // Apply allocation rules to determine how to split costs
    const allocations = this.applyAllocationRules(tools, projects, costCenters, crews);
    
    // Generate invoices based on allocation results
    allocations.forEach(allocation => {
      const lineItems = this.createLineItems(allocation.tools, billingPeriod, allocation.splitFactor);
      const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
      
      const invoice: Invoice = {
        invoiceID: this.generateInvoiceID('MIX', allocation.entityID, billingPeriod),
        projectID: allocation.type === 'project' ? allocation.entityID : undefined,
        costCenter: allocation.type === 'cost_center' ? allocation.entityID : undefined,
        crew: allocation.type === 'crew' ? allocation.entityID : undefined,
        billingPeriod,
        lineItems,
        subtotal,
        taxes: 0,
        total: subtotal,
        dueDate: this.calculateDueDate(billingPeriod.endDate),
        status: 'Draft'
      };
      
      invoices.push(invoice);
    });
    
    return invoices;
  }
  
  private groupToolsByProject(tools: Tool[]): { [projectID: string]: Tool[] } {
    const grouped: { [projectID: string]: Tool[] } = {};
    
    tools.forEach(tool => {
      if (tool.assignedProjectID) {
        if (!grouped[tool.assignedProjectID]) {
          grouped[tool.assignedProjectID] = [];
        }
        grouped[tool.assignedProjectID].push(tool);
      }
    });
    
    return grouped;
  }
  
  private allocateToolsToCostCenters(tools: Tool[], costCenters: CostCenter[]): { [costCenterID: string]: Tool[] } {
    const allocation: { [costCenterID: string]: Tool[] } = {};
    
    // Initialize allocation for each cost center
    costCenters.forEach(cc => {
      allocation[cc.costCenterID] = [];
    });
    
    // Simple allocation based on tool category and cost center department
    tools.forEach(tool => {
      const suitableCostCenter = this.findSuitableCostCenter(tool, costCenters);
      if (suitableCostCenter) {
        allocation[suitableCostCenter.costCenterID].push(tool);
      }
    });
    
    return allocation;
  }
  
  private findSuitableCostCenter(tool: Tool, costCenters: CostCenter[]): CostCenter | null {
    // Logic to match tools to appropriate cost centers
    // This could be enhanced with more sophisticated rules
    
    const categoryToCodeMap: { [category: string]: string } = {
      'Safety': 'SAFETY',
      'Drilling': 'CONSTRUCTION',
      'Cutting': 'CONSTRUCTION',
      'Layout': 'ENGINEERING',
      'Measuring': 'ENGINEERING'
    };
    
    const targetCode = categoryToCodeMap[tool.category] || 'GENERAL';
    
    return costCenters.find(cc => cc.accountingCode.includes(targetCode)) || costCenters[0];
  }
  
  private createLineItems(tools: Tool[], billingPeriod: BillingPeriod, splitFactor: number = 1): InvoiceLineItem[] {
    return tools.map(tool => {
      const daysInPeriod = this.calculateDaysInPeriod(billingPeriod);
      const monthlyRate = tool.monthlyRate * splitFactor;
      const dailyRate = monthlyRate / 30; // Approximate daily rate
      const lineTotal = dailyRate * daysInPeriod;
      
      return {
        toolID: tool.toolID,
        toolName: tool.toolName,
        quantity: 1,
        monthlyRate,
        daysUsed: daysInPeriod,
        lineTotal,
        description: this.generateLineItemDescription(tool, billingPeriod)
      };
    });
  }
  
  private calculateDaysInPeriod(period: BillingPeriod): number {
    const diffTime = period.endDate.getTime() - period.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  private generateLineItemDescription(tool: Tool, period: BillingPeriod): string {
    return `${tool.toolName} rental for ${period.startDate.toLocaleDateString()} - ${period.endDate.toLocaleDateString()}`;
  }
  
  private applyTaxesAndFormatting(invoice: Invoice): Invoice {
    if (this.config.includeTaxes) {
      invoice.taxes = invoice.subtotal * this.config.taxRate;
      invoice.total = invoice.subtotal + invoice.taxes;
    }
    
    return invoice;
  }
  
  private generateInvoiceID(prefix: string, entityID: string, period: BillingPeriod): string {
    const dateStr = `${period.year}${String(period.month).padStart(2, '0')}`;
    const randomSuffix = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${prefix}-${entityID}-${dateStr}-${randomSuffix}`;
  }
  
  private calculateDueDate(endDate: Date): Date {
    const dueDate = new Date(endDate);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms
    return dueDate;
  }
  
  private applyAllocationRules(
    tools: Tool[],
    projects: Project[],
    costCenters: CostCenter[],
    crews: CrewAssignment[]
  ): AllocationResult[] {
    // This is a simplified implementation
    // In practice, this would apply complex allocation rules
    const results: AllocationResult[] = [];
    
    // Example: Split high-value tools across multiple cost centers
    tools.forEach(tool => {
      if (tool.monthlyRate > 1000) {
        // Split expensive tools 60/40 between construction and engineering
        results.push({
          type: 'cost_center',
          entityID: 'CONSTRUCTION',
          tools: [tool],
          splitFactor: 0.6
        });
        results.push({
          type: 'cost_center', 
          entityID: 'ENGINEERING',
          tools: [tool],
          splitFactor: 0.4
        });
      } else {
        // Assign to project directly
        results.push({
          type: 'project',
          entityID: tool.assignedProjectID || 'GENERAL',
          tools: [tool],
          splitFactor: 1.0
        });
      }
    });
    
    return results;
  }
  
  // Add allocation rules
  addAllocationRule(rule: AllocationRule): void {
    this.allocationRules.push(rule);
  }
  
  // Remove allocation rule
  removeAllocationRule(ruleID: string): void {
    this.allocationRules = this.allocationRules.filter(rule => rule.ruleID !== ruleID);
  }
  
  // Update invoice status
  updateInvoiceStatus(invoiceID: string, status: InvoiceStatus, paidDate?: Date): void {
    // This would update the invoice in the database
    // Invoice status updated
  }
}

interface AllocationResult {
  type: 'project' | 'cost_center' | 'crew';
  entityID: string;
  tools: Tool[];
  splitFactor: number;
}

// Invoice reporting and analytics
export class InvoiceReportingEngine {
  
  static generateInvoiceSummary(invoices: Invoice[]): InvoiceSummary {
    const summary: InvoiceSummary = {
      totalInvoices: invoices.length,
      totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
      averageInvoiceValue: 0,
      statusBreakdown: {},
      paymentMetrics: {
        onTimePayments: 0,
        overdueAmount: 0,
        averageDaysToPayment: 0
      }
    };
    
    summary.averageInvoiceValue = summary.totalRevenue / summary.totalInvoices;
    
    // Calculate status breakdown
    invoices.forEach(invoice => {
      summary.statusBreakdown[invoice.status] = (summary.statusBreakdown[invoice.status] || 0) + 1;
    });
    
    // Calculate payment metrics
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid' && inv.paidDate);
    summary.paymentMetrics.onTimePayments = paidInvoices.filter(inv => 
      inv.paidDate! <= inv.dueDate
    ).length;
    
    summary.paymentMetrics.overdueAmount = invoices
      .filter(inv => inv.status === 'Overdue')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    if (paidInvoices.length > 0) {
      const totalPaymentDays = paidInvoices.reduce((sum, inv) => {
        const daysToPay = Math.floor((inv.paidDate!.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + Math.max(0, daysToPay);
      }, 0);
      summary.paymentMetrics.averageDaysToPayment = totalPaymentDays / paidInvoices.length;
    }
    
    return summary;
  }
  
  static generateCostCenterReport(invoices: Invoice[]): CostCenterReport[] {
    const costCenterMap: { [costCenter: string]: CostCenterReport } = {};
    
    invoices.forEach(invoice => {
      const costCenter = invoice.costCenter || 'Unassigned';
      
      if (!costCenterMap[costCenter]) {
        costCenterMap[costCenter] = {
          costCenterID: costCenter,
          totalCost: 0,
          invoiceCount: 0,
          averageCost: 0,
          toolCategories: {},
          utilizationMetrics: {
            totalHours: 0,
            costPerHour: 0,
            efficiency: 0
          }
        };
      }
      
      const report = costCenterMap[costCenter];
      report.totalCost += invoice.total;
      report.invoiceCount++;
      
      // Analyze tool categories
      invoice.lineItems.forEach(item => {
        // This would need tool category lookup
        const category = 'General'; // Placeholder
        report.toolCategories[category] = (report.toolCategories[category] || 0) + item.lineTotal;
      });
    });
    
    // Calculate averages
    Object.values(costCenterMap).forEach(report => {
      report.averageCost = report.totalCost / report.invoiceCount;
    });
    
    return Object.values(costCenterMap);
  }
}

interface InvoiceSummary {
  totalInvoices: number;
  totalRevenue: number;
  averageInvoiceValue: number;
  statusBreakdown: { [status: string]: number };
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
  toolCategories: { [category: string]: number };
  utilizationMetrics: {
    totalHours: number;
    costPerHour: number;
    efficiency: number;
  };
}

// Export formatting utilities
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatInvoiceStatus = (status: InvoiceStatus): string => {
  const statusMap: { [key in InvoiceStatus]: string } = {
    'Draft': '📝 Draft',
    'Sent': '📤 Sent',
    'Paid': '✅ Paid',
    'Overdue': '⚠️ Overdue',
    'Disputed': '⚡ Disputed',
    'Cancelled': '❌ Cancelled'
  };
  return statusMap[status];
};

export const calculateProjectProfitability = (
  project: Project,
  associatedInvoices: Invoice[]
): ProjectProfitability => {
  const totalInvoiced = associatedInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const profit = project.contractValue - totalInvoiced;
  const margin = (profit / project.contractValue) * 100;
  
  return {
    projectID: project.projectID,
    projectName: project.projectName,
    contractValue: project.contractValue,
    toolCosts: totalInvoiced,
    profit,
    marginPercent: margin,
    roi: (profit / totalInvoiced) * 100
  };
};

interface ProjectProfitability {
  projectID: string;
  projectName: string;
  contractValue: number;
  toolCosts: number;
  profit: number;
  marginPercent: number;
  roi: number;
}