// Simple function to enhance existing recommendations with new insights
export const enhanceRecommendations = (projectData, baseRecommendations) => {
    return baseRecommendations.map(tool => {
        // Add service advantages
        const serviceAdvantages = [
            'Unlimited repairs and maintenance included',
            '24/7 replacement guarantee if stolen or broken',
            'Latest technology updates throughout contract',
            'Professional training and support included'
        ];
        // Add risk mitigation insights
        const riskMitigation = [
            'Eliminates equipment downtime through loaner program',
            'Protects against theft with 80% coverage',
            'Prevents budget overruns with fixed monthly costs',
            'Ensures compliance with latest safety standards'
        ];
        // Determine ToD suitability based on tool category and project
        const getTodSuitability = () => {
            const category = tool.category.toLowerCase();
            // Tools excellent for ToD (temporary/seasonal use)
            if (['cutting', 'demolition', 'specialty'].some(cat => category.includes(cat))) {
                return 'excellent';
            }
            // Good for ToD (project-specific tools)
            if (['drilling', 'fastening'].some(cat => category.includes(cat))) {
                return 'good';
            }
            // Limited ToD suitability (precision tools)
            if (['measuring', 'layout'].some(cat => category.includes(cat))) {
                return 'limited';
            }
            // Not suitable for ToD (safety/continuous use)
            if (['safety', 'dust'].some(cat => category.includes(cat))) {
                return 'not_suitable';
            }
            return 'good'; // Default
        };
        // Determine archetype match
        const getArchetypeMatch = () => {
            // Simple logic based on project type and tool category
            const isCommercialOrIndustrial = ['commercial', 'industrial', 'infrastructure'].includes(projectData.projectType);
            const isPowerTool = ['drilling', 'cutting', 'fastening', 'demolition'].some(cat => tool.category.toLowerCase().includes(cat));
            if (isCommercialOrIndustrial && isPowerTool) {
                return 'essential';
            }
            else if (isPowerTool || tool.category.toLowerCase().includes('safety')) {
                return 'recommended';
            }
            else {
                return 'situational';
            }
        };
        return {
            ...tool,
            serviceAdvantages,
            riskMitigation,
            todSuitability: getTodSuitability(),
            archetypeMatch: getArchetypeMatch(),
            // Enhanced justification with Fleet Management benefits
            justification: [
                ...tool.justification,
                'Fleet Management eliminates maintenance headaches',
                'Guaranteed service within 24 hours',
                'Access to latest Hilti technology innovations'
            ]
        };
    });
};
// Quick insights generator that works with existing UI
export const generateQuickInsights = (projectData, recommendations) => {
    const totalCost = recommendations.reduce((sum, tool) => sum + tool.totalCost, 0);
    const monthlyTools = recommendations.reduce((sum, tool) => sum + tool.monthlyCost, 0);
    // Calculate key insights
    const insights = {
        // Financial insights
        totalFleetCost: totalCost,
        monthlyPayment: monthlyTools,
        estimatedSavings: Math.round(totalCost * 2.5), // Conservative estimate vs ownership
        paybackPeriod: Math.round(totalCost / (monthlyTools * 0.3)), // Months to break even
        // Operational insights
        toolCount: recommendations.length,
        criticalTools: recommendations.filter(tool => ['drilling', 'cutting', 'safety'].some(cat => tool.category.toLowerCase().includes(cat))).length,
        // Risk insights
        riskReduction: projectData.projectComplexity === 'high' ? 'Significant' :
            projectData.projectComplexity === 'medium' ? 'Moderate' : 'Standard',
        serviceGuarantee: '24-hour replacement guarantee',
        // Strategic recommendations
        keyRecommendations: [
            `${recommendations.length} tools recommended for ${projectData.projectType} project`,
            `${monthlyTools.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} monthly Fleet Management cost`,
            `Estimated ${Math.round(totalCost * 2.5).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} savings vs ownership`,
            `${projectData.projectComplexity} complexity project benefits from professional service guarantees`
        ]
    };
    return insights;
};
// Tools on Demand analysis (simplified)
export const analyzeToolsOnDemand = (recommendations, projectData) => {
    const todCandidates = recommendations.filter(tool => {
        const category = tool.category.toLowerCase();
        return ['cutting', 'demolition', 'specialty'].some(cat => category.includes(cat)) &&
            tool.rentalDuration < projectData.timeline * 0.6; // Less than 60% of project duration
    });
    const potentialSavings = todCandidates.reduce((sum, tool) => {
        // Assume 25% savings using ToD for appropriate tools
        return sum + (tool.totalCost * 0.25);
    }, 0);
    return {
        candidates: todCandidates,
        potentialSavings,
        recommendation: potentialSavings > 5000 ?
            'Strong candidate for hybrid Fleet + ToD strategy' :
            'Full Fleet Management recommended for this project'
    };
};
// Simple risk assessment
export const assessProjectRisks = (projectData, recommendations) => {
    const risks = [];
    // Project complexity risks
    if (projectData.projectComplexity === 'high') {
        risks.push('High project complexity increases equipment reliability requirements');
    }
    // Timeline risks
    if (projectData.timeline > 18) {
        risks.push('Extended project timeline benefits from Fleet Management service guarantees');
    }
    // Team size risks
    if (projectData.laborCount > 25) {
        risks.push('Large team size requires consistent equipment availability');
    }
    // Budget risks
    const toolCosts = recommendations.reduce((sum, tool) => sum + tool.totalCost, 0);
    if (toolCosts > projectData.budget * 0.15) {
        risks.push('High equipment costs relative to budget - Fleet Management provides cost predictability');
    }
    return {
        riskLevel: risks.length > 2 ? 'High' : risks.length > 0 ? 'Medium' : 'Low',
        riskFactors: risks,
        mitigation: 'Hilti Fleet Management provides comprehensive risk mitigation through service guarantees, theft coverage, and predictable costs'
    };
};
// Export a simple API for the existing UI to use
export const getEnhancedAnalysis = (projectData, baseRecommendations) => {
    return {
        enhancedTools: enhanceRecommendations(projectData, baseRecommendations),
        insights: generateQuickInsights(projectData, baseRecommendations),
        todAnalysis: analyzeToolsOnDemand(baseRecommendations, projectData),
        riskAssessment: assessProjectRisks(projectData, baseRecommendations)
    };
};
//# sourceMappingURL=enhancedIntegration.js.map