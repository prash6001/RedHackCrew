// Enhanced Recommendation Engine - Ported from FleetFlow-Hack
import { ProjectData, ToolRecommendation, FleetContract } from '../types/ProjectData.js';

const hiltiTools = {
  drills: [
    {
      name: 'TE 60-ATC/AVR Rotary Hammer',
      model: 'TE 60-ATC/AVR',
      description: 'Heavy-duty rotary hammer for concrete drilling and chiseling with active torque control and anti-vibration technology',
      baseMonthlyRate: 145,
      category: 'Drilling',
      productUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_ROTARY_HAMMERS_7124/CLS_ROTARY_HAMMERS_SDS_MAX_7124/r185',
      applicableProjects: ['commercial', 'industrial', 'infrastructure'],
      laborRequirement: 10,
      specifications: ['SDS-max chuck', '1500W motor', 'Active Torque Control', 'Anti-vibration system']
    },
    {
      name: 'TE 3000-AVR Demolition Hammer',
      model: 'TE 3000-AVR',
      description: 'High-performance demolition hammer for breaking concrete and masonry with superior power-to-weight ratio',
      baseMonthlyRate: 180,
      category: 'Demolition',
      productUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_DEMOLITION_HAMMERS_7124/CLS_DEMOLITION_HAMMERS_7124/r3000avr',
      applicableProjects: ['renovation', 'commercial', 'industrial'],
      laborRequirement: 5,
      specifications: ['1300W motor', 'AVR technology', '68J impact energy', 'Service indicator']
    },
    {
      name: 'TE 7-C Rotary Hammer',
      model: 'TE 7-C',
      description: 'Versatile SDS-plus rotary hammer for drilling and light chiseling in concrete, masonry and stone',
      baseMonthlyRate: 85,
      category: 'Drilling',
      productUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_ROTARY_HAMMERS_7124/CLS_ROTARY_HAMMERS_SDS_PLUS_7124/r7c',
      applicableProjects: ['residential', 'commercial', 'renovation'],
      laborRequirement: 5,
      specifications: ['SDS-plus chuck', '720W motor', '2.4J impact energy', 'Compact design']
    }
  ],
  cutting: [
    {
      name: 'WSC 85 Wall Saw',
      model: 'WSC 85',
      description: 'Professional wall saw for precise cutting in concrete and masonry with advanced dust management',
      baseMonthlyRate: 320,
      category: 'Cutting',
      productUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_DIAMOND_SYSTEMS_7124/CLS_WALL_SAWS_7124/r85',
      applicableProjects: ['commercial', 'infrastructure', 'renovation'],
      laborRequirement: 15,
      specifications: ['85mm cutting depth', 'Integrated dust management', 'Electronic speed control', 'Overload protection']
    },
    {
      name: 'AG 500-A36 Angle Grinder',
      model: 'AG 500-A36',
      description: 'High-power cordless angle grinder for cutting and grinding applications with brushless motor',
      baseMonthlyRate: 75,
      category: 'Cutting',
      productUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_GRINDERS_7124/CLS_ANGLE_GRINDERS_7124/r500a36',
      applicableProjects: ['residential', 'commercial', 'industrial', 'renovation'],
      laborRequirement: 5,
      specifications: ['36V battery system', 'Brushless motor', '125mm disc', 'Electronic brake']
    },
    {
      name: 'DSH 700-X Hand-held Gas Saw',
      model: 'DSH 700-X',
      description: 'Powerful gas-powered cut-off saw for cutting concrete, asphalt, and metal with low vibration',
      baseMonthlyRate: 195,
      category: 'Cutting',
      productUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_DIAMOND_SYSTEMS_7124/CLS_HANDHELD_GAS_SAWS_7124/r700x',
      applicableProjects: ['infrastructure', 'roadwork', 'commercial'],
      laborRequirement: 8,
      specifications: ['70cc engine', '350mm cutting depth', 'X-Torq engine', 'Low vibration design']
    }
  ],
  measuring: [
    {
      name: 'PM 30-MG Multi-Line Laser',
      model: 'PM 30-MG',
      description: 'Advanced multi-line laser level with green beam technology for superior visibility',
      baseMonthlyRate: 95,
      category: 'Layout',
      productUrl: 'https://www.hilti.com/c/CLS_MEASURING_SYSTEMS_7125/CLS_LASER_LEVELS_7125/CLS_LINE_LASERS_7125/r30mg',
      applicableProjects: ['residential', 'commercial', 'industrial'],
      laborRequirement: 8,
      specifications: ['Green laser technology', '3 lines', '30m range', 'Self-leveling']
    },
    {
      name: 'PD-E Laser Range Meter',
      model: 'PD-E',
      description: 'Professional laser distance meter with Bluetooth connectivity for accurate measurements',
      baseMonthlyRate: 35,
      category: 'Measuring',
      productUrl: 'https://www.hilti.com/c/CLS_MEASURING_SYSTEMS_7125/CLS_LASER_RANGE_METERS_7125/CLS_LASER_RANGE_METERS_7125/rde',
      applicableProjects: ['residential', 'commercial', 'industrial', 'renovation'],
      laborRequirement: 3,
      specifications: ['100m range', 'Bluetooth connectivity', 'IP65 rating', 'Color display']
    },
    {
      name: 'PR 30-HVS Rotating Laser',
      model: 'PR 30-HVS',
      description: 'High-precision rotating laser for horizontal and vertical leveling with remote control',
      baseMonthlyRate: 125,
      category: 'Layout',
      productUrl: 'https://www.hilti.com/c/CLS_MEASURING_SYSTEMS_7125/CLS_LASER_LEVELS_7125/CLS_ROTATING_LASERS_7125/r30hvs',
      applicableProjects: ['commercial', 'industrial', 'infrastructure'],
      laborRequirement: 12,
      specifications: ['600m diameter range', 'Remote control', 'Dual grade capability', 'Shock warning']
    }
  ],
  fastening: [
    {
      name: 'DX 460-F8 Powder-Actuated Tool',
      model: 'DX 460-F8',
      description: 'Heavy-duty powder-actuated fastening tool for steel-to-concrete applications',
      baseMonthlyRate: 85,
      category: 'Fastening',
      productUrl: 'https://www.hilti.com/c/CLS_FASTENING_SYSTEMS_7126/CLS_DIRECT_FASTENING_7126/CLS_POWDER_ACTUATED_TOOLS_7126/r460f8',
      applicableProjects: ['commercial', 'industrial', 'infrastructure'],
      laborRequirement: 10,
      specifications: ['Fully automatic operation', 'Magazine feed', 'Adjustable power', 'Safety features']
    },
    {
      name: 'X-BT Anchor System',
      model: 'X-BT',
      description: 'Complete anchor system for structural connections with high load capacity',
      baseMonthlyRate: 120,
      category: 'Fastening',
      productUrl: 'https://www.hilti.com/c/CLS_FASTENING_SYSTEMS_7126/CLS_ANCHORS_7126/CLS_MECHANICAL_ANCHORS_7126/rxbt',
      applicableProjects: ['commercial', 'industrial', 'infrastructure'],
      laborRequirement: 12,
      specifications: ['High load capacity', 'Corrosion resistant', 'Easy installation', 'Seismic approval']
    },
    {
      name: 'GX 3 Gas-Actuated Fastening Tool',
      model: 'GX 3',
      description: 'Cordless gas-actuated tool for fastening to steel and concrete with consistent performance',
      baseMonthlyRate: 110,
      category: 'Fastening',
      productUrl: 'https://www.hilti.com/c/CLS_FASTENING_SYSTEMS_7126/CLS_DIRECT_FASTENING_7126/CLS_GAS_ACTUATED_TOOLS_7126/rgx3',
      applicableProjects: ['commercial', 'industrial', 'residential'],
      laborRequirement: 8,
      specifications: ['Cordless operation', 'Consistent power', 'Quick reload', 'Ergonomic design']
    }
  ],
  safety: [
    {
      name: 'TE-CD Dust Management System',
      model: 'TE-CD',
      description: 'Advanced dust collection system for health and safety compliance with HEPA filtration',
      baseMonthlyRate: 150,
      category: 'Safety',
      productUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_DUST_MANAGEMENT_7124/CLS_DUST_REMOVAL_SYSTEMS_7124/rtecd',
      applicableProjects: ['commercial', 'industrial', 'renovation', 'infrastructure'],
      laborRequirement: 5,
      specifications: ['HEPA filtration', 'Auto-start function', 'High suction power', 'Easy maintenance']
    },
    {
      name: 'VC 20-U Wet/Dry Vacuum',
      model: 'VC 20-U',
      description: 'Professional wet/dry vacuum with automatic filter cleaning for continuous operation',
      baseMonthlyRate: 85,
      category: 'Safety',
      productUrl: 'https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_DUST_MANAGEMENT_7124/CLS_UNIVERSAL_VACUUMS_7124/r20u',
      applicableProjects: ['residential', 'commercial', 'renovation'],
      laborRequirement: 5,
      specifications: ['20L capacity', 'Auto filter cleaning', 'Wet/dry capability', 'Tool connectivity']
    }
  ]
};

export const generateRecommendations = (projectData: ProjectData): ToolRecommendation[] => {
  // Generating enhanced Fleet Management recommendations
  
  try {
    // Generate enhanced recommendations with Fleet Management insights
    const baseRecommendations = generateBasicRecommendations(projectData);
    
    // Enhance with Fleet Management benefits directly
    const enhancedRecommendations = baseRecommendations.map(tool => ({
      ...tool,
      // Enhanced justifications with Fleet Management benefits
      justification: [
        ...tool.justification,
        'Fleet Management eliminates maintenance headaches and downtime',
        '24/7 replacement guarantee if stolen or broken',
        'Access to latest Hilti technology innovations'
      ],
      competitiveAdvantages: [
        'Latest Hilti technology with continuous updates',
        'Professional service network ensures minimal downtime',
        'Comprehensive safety features and certifications',
        'Unlimited repairs and maintenance included',
        '80% theft coverage with immediate replacement'
      ]
    }));
    
    // Generated enhanced recommendations with Fleet Management insights
    return enhancedRecommendations;
    
  } catch (error) {
    console.error('Enhanced recommendation system failed, using basic engine:', error);
    return generateBasicRecommendations(projectData);
  }
};

// Original recommendation logic as fallback
const generateBasicRecommendations = (projectData: ProjectData): ToolRecommendation[] => {
  const recommendations: ToolRecommendation[] = [];
  const allTools = Object.values(hiltiTools).flat();
  
  // Filter tools based on project type and requirements
  const relevantTools = allTools.filter(tool => 
    tool.applicableProjects.includes(projectData.projectType) &&
    projectData.laborCount >= tool.laborRequirement
  );

  // Calculate quantities based on labor count and project complexity
  const getQuantityMultiplier = (complexity: string) => {
    switch (complexity) {
      case 'high': return 1.5;
      case 'medium': return 1.2;
      case 'low': return 1.0;
      default: return 1.0;
    }
  };

  const complexityMultiplier = getQuantityMultiplier(projectData.projectComplexity);

  relevantTools.forEach(tool => {
    // Skip tools that are already owned
    if (projectData.existingTools.some(existing => 
      tool.name.toLowerCase().includes(existing.toLowerCase()) ||
      existing.toLowerCase().includes(tool.category.toLowerCase())
    )) {
      return;
    }

    const baseQuantity = Math.max(1, Math.floor(projectData.laborCount / tool.laborRequirement));
    const adjustedQuantity = Math.ceil(baseQuantity * complexityMultiplier);
    const rentalDuration = projectData.timeline;
    const monthlyCost = tool.baseMonthlyRate * adjustedQuantity;
    const totalCost = monthlyCost * rentalDuration;

    const justification = generateJustification(tool, projectData);

    recommendations.push({
      name: tool.name,
      model: tool.model,
      description: tool.description,
      quantity: adjustedQuantity,
      monthlyCost,
      totalCost,
      rentalDuration,
      justification,
      category: tool.category,
      productUrl: tool.productUrl,
      specifications: tool.specifications,
    });
  });

  // Sort by total cost (highest first) and take top recommendations
  return recommendations
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 10);
};

const generateJustification = (tool: any, projectData: ProjectData): string[] => {
  const justifications = [];
  
  // Base justifications based on tool category
  switch (tool.category) {
    case 'Drilling':
      justifications.push('Essential for anchor installation and structural connections');
      justifications.push('Advanced technology prevents operator injury and tool damage');
      justifications.push('Superior drilling speed reduces project timeline by 20%');
      break;
    case 'Demolition':
      justifications.push('Required for efficient concrete removal and renovation work');
      justifications.push('Anti-vibration technology reduces operator fatigue by 40%');
      justifications.push('Higher productivity compared to manual demolition methods');
      break;
    case 'Cutting':
      justifications.push('Precision cutting reduces material waste and rework costs');
      justifications.push('Integrated dust management protects worker health and ensures compliance');
      justifications.push('Professional-grade performance for demanding applications');
      break;
    case 'Layout':
      justifications.push('Accurate layout prevents costly measurement errors and rework');
      justifications.push('Advanced laser technology increases productivity by 40%');
      justifications.push('Self-leveling capability ensures consistent accuracy');
      break;
    case 'Fastening':
      justifications.push('Provides structural integrity for critical connections');
      justifications.push('Faster installation compared to traditional fastening methods');
      justifications.push('Consistent performance ensures reliable connections');
      break;
    case 'Safety':
      justifications.push('Mandatory for OSHA compliance and worker health protection');
      justifications.push('Reduces liability and potential health-related costs');
      justifications.push('Professional dust management prevents respiratory issues');
      break;
  }

  // Add project-specific justifications
  if (projectData.projectComplexity === 'high') {
    justifications.push('High-complexity project requires professional-grade equipment');
  }
  
  if (projectData.laborCount > 20) {
    justifications.push('Large workforce requires multiple units for optimal efficiency');
  }

  if (projectData.timeline > 12) {
    justifications.push('Long-term project benefits from reliable rental vs. purchase');
  }

  return justifications.slice(0, 4);
};

export const generateFleetContract = (
  projectData: ProjectData, 
  recommendations: ToolRecommendation[]
): FleetContract => {
  // Generating enhanced Fleet Management contract
  
  const totalEquipmentCost = recommendations.reduce((sum, tool) => sum + tool.totalCost, 0);
  const monthlyCost = recommendations.reduce((sum, tool) => sum + tool.monthlyCost, 0);
  
  // Enhanced savings calculation with Fleet Management benefits
  const purchaseMultiplier = 4.5; // Includes all hidden costs
  const estimatedPurchasePrice = totalEquipmentCost * purchaseMultiplier;
  const estimatedSavings = estimatedPurchasePrice - totalEquipmentCost;
  
  // Using enhanced Fleet Management savings calculation

  // Enhanced benefits based on Hilti Fleet Management research
  const benefits = [
    'All maintenance and repairs included at no extra cost',
    '24/7 technical support and replacement guarantee within 24 hours',
    'Latest tool technology updates throughout contract period',
    '80% theft coverage with immediate replacement',
    'Loaner tools available during repairs to prevent downtime',
    'Free operator training and safety certification programs',
    'Proactive maintenance scheduling to prevent failures',
    'Dedicated account manager for personalized service',
    'Performance analytics and productivity optimization reports',
    'Environmental compliance and sustainability reporting'
  ];

  // Enhanced terms with Fleet Management specifics
  const terms = [
    `Contract Duration: ${projectData.timeline} months with ${projectData.projectType} project optimization`,
    'Monthly payment structure with no upfront costs or deposits',
    'Comprehensive maintenance and repair services included',
    'Equipment replacement within 24 hours if needed',
    'Contract can be adjusted based on project scope changes',
    'Tools on Demand available for temporary additional needs',
    'All safety training and certifications provided at no cost',
    'Option to purchase equipment at contract end with credit applied'
  ];

  const contract = {
    totalCost: totalEquipmentCost,
    monthlyCost,
    duration: projectData.timeline,
    estimatedSavings,
    benefits,
    terms,
    // Enhanced Fleet Management analysis
    tcoComparison: {
      savings: estimatedSavings,
      recommendation: 'fleet',
      keyFactors: [
        'Eliminates upfront capital investment',
        'Includes all maintenance and repair costs',
        'Provides theft and loss protection',
        'Reduces administrative overhead'
      ]
    }
  };

  // Fleet contract generated
  
  return contract;
};