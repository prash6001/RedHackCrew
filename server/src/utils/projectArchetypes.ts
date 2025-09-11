import { ProjectArchetypeTools, ProjectArchetype } from '../types/ProjectData';

// Tool loadouts based on Section 3 analysis of the document
// Residential Renovation archetype from Section 3.1
export const RESIDENTIAL_ARCHETYPE: ProjectArchetypeTools = {
  archetype: 'residential',
  requiredTools: [
    {
      category: 'Hand Tools',
      priority: 'essential',
      tools: [
        '16-ounce carpenter hammer',
        '25-foot tape measure',
        'Spirit levels (torpedo and 4-foot)',
        'Multi-bit screwdriver set',
        'Adjustable wrenches',
        'Locking pliers',
        'Heavy-duty utility knife',
        'Pry bars',
        'Cat\'s paw nail puller',
        'Wood chisels set'
      ]
    },
    {
      category: 'Core Power Tools',
      priority: 'essential',
      tools: [
        'Cordless drill/driver',
        'Impact driver',
        'Circular saw',
        'Reciprocating saw',
        'Jigsaw',
        'Random orbital sander'
      ]
    },
    {
      category: 'Specialized Tools',
      priority: 'recommended',
      tools: [
        'Miter saw',
        'Wet/dry shop vacuum',
        'Pneumatic brad nailer',
        'Pneumatic finish nailer',
        'Painting equipment'
      ]
    },
    {
      category: 'Site Equipment',
      priority: 'essential',
      tools: [
        'Sturdy sawhorses',
        'A-frame ladders',
        'Extension ladders'
      ]
    },
    {
      category: 'Safety Equipment',
      priority: 'essential',
      tools: [
        'Safety glasses',
        'Hearing protection',
        'Work gloves',
        'Dust masks',
        'First aid kit'
      ]
    }
  ]
};

// Mid-Scale Commercial archetype from Section 3.2
export const COMMERCIAL_ARCHETYPE: ProjectArchetypeTools = {
  archetype: 'commercial',
  requiredTools: [
    {
      category: 'Hand Tools',
      priority: 'essential',
      tools: [
        'All residential tools',
        'Heavy-duty hammers',
        'Precision measuring tools',
        'Professional-grade hand tools'
      ]
    },
    {
      category: 'Concrete and Masonry Tools',
      priority: 'essential',
      tools: [
        'SDS-plus rotary hammers',
        'SDS-max rotary hammers',
        'Demolition hammers and breakers',
        'Portable concrete mixers',
        'Concrete cut-off saws',
        'Multiple angle grinders'
      ]
    },
    {
      category: 'Advanced Fastening Systems',
      priority: 'essential',
      tools: [
        'Powder-actuated tools',
        'Gas-actuated fastening tools',
        'High-torque impact wrenches'
      ]
    },
    {
      category: 'MEP and Fabrication Tools',
      priority: 'essential',
      tools: [
        'Pipe threaders and cutters',
        'Hydraulic crimpers',
        'Conduit benders',
        'Portable welding equipment'
      ]
    },
    {
      category: 'Layout and Measurement',
      priority: 'essential',
      tools: [
        'Laser levels',
        'Optical levels',
        'Total stations (for large projects)',
        'Precision tape measures'
      ]
    },
    {
      category: 'Site and Access Equipment',
      priority: 'essential',
      tools: [
        'Modular scaffolding systems',
        'Mobile scissor lifts',
        'Temporary power generators'
      ]
    },
    {
      category: 'Dust Management',
      priority: 'essential',
      tools: [
        'HEPA dust collectors',
        'Industrial vacuums',
        'Dust containment systems'
      ]
    }
  ]
};

// Large-Scale Industrial archetype from Section 3.3
export const INDUSTRIAL_ARCHETYPE: ProjectArchetypeTools = {
  archetype: 'industrial',
  requiredTools: [
    {
      category: 'Phase 1-2: Site Survey & Excavation',
      priority: 'essential',
      tools: [
        'Dozers',
        'Large excavators',
        'Motor graders',
        'Smooth drum compaction rollers',
        'Padfoot compaction rollers',
        'Trench compaction rollers'
      ]
    },
    {
      category: 'Phase 3: Utility Installation',
      priority: 'essential',
      tools: [
        'Trenchers',
        'Trench boxes',
        'Pipe lasers',
        'Dewatering pumps'
      ]
    },
    {
      category: 'Phase 4: Foundation & Slab',
      priority: 'essential',
      tools: [
        'Motorized concrete buggies',
        'Large ride-on power trowels',
        'Ground heaters',
        'Concrete pumps'
      ]
    },
    {
      category: 'Phase 5: Structural Skeleton',
      priority: 'essential',
      tools: [
        'Mobile welders',
        'Large manlifts (articulating boom)',
        'Straight boom lifts',
        'Shooting boom forklifts (telehandlers)',
        'Tower cranes'
      ]
    },
    {
      category: 'Phase 6: MEP & Fire Protection',
      priority: 'essential',
      tools: [
        'Victaulic groovers',
        'Heavy-duty pipe threading equipment',
        'Large cable pullers',
        'High-capacity electrical tools'
      ]
    },
    {
      category: 'Phase 7: Exterior & Roofing',
      priority: 'essential',
      tools: [
        'Mast climbers',
        'Carry deck cranes',
        'Material hoists',
        'Roof cutting equipment'
      ]
    },
    {
      category: 'Phase 8-9: Interior & Commissioning',
      priority: 'essential',
      tools: [
        'Drywall lifts',
        'Air scrubbers',
        'Load banks',
        'Hydrostatic test pumps'
      ]
    },
    {
      category: 'Heavy Machinery',
      priority: 'essential',
      tools: [
        'All commercial tools',
        'Industrial-grade power tools',
        'Specialized testing equipment',
        'High-capacity generators'
      ]
    }
  ]
};

// Tool priority matrix for different project types
export interface ToolPriorityMatrix {
  [toolName: string]: {
    residential: 'essential' | 'recommended' | 'situational' | 'not_applicable';
    commercial: 'essential' | 'recommended' | 'situational' | 'not_applicable';
    industrial: 'essential' | 'recommended' | 'situational' | 'not_applicable';
  };
}

// Tool priority matrix based on the comprehensive analysis in Section 3
export const TOOL_PRIORITY_MATRIX: ToolPriorityMatrix = {
  // Hand Tools
  'Hammer': { residential: 'essential', commercial: 'essential', industrial: 'essential' },
  'Tape Measure': { residential: 'essential', commercial: 'essential', industrial: 'essential' },
  'Levels': { residential: 'essential', commercial: 'essential', industrial: 'essential' },
  'Screwdrivers': { residential: 'essential', commercial: 'essential', industrial: 'recommended' },
  'Utility Knife': { residential: 'essential', commercial: 'essential', industrial: 'recommended' },
  'Pry Bars': { residential: 'essential', commercial: 'essential', industrial: 'recommended' },
  'Chisels': { residential: 'essential', commercial: 'essential', industrial: 'recommended' },

  // Power Tools - Core
  'Cordless Drill/Driver': { residential: 'essential', commercial: 'essential', industrial: 'essential' },
  'Impact Driver': { residential: 'essential', commercial: 'essential', industrial: 'essential' },
  'Circular Saw': { residential: 'essential', commercial: 'essential', industrial: 'recommended' },
  'Reciprocating Saw': { residential: 'essential', commercial: 'essential', industrial: 'recommended' },
  'Jigsaw': { residential: 'essential', commercial: 'recommended', industrial: 'situational' },
  'Orbital Sander': { residential: 'essential', commercial: 'recommended', industrial: 'situational' },
  'Oscillating Multitool': { residential: 'essential', commercial: 'recommended', industrial: 'situational' },

  // Power Tools - Concrete
  'Rotary Hammer (SDS-Plus/Max)': { residential: 'recommended', commercial: 'essential', industrial: 'essential' },
  'Demolition Hammer/Breaker': { residential: 'situational', commercial: 'essential', industrial: 'essential' },
  'Concrete Cut-Off Saw': { residential: 'situational', commercial: 'essential', industrial: 'essential' },
  'Angle Grinder': { residential: 'recommended', commercial: 'essential', industrial: 'essential' },

  // Power Tools - Fastening
  'Pneumatic Nail Guns': { residential: 'essential', commercial: 'recommended', industrial: 'not_applicable' },
  'Powder/Gas Actuated Tools': { residential: 'not_applicable', commercial: 'essential', industrial: 'essential' },
  'High-Torque Impact Wrench': { residential: 'situational', commercial: 'recommended', industrial: 'essential' },

  // Power Tools - Fabrication
  'Miter Saw': { residential: 'essential', commercial: 'essential', industrial: 'recommended' },
  'Welding Equipment': { residential: 'not_applicable', commercial: 'recommended', industrial: 'essential' },
  'Pipe Threader/Groover': { residential: 'situational', commercial: 'recommended', industrial: 'essential' },

  // Layout & Measurement
  'Laser Level': { residential: 'recommended', commercial: 'essential', industrial: 'essential' },
  'Optical Level/Total Station': { residential: 'not_applicable', commercial: 'situational', industrial: 'essential' },

  // Access Equipment
  'Ladders': { residential: 'essential', commercial: 'essential', industrial: 'essential' },
  'Scaffolding': { residential: 'situational', commercial: 'essential', industrial: 'essential' },
  'Scissor Lift': { residential: 'not_applicable', commercial: 'essential', industrial: 'essential' },
  'Manlift (Boom Lift)': { residential: 'not_applicable', commercial: 'recommended', industrial: 'essential' },
  'Mast Climber': { residential: 'not_applicable', commercial: 'not_applicable', industrial: 'recommended' },

  // Light Machinery
  'Wet/Dry Shop Vacuum': { residential: 'essential', commercial: 'essential', industrial: 'essential' },
  'Portable Generator': { residential: 'recommended', commercial: 'essential', industrial: 'essential' },
  'Concrete Mixer (Portable)': { residential: 'situational', commercial: 'essential', industrial: 'recommended' },
  'Power Concrete Buggy': { residential: 'not_applicable', commercial: 'situational', industrial: 'essential' },

  // Heavy Machinery
  'Skid Steer Loader': { residential: 'situational', commercial: 'recommended', industrial: 'essential' },
  'Forklift': { residential: 'not_applicable', commercial: 'essential', industrial: 'essential' },
  'Excavator': { residential: 'not_applicable', commercial: 'situational', industrial: 'essential' },
  'Dozer': { residential: 'not_applicable', commercial: 'situational', industrial: 'essential' },
  'Compaction Rollers': { residential: 'not_applicable', commercial: 'situational', industrial: 'essential' },
  'Trencher': { residential: 'not_applicable', commercial: 'situational', industrial: 'essential' },

  // Specialized Testing
  'Hydrostatic Test Pump': { residential: 'not_applicable', commercial: 'situational', industrial: 'essential' },
  'Electrical Load Bank': { residential: 'not_applicable', commercial: 'not_applicable', industrial: 'essential' }
};

// Get archetype-specific tool requirements
export const getArchetypeTools = (archetype: ProjectArchetype): ProjectArchetypeTools => {
  switch (archetype) {
    case 'residential':
      return RESIDENTIAL_ARCHETYPE;
    case 'commercial':
      return COMMERCIAL_ARCHETYPE;
    case 'industrial':
      return INDUSTRIAL_ARCHETYPE;
    default:
      return COMMERCIAL_ARCHETYPE; // Default to commercial
  }
};

// Determine tool necessity based on project archetype
export const getToolNecessity = (
  toolName: string,
  archetype: ProjectArchetype
): 'essential' | 'recommended' | 'situational' | 'not_applicable' => {
  // Normalize tool name for lookup
  const normalizedName = findClosestToolMatch(toolName);
  
  if (TOOL_PRIORITY_MATRIX[normalizedName]) {
    return TOOL_PRIORITY_MATRIX[normalizedName][archetype];
  }
  
  // Default logic based on archetype and tool category
  if (archetype === 'residential') {
    return 'recommended';
  } else if (archetype === 'commercial') {
    return 'essential';
  } else {
    return 'essential';
  }
};

// Find closest matching tool name in priority matrix
const findClosestToolMatch = (toolName: string): string => {
  const normalized = toolName.toLowerCase();
  
  // Direct matches
  for (const matrixTool in TOOL_PRIORITY_MATRIX) {
    if (matrixTool.toLowerCase() === normalized) {
      return matrixTool;
    }
  }
  
  // Partial matches
  for (const matrixTool in TOOL_PRIORITY_MATRIX) {
    if (normalized.includes(matrixTool.toLowerCase()) || 
        matrixTool.toLowerCase().includes(normalized)) {
      return matrixTool;
    }
  }
  
  // Category-based matching
  const categoryMapping: { [key: string]: string } = {
    'hammer': 'Hammer',
    'drill': 'Cordless Drill/Driver',
    'saw': 'Circular Saw',
    'grinder': 'Angle Grinder',
    'level': 'Laser Level',
    'measuring': 'Tape Measure',
    'nailer': 'Pneumatic Nail Guns',
    'vacuum': 'Wet/Dry Shop Vacuum',
    'generator': 'Portable Generator'
  };
  
  for (const keyword in categoryMapping) {
    if (normalized.includes(keyword)) {
      return categoryMapping[keyword];
    }
  }
  
  return 'Cordless Drill/Driver'; // Default fallback
};

// Calculate tool quantity multipliers based on project archetype
export const getArchetypeQuantityMultiplier = (
  archetype: ProjectArchetype,
  laborCount: number
): number => {
  const baseMultipliers = {
    residential: 0.8,  // Lower tool-to-worker ratio
    commercial: 1.0,   // Standard ratio
    industrial: 1.3    // Higher ratio for specialized equipment
  };
  
  let multiplier = baseMultipliers[archetype];
  
  // Adjust for team size
  if (laborCount > 50) {
    multiplier *= 1.2; // Large teams need more redundancy
  } else if (laborCount > 20) {
    multiplier *= 1.1; // Medium teams need moderate redundancy
  }
  
  return multiplier;
};

// Generate archetype-specific justifications
export const getArchetypeJustification = (
  toolName: string,
  archetype: ProjectArchetype,
  necessity: string
): string[] => {
  const justifications: string[] = [];
  
  switch (archetype) {
    case 'residential':
      if (necessity === 'essential') {
        justifications.push('Critical for residential construction and renovation work');
        justifications.push('Versatile tool suitable for various home improvement tasks');
      } else if (necessity === 'recommended') {
        justifications.push('Enhances efficiency in residential projects');
        justifications.push('Professional-grade performance for quality results');
      }
      break;
      
    case 'commercial':
      if (necessity === 'essential') {
        justifications.push('Required for commercial-grade construction standards');
        justifications.push('Meets code requirements for commercial buildings');
        justifications.push('Handles demanding applications with reliability');
      } else if (necessity === 'recommended') {
        justifications.push('Improves productivity on commercial projects');
        justifications.push('Professional tool for consistent quality');
      }
      break;
      
    case 'industrial':
      if (necessity === 'essential') {
        justifications.push('Critical for large-scale industrial construction');
        justifications.push('Engineered for high-demand industrial applications');
        justifications.push('Ensures project timeline adherence at industrial scale');
      } else if (necessity === 'recommended') {
        justifications.push('Supports specialized industrial processes');
        justifications.push('Backup equipment for critical path protection');
      }
      break;
  }
  
  return justifications;
};

// Export all archetypes for easy access
export const PROJECT_ARCHETYPES: Record<ProjectArchetype, ProjectArchetypeTools> = {
  residential: RESIDENTIAL_ARCHETYPE,
  commercial: COMMERCIAL_ARCHETYPE,
  industrial: INDUSTRIAL_ARCHETYPE
};