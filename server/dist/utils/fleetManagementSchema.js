// Comprehensive Fleet Management Data Schema based on Section 4.3
// This schema enables comprehensive tracking of assets, service events, costs, and project relationships
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
export const formatToolStatus = (status) => {
    return status.replace(/_/g, ' ');
};
export const calculateToolUtilization = (tool, totalAvailableHours) => {
    return tool.utilizationHours ? (tool.utilizationHours / totalAvailableHours) * 100 : 0;
};
export const getServiceSLAStatus = (event) => {
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
//# sourceMappingURL=fleetManagementSchema.js.map