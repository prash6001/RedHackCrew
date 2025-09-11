// 6-step repair tracking system from Hilti Online portal
export const REPAIR_WORKFLOW_STEPS = [
    {
        step: 1,
        status: 'order_received',
        description: 'Order received',
        estimatedDuration: '1-2 hours',
        customerAction: 'Wait for pickup confirmation'
    },
    {
        step: 2,
        status: 'tool_pickup',
        description: 'Tool is picked up',
        estimatedDuration: '1-2 business days',
        customerAction: 'Package tool with provided shipping label'
    },
    {
        step: 3,
        status: 'arrived_service_center',
        description: 'Arrived in the Tool Service Center',
        estimatedDuration: '1 business day',
        customerAction: 'None - Hilti processing'
    },
    {
        step: 4,
        status: 'tool_in_service',
        description: 'Tool in service',
        estimatedDuration: '1-3 business days',
        customerAction: 'Loaner tool available if requested'
    },
    {
        step: 5,
        status: 'service_completed_shipping',
        description: 'Tool service completed and shipping',
        estimatedDuration: '1-2 business days',
        customerAction: 'Track return shipment'
    },
    {
        step: 6,
        status: 'tool_returned',
        description: 'Tool returned',
        estimatedDuration: 'Same day',
        customerAction: 'Resume normal operations'
    }
];
// Service gap probabilities from Section 1.2 - real world vs promised SLA
export const SERVICE_GAP_ANALYSIS = {
    normalService: {
        probability: 0.70, // 70% probability of normal service
        durationMultiplier: 1.0,
        description: 'Service completed within promised timeframe'
    },
    minorDelay: {
        probability: 0.20, // 20% probability of minor delay
        durationMultiplier: 2.5,
        description: 'Minor delays due to parts availability or logistics'
    },
    criticalFailure: {
        probability: 0.10, // 10% probability of critical service failure
        durationMultiplier: 8.0,
        description: 'Extended delays, tool lost in system, or incomplete repairs'
    }
};
// Standard Hilti Fleet Management service package
export const HILTI_FLEET_SERVICES = {
    repairServices: {
        unlimitedCoverage: true,
        expeditedRepairs: true,
        loanerTools: true,
        proactiveMaintenance: true,
        calibrationServices: true
    },
    theftProtection: {
        coveragePercentage: 80,
        policeReportRequired: true,
        immediateReplacement: true,
        geographicRestrictions: []
    },
    supportServices: {
        technicalSupport24x7: true,
        onSiteAnalysis: true,
        safetyTraining: true,
        performanceReporting: true,
        dedicatedAccountManager: true
    },
    flexibilityOptions: {
        toolsOnDemand: true,
        contractAdjustments: true,
        seasonalScaling: true,
        earlyTermination: false
    }
};
// Service exclusions from Section 1.2
export const SERVICE_EXCLUSIONS = {
    deckingTools: {
        models: ['DX 860', 'DX 9', 'DX 76'],
        excludedParts: ['pistons', 'buffers', 'stop rings']
    },
    vacuumSystems: {
        excludedParts: ['filters']
    }
};
export const simulateServiceReliability = (tools, projectDurationMonths) => {
    const scenarios = [];
    let totalWeightedDowntime = 0;
    let worstCase = 0;
    tools.forEach(tool => {
        const baseRepairDays = tool.riskFactors.expectedRepairDays;
        // Normal service scenario
        const normalDays = baseRepairDays * SERVICE_GAP_ANALYSIS.normalService.durationMultiplier;
        scenarios.push({
            probability: SERVICE_GAP_ANALYSIS.normalService.probability,
            downtimeDays: normalDays,
            cost: 0, // Covered under Fleet contract
            description: `${tool.name}: Normal repair turnaround`
        });
        // Minor delay scenario
        const delayDays = baseRepairDays * SERVICE_GAP_ANALYSIS.minorDelay.durationMultiplier;
        scenarios.push({
            probability: SERVICE_GAP_ANALYSIS.minorDelay.probability,
            downtimeDays: delayDays,
            cost: 0,
            description: `${tool.name}: Minor service delays`
        });
        // Critical failure scenario
        const criticalDays = baseRepairDays * SERVICE_GAP_ANALYSIS.criticalFailure.durationMultiplier;
        scenarios.push({
            probability: SERVICE_GAP_ANALYSIS.criticalFailure.probability,
            downtimeDays: criticalDays,
            cost: tool.monthlyCost * Math.ceil(criticalDays / 30), // Cost of extended downtime
            description: `${tool.name}: Critical service failure`
        });
        // Calculate weighted average
        totalWeightedDowntime +=
            (normalDays * SERVICE_GAP_ANALYSIS.normalService.probability) +
                (delayDays * SERVICE_GAP_ANALYSIS.minorDelay.probability) +
                (criticalDays * SERVICE_GAP_ANALYSIS.criticalFailure.probability);
        worstCase = Math.max(worstCase, criticalDays);
    });
    const averageDowntime = totalWeightedDowntime / tools.length;
    const reliabilityScore = Math.max(0, 100 - (averageDowntime / 30) * 10); // 10 points per month of downtime
    return {
        scenarios,
        averageDowntime,
        worstCaseDowntime: worstCase,
        reliabilityScore
    };
};
export const evaluateToolsOnDemand = (tool, projectDurationMonths, peakSeasonMonths = 0, specialtyWorkMonths = 0) => {
    if (!tool.todEligible)
        return null;
    // Calculate break-even point (typically ToD is more expensive per month)
    const todPremiumMultiplier = 1.25; // 25% premium for short-term rentals
    const todMonthlyCost = tool.monthlyCost * todPremiumMultiplier;
    // Determine recommendation scenario
    let scenario;
    let recommendedDuration;
    let justification;
    if (peakSeasonMonths > 0 && peakSeasonMonths < projectDurationMonths * 0.6) {
        scenario = 'peak_season';
        recommendedDuration = peakSeasonMonths;
        justification = `Use ToD for ${peakSeasonMonths}-month peak season instead of full ${projectDurationMonths}-month Fleet contract`;
    }
    else if (specialtyWorkMonths > 0 && specialtyWorkMonths < projectDurationMonths * 0.4) {
        scenario = 'specialty_project';
        recommendedDuration = specialtyWorkMonths;
        justification = `Specialized tool only needed for ${specialtyWorkMonths} months of specialty work`;
    }
    else {
        scenario = 'backup_equipment';
        recommendedDuration = Math.min(3, projectDurationMonths); // Maximum 3 months for backup
        justification = `Keep as backup equipment for critical path protection`;
    }
    const todTotalCost = todMonthlyCost * recommendedDuration;
    const fleetTotalCost = tool.monthlyCost * projectDurationMonths;
    const savings = fleetTotalCost - todTotalCost;
    // Only recommend if savings > 20%
    if (savings > fleetTotalCost * 0.2) {
        return {
            toolName: tool.name,
            scenario,
            durationMonths: recommendedDuration,
            costComparison: {
                todMonthlyCost,
                fleetMonthlyCost: tool.monthlyCost,
                savings
            },
            justification
        };
    }
    return null;
};
// Service event tracking system
export class ServiceEventTracker {
    events = [];
    createServiceEvent(toolId, eventType, promisedCompletionDays = 3) {
        const event = {
            eventId: `SE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            toolId,
            eventType,
            startDate: new Date(),
            promisedEndDate: new Date(Date.now() + promisedCompletionDays * 24 * 60 * 60 * 1000),
            status: 'initiated',
            statusDetail: 'Service request initiated',
        };
        this.events.push(event);
        return event;
    }
    updateServiceEvent(eventId, status, notes) {
        const event = this.events.find(e => e.eventId === eventId);
        if (event) {
            event.status = status;
            event.statusDetail = this.getStatusDescription(status);
            if (notes)
                event.notes = notes;
            if (status === 'returned') {
                event.actualEndDate = new Date();
            }
        }
    }
    getStatusDescription(status) {
        const statusMap = {
            'initiated': 'Service request initiated',
            'pickup_scheduled': 'Pickup scheduled with courier',
            'in_transit': 'Tool in transit to service center',
            'at_service_center': 'Tool received at service center',
            'in_service': 'Tool being serviced',
            'completed': 'Service completed, preparing for return',
            'returned': 'Tool returned to customer'
        };
        return statusMap[status] || 'Status updated';
    }
    getServiceMetrics() {
        const completedEvents = this.events.filter(e => e.actualEndDate);
        let totalResolutionTime = 0;
        let onTimeCount = 0;
        completedEvents.forEach(event => {
            const resolutionTime = event.actualEndDate.getTime() - event.startDate.getTime();
            totalResolutionTime += resolutionTime;
            if (event.actualEndDate <= event.promisedEndDate) {
                onTimeCount++;
            }
        });
        return {
            averageResolutionTime: completedEvents.length > 0 ?
                totalResolutionTime / completedEvents.length / (24 * 60 * 60 * 1000) : 0,
            onTimePerformance: completedEvents.length > 0 ?
                (onTimeCount / completedEvents.length) * 100 : 100,
            activeEvents: this.events.filter(e => !e.actualEndDate).length
        };
    }
}
// Enhanced tool recommendations with service features
export const enhanceToolWithServiceFeatures = (tool, projectComplexity) => {
    // Determine service risk factors based on tool category and project complexity
    const getRiskFactors = (category, complexity) => {
        const baseRisk = {
            'drilling': { probability: 0.15, days: 3, critical: true },
            'cutting': { probability: 0.20, days: 4, critical: true },
            'measuring': { probability: 0.10, days: 2, critical: false },
            'fastening': { probability: 0.12, days: 3, critical: false },
            'safety': { probability: 0.08, days: 2, critical: false },
            'demolition': { probability: 0.18, days: 5, critical: true }
        };
        const risk = baseRisk[category.toLowerCase()] || baseRisk['drilling'];
        const complexityMultiplier = complexity === 'high' ? 1.3 : complexity === 'medium' ? 1.1 : 1.0;
        return {
            repairDowntimeProbability: risk.probability * complexityMultiplier,
            expectedRepairDays: Math.ceil(risk.days * complexityMultiplier),
            criticalPathImpact: risk.critical
        };
    };
    return {
        ...tool,
        serviceFeatures: {
            repairCoverage: true,
            theftCoverage: 80,
            loanerTools: true,
            onSiteMaintenance: ['measuring', 'layout'].includes(tool.category.toLowerCase()),
            trainingIncluded: true
        },
        todEligible: !['safety', 'measuring'].includes(tool.category.toLowerCase()), // Safety and precision tools less suitable for short-term
        riskFactors: getRiskFactors(tool.category, projectComplexity)
    };
};
//# sourceMappingURL=fleetServiceModeling.js.map