// AWS Bedrock Client for Hilti Recommendations - Ported from FleetFlow-Hack
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { ProjectData, ToolRecommendation } from '../types/ProjectData.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { hiltiPricingService, HiltiPriceRequest } from './hiltiPricingService.js';

// Load environment variables first
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
config({ path: envPath });

// Load the complete Hilti catalog from the processed data

let hiltiCatalogData;
try {
  const catalogPath = path.join(__dirname, '../data/hiltiCatalogLLM.json');
  const catalogContent = fs.readFileSync(catalogPath, 'utf8');
  hiltiCatalogData = JSON.parse(catalogContent);
} catch (error) {
  console.error('Failed to load catalog data, falling back to basic catalog:', error);
  // Fallback to basic catalog if file not found
  hiltiCatalogData = [
    {
      "category": "Rotary Hammers",
      "productCount": 1,
      "products": [
        {
          "name": "TE 60-ATC/AVR Rotary Hammer",
          "sku": "TE 60-ATC/AVR",
          "description": "Heavy-duty rotary hammer for concrete drilling with active torque control",
          "features": ["Active Torque Control", "Anti-vibration technology", "SDS-max chuck"],
          "applications": ["Concrete drilling", "Anchor installation", "Chiseling"],
          "technicalSpecs": ["1500W motor", "68J impact energy", "SDS-max chuck", "Active vibration reduction"],
          "url": "https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_ROTARY_HAMMERS_7124/CLS_ROTARY_HAMMERS_SDS_MAX_7124/r185"
        }
      ]
    }
  ];
}

// AWS Bedrock configuration
const BEDROCK_CONFIG = {
  region: process.env.AWS_REGION,
  modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
  maxTokens: 4000,
  temperature: 0.3,
  topP: 0.9
};

// Enhanced product filtering with blueprint awareness
const getRelevantProducts = (projectData: ProjectData): any[] => {
  const { projectType } = projectData;
  
  // Start with base categories for project type
  const categoryMap: Record<string, string[]> = {
    'residential': [
      'Rotary hammers', 'Hammer drills', 'Circular saws', 'Angle grinders',
      'Measuring tools', 'Safety equipment', 'Fastening systems'
    ],
    'commercial': [
      'Rotary hammers', 'Demolition hammers', 'Cut-off saws', 'Angle grinders',
      'Laser levels', 'Measuring tools', 'Safety equipment', 'Fastening systems',
      'Dust management systems', 'Core drilling'
    ],
    'infrastructure': [
      'Demolition hammers', 'Cut-off saws', 'Core drilling', 'Rotary hammers',
      'Heavy-duty equipment', 'Safety equipment', 'Measuring tools'
    ],
    'industrial': [
      'Heavy-duty equipment', 'Industrial tools', 'Safety equipment',
      'Measuring tools', 'Fastening systems', 'Dust management systems'
    ],
    'renovation': [
      'Demolition hammers', 'Rotary hammers', 'Dust management systems',
      'Safety equipment', 'Measuring tools', 'Cut-off saws'
    ],
    'roadwork': [
      'Cut-off saws', 'Core drilling', 'Heavy-duty equipment',
      'Safety equipment', 'Measuring tools'
    ]
  };

  let relevantCategories = [...(categoryMap[projectType] || categoryMap['commercial'])];
  
  // BLUEPRINT ANALYSIS: Expand categories based on blueprint content
  if (projectData.blueprint && typeof projectData.blueprint === 'string') {
    console.log('🎯 Expanding product catalog based on blueprint analysis...');
    const blueprintText = projectData.blueprint.toLowerCase();
    
    // Add specialized categories based on blueprint content
    const blueprintCategoryExpansions = [
      // Concrete work
      { keywords: ['concrete', 'drilling', 'anchor'], categories: ['Accessories for rotary hammers', 'Core drilling', 'Anchoring'] },
      // Cutting work  
      { keywords: ['cut', 'saw', 'slab', 'opening'], categories: ['Cut-off saws', 'Cutting', 'Saw blades'] },
      // Measuring/Layout
      { keywords: ['measure', 'layout', 'level', 'align'], categories: ['Laser levels', 'Measuring', 'Distance meters'] },
      // Safety/Dust
      { keywords: ['dust', 'safety', 'indoor', 'clean'], categories: ['Dust management', 'Safety', 'Vacuum'] },
      // Fastening
      { keywords: ['fasten', 'attach', 'mount'], categories: ['Fastening', 'Fastening systems', 'Screwdrivers'] },
      // Grinding/Polishing
      { keywords: ['grind', 'polish', 'surface'], categories: ['Angle grinders', 'Polishers', 'Grinders'] },
      // Demolition
      { keywords: ['demolish', 'break', 'remove'], categories: ['Demolition hammers', 'Demolition', 'Breaking'] }
    ];
    
    blueprintCategoryExpansions.forEach(expansion => {
      if (expansion.keywords.some(keyword => blueprintText.includes(keyword))) {
        console.log(`📋 Blueprint mentions ${expansion.keywords.join('/')}, adding categories: ${expansion.categories.join(', ')}`);
        relevantCategories.push(...expansion.categories);
      }
    });
  }
  
  // Remove duplicates
  relevantCategories = [...new Set(relevantCategories)];
  
  // Filter products by relevant categories - MORE INCLUSIVE approach
  const relevantProducts: any[] = [];
  
  hiltiCatalogData.forEach((categoryData: any) => {
    const isRelevantCategory = relevantCategories.some(relCat => 
      categoryData.category.toLowerCase().includes(relCat.toLowerCase()) ||
      relCat.toLowerCase().includes(categoryData.category.toLowerCase())
    );
    
    if (isRelevantCategory) {
      // Include MORE products from relevant categories (was 3, now 8)
      const topProducts = categoryData.products
        .filter((product: any) => product.description && product.name)
        .slice(0, 8); // Increased from 3 to 8 products per category
      
      relevantProducts.push(...topProducts.map((product: any) => ({
        ...product,
        category: categoryData.category
      })));
    }
  });

  console.log(`📊 Catalog filtered: ${relevantProducts.length} products from ${relevantCategories.length} categories`);
  return relevantProducts.slice(0, 80); // Increased from 30 to 80 total products
};

// Create comprehensive Hilti Fleet Management prompt
const createBedrockPrompt = (projectData: ProjectData): string => {
  const relevantProducts = getRelevantProducts(projectData);
  
  // Build product catalog section
  const productCatalogSection = relevantProducts.map(product => `
**${product.name}** (${product.sku})
- Category: ${product.category}
- Description: ${product.description}
- URL: ${product.url}
${product.features?.length > 0 ? `- Features: ${product.features.join('; ')}` : ''}
${product.applications?.length > 0 ? `- Applications: ${product.applications.join('; ')}` : ''}
${product.technicalSpecs?.length > 0 ? `- Technical Specs: ${product.technicalSpecs.slice(0, 3).join('; ')}` : ''}
`).join('\n');

  // Include blueprint analysis if available
  let blueprintSection = '';
  if (projectData.blueprint && typeof projectData.blueprint === 'string') {
    blueprintSection = `
## BLUEPRINT ANALYSIS (AI-Generated from uploaded blueprints):
${projectData.blueprint}

**CRITICAL**: Use this blueprint analysis to inform your tool selection. The AI has identified specific requirements from the project drawings that should guide your recommendations.
`;
  }

  return `
You are a senior Hilti Fleet Management consultant with deep expertise in construction equipment optimization and Total Cost of Ownership (TCO) analysis.

## PROJECT INPUT:
- **Project Name**: ${projectData.projectName}
- **Project Type**: ${projectData.projectType}
- **Project Location**: ${projectData.location}
- **Number of Laborers**: ${projectData.laborCount}
- **Timeline (months)**: ${projectData.timeline}
- **Budget Range ($)**: $${projectData.budget.toLocaleString()}
- **Project Complexity**: ${projectData.projectComplexity}
${projectData.noOfFloors ? `- **Number of Floors**: ${projectData.noOfFloors}` : ''}
${projectData.selectedScopes && projectData.selectedScopes.length > 0 ? `- **Manual Scope Selection**: ${projectData.selectedScopes.join(', ')}` : ''}
- **Existing Tools & Equipment**: ${projectData.existingTools.join(', ') || 'None specified'}
- **Special Requirements**: ${projectData.specialRequirements || 'None specified'}
${blueprintSection}

## AVAILABLE HILTI PRODUCTS:
${productCatalogSection}

## TASK:
From the ACTUAL HILTI PRODUCTS listed above, select the most appropriate tools for this ${projectData.projectType} project with ${projectData.laborCount} workers over ${projectData.timeline} months.

${projectData.blueprint && typeof projectData.blueprint === 'string' ? 
`**CRITICAL BLUEPRINT REQUIREMENTS**: 
1. ANALYZE the blueprint requirements carefully - this is the most important factor
2. SELECT tools that specifically address the blueprint-identified needs
3. PRIORITIZE specialized tools mentioned in the blueprint analysis  
4. ENSURE your recommendations directly solve the problems identified in the blueprint
5. REFERENCE blueprint requirements in your justifications

The AI has analyzed actual project blueprints and identified specific technical requirements. Your tool selection MUST address these specific needs.` : 
'Focus on selecting tools that best match the project type, complexity, and requirements.'}

## SELECTION CRITERIA (in order of importance):
${projectData.blueprint && typeof projectData.blueprint === 'string' ? 
`1. **Blueprint Requirements** (HIGHEST PRIORITY) - Address all needs identified in blueprint analysis
2. **Project Type Match** - Tools suitable for ${projectData.projectType} projects
3. **Team Size** - Appropriate for ${projectData.laborCount} workers
4. **Timeline** - Efficient for ${projectData.timeline} month duration` :
`1. **Project Type Match** - Tools suitable for ${projectData.projectType} projects  
2. **Team Size** - Appropriate for ${projectData.laborCount} workers
3. **Timeline** - Efficient for ${projectData.timeline} month duration`}

## CRITICAL: RESPONSE FORMAT MUST BE VALID JSON ONLY

You MUST respond with ONLY a valid JSON object. No explanations, no text before or after. Just the JSON.

{
  "recommendations": [
    {
      "name": "string - exact product name from catalog",
      "model": "string - exact SKU from catalog", 
      "description": "string - description from catalog",
      "category": "string - tool category",
      "quantity": number,
      "rentalDuration": ${projectData.timeline},
      "monthlyCost": number,
      "totalCost": number,
      "productUrl": "string - exact URL from catalog",
      "specifications": [
        "string - technical spec 1",
        "string - technical spec 2", 
        "string - technical spec 3",
        "string - technical spec 4"
      ],
      "justification": [
        ${projectData.blueprint && typeof projectData.blueprint === 'string' ? 
        `"string - how this tool addresses specific blueprint requirements",
        "string - why blueprint analysis identified this as critical",` : ''}
        "string - why this tool fits project requirements",
        "string - how it addresses project complexity", 
        "string - productivity benefit for team size",
        "string - timeline efficiency benefit",
        "string - competitive advantage"
      ],
      "competitiveAdvantages": [
        "string - Hilti advantage 1",
        "string - Hilti advantage 2", 
        "string - Hilti advantage 3"
      ]
    }
  ]
}

## FLEET MANAGEMENT PRICING GUIDELINES:
**TOOL CATEGORY PRICING (Monthly Fleet Rates):**
- **Rotary Hammers (SDS-Plus)**: $85-150/month
- **Rotary Hammers (SDS-Max)**: $145-220/month  
- **Demolition Hammers**: $180-350/month
- **Angle Grinders**: $45-85/month
- **Cut-off Saws**: $120-200/month
- **Circular Saws**: $55-95/month
- **Laser Levels**: $75-165/month
- **Measuring Tools**: $45-120/month
- **Safety Equipment**: $25-75/month
- **Dust Management**: $85-185/month
- **Fastening Tools**: $65-145/month
- **Core Drilling**: $250-450/month

Generate 8-12 comprehensive tool recommendations. Stay within $${projectData.budget.toLocaleString()} budget for total Fleet contract.
`;
};

// Initialize Bedrock client
let bedrockClient: BedrockRuntimeClient | null = null;

const initializeBedrockClient = () => {
  try {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION;
    
    if (accessKeyId && secretAccessKey && region) {
      bedrockClient = new BedrockRuntimeClient({
        region: region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      // Bedrock client initialized
    } else {
      // AWS credentials incomplete, will use mock recommendations
    }
  } catch (error) {
    // Failed to initialize Bedrock client, using mock recommendations
  }
};

// Initialize on load
initializeBedrockClient();

// Main function to generate recommendations with enhanced catalog integration
export const generateBedrockRecommendations = async (projectData: ProjectData): Promise<ToolRecommendation[]> => {
  // If Bedrock client is not available, use enhanced mock recommendations
  if (!bedrockClient) {
    // Using enhanced Fleet Management recommendations (Bedrock unavailable)
    return generateEnhancedMockRecommendations(projectData);
  }

  try {
    // Generating AI recommendations using AWS Bedrock

    const prompt = createBedrockPrompt(projectData);

    const conversation = [
      {
        role: 'user' as const,
        content: [{ text: prompt }]
      }
    ];

    const command = new ConverseCommand({
      modelId: BEDROCK_CONFIG.modelId,
      messages: conversation,
      inferenceConfig: { 
        maxTokens: BEDROCK_CONFIG.maxTokens, 
        temperature: BEDROCK_CONFIG.temperature,
        topP: BEDROCK_CONFIG.topP
      }
    });

    // Sending request to AWS Bedrock
    const response = await bedrockClient.send(command);
    
    const responseText = response.output?.message?.content?.[0]?.text;
    if (!responseText) {
      throw new Error('No response text received from Bedrock');
    }

    console.log('🔍 RAW BEDROCK RESPONSE TEXT:');
    console.log('---START OF RESPONSE---');
    console.log(responseText);

    console.log('---END OF RESPONSE---');

    // Received response from AWS Bedrock

    // Parse the JSON response
    let recommendations: ToolRecommendation[];
    try {
      let jsonText = responseText.trim();
      
      const jsonStart = jsonText.indexOf('{');
      const jsonEnd = jsonText.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd);
      }
      
      const parsed = JSON.parse(jsonText);
      recommendations = parsed.recommendations || [];
      
      if (!Array.isArray(recommendations)) {
        throw new Error('Response does not contain a valid recommendations array');
      }
      
    } catch (parseError: unknown) {
      console.error('❌ Failed to parse JSON response:', parseError);
      // Falling back to mock recommendations due to JSON parsing error
      return generateEnhancedMockRecommendations(projectData);
    }

    // Generated tool recommendations
    
    // Validate and enhance recommendations
    const validatedRecommendations = recommendations.map((rec, index) => ({
      ...rec,
      id: `bedrock-rec-${index}`,
      quantity: rec.quantity || 1,
      rentalDuration: rec.rentalDuration || projectData.timeline,
      monthlyCost: rec.monthlyCost || 200,
      totalCost: rec.totalCost || (rec.monthlyCost || 200) * (rec.rentalDuration || projectData.timeline),
      specifications: rec.specifications || [],
      justification: rec.justification || [],
      competitiveAdvantages: rec.competitiveAdvantages || []
    }));

    // Generated validated tool recommendations

    // Enrich with real API pricing data
    const enrichedRecommendations = await enrichRecommendationsWithPricing(validatedRecommendations, hiltiCatalogData);

    return enrichedRecommendations;

  } catch (error: unknown) {
    console.error('❌ AWS Bedrock API Error, falling back to enhanced recommendations:', error);
    return await generateEnhancedMockRecommendations(projectData);
  }
};

// Enhanced mock recommendations with comprehensive Fleet Management intelligence
const generateEnhancedMockRecommendations = async (projectData: ProjectData): Promise<ToolRecommendation[]> => {
  // Generating comprehensive Fleet Management recommendations
  console.log('📋 Generating mock recommendations with blueprint consideration');
  
  // Log if blueprint analysis is available
  if (projectData.blueprint && typeof projectData.blueprint === 'string') {
    console.log('✨ Blueprint analysis available - will influence tool selection');
    console.log('📄 Analysis preview:', projectData.blueprint.substring(0, 200) + '...');
  }
  
  // Log new fields if available
  if (projectData.noOfFloors) {
    console.log(`🏢 Number of floors: ${projectData.noOfFloors} (multi-story considerations will apply)`);
  }
  
  if (projectData.selectedScopes && projectData.selectedScopes.length > 0) {
    console.log(`🎯 Manual scope selection: ${projectData.selectedScopes.join(', ')} (will influence tool selection)`);
  }
  
  // Helper function to calculate correct total cost
  const calculateTotalCost = (monthlyCost: number, quantity: number, duration: number): number => {
    return monthlyCost * quantity * duration;
  };
  
  // Base recommendations with accurate Fleet Management pricing
  const baseRecommendations: ToolRecommendation[] = [
    {
      name: "TE 3000-AVR Demolition Hammer",
      model: "TE 3000-AVR",
      description: "Heavy-duty demolition hammer with active vibration reduction for concrete breaking and chiseling",
      quantity: Math.ceil(projectData.laborCount / 15),
      monthlyCost: 320,
      totalCost: calculateTotalCost(320, Math.ceil(projectData.laborCount / 15), projectData.timeline),
      rentalDuration: projectData.timeline,
      category: "Demolition",
      productUrl: "https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_DEMOLITION_TOOLS_7124/CLS_DEMOLITION_HAMMERS_7124/r3000",
      specifications: [
        "65J impact energy for maximum breaking power",
        "Active Vibration Reduction (AVR) technology",
        "18kg weight optimized for all-day use",
        "SDS-max chuck for heavy-duty applications"
      ],
      justification: [
        "Essential for demolition work in commercial construction projects",
        "AVR technology reduces operator fatigue by 50% improving productivity",
        "Fleet Management includes unlimited repairs and 24-hour replacement",
        "Heavy-duty performance reduces project timeline by 25%",
        "Professional-grade reliability prevents costly project delays"
      ],
      competitiveAdvantages: [
        'Latest Hilti technology with continuous updates',
        'Professional service network ensures minimal downtime',
        'Comprehensive safety features and certifications'
      ]
    },
    {
      name: "TE 60-ATC/AVR Rotary Hammer",
      model: "TE 60-ATC/AVR",
      description: "Professional rotary hammer with active torque control and anti-vibration for anchor installation",
      quantity: Math.ceil(projectData.laborCount / 8),
      monthlyCost: 185,
      totalCost: calculateTotalCost(185, Math.ceil(projectData.laborCount / 8), projectData.timeline),
      rentalDuration: projectData.timeline,
      category: "Drilling",
      productUrl: "https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_ROTARY_HAMMERS_7124/CLS_ROTARY_HAMMERS_SDS_MAX_7124/r185",
      specifications: [
        "SDS-max chuck for heavy anchoring applications",
        "Active Torque Control (ATC) prevents operator injury",
        "1500W motor with superior drilling speed",
        "Anti-vibration system meets stringent safety standards"
      ],
      justification: [
        "Critical for anchor installation in commercial construction",
        "ATC technology prevents operator injury and tool damage",
        "Superior drilling speed increases productivity by 40%",
        "Fleet service guarantees prevent equipment downtime",
        `Professional reliability essential for ${projectData.projectComplexity} complexity projects`
      ],
      competitiveAdvantages: [
        'Industry-leading ATC technology',
        'Superior drilling performance',
        'Enhanced operator safety features'
      ]
    }
  ];

  // Add more tools based on project type and size
  if (projectData.laborCount > 10) {
    baseRecommendations.push({
      name: "PM 30-MG Multi-Line Laser",
      model: "PM 30-MG", 
      description: "Advanced multi-line laser with green beam technology for superior layout accuracy",
      quantity: Math.ceil(projectData.laborCount / 15),
      monthlyCost: 125,
      totalCost: calculateTotalCost(125, Math.ceil(projectData.laborCount / 15), projectData.timeline),
      rentalDuration: projectData.timeline,
      category: "Layout",
      productUrl: "https://www.hilti.com/c/CLS_MEASURING_SYSTEMS_7125/CLS_LASER_LEVELS_7125/CLS_LINE_LASERS_7125/r30mg",
      specifications: [
        "Green laser technology for 4x better visibility",
        "3 lines with 30m range for large-scale layouts",
        "Self-leveling with automatic compensation",
        "IP54 rating for construction site durability"
      ],
      justification: [
        "Critical for accurate layout in commercial construction projects",
        "Green beam technology increases productivity by 40% in bright conditions",
        "Self-leveling ensures consistent accuracy reducing rework",
        "Fleet service includes professional calibration and maintenance",
        "Professional accuracy prevents costly measurement errors"
      ],
      competitiveAdvantages: [
        'Green beam technology for superior visibility',
        'Professional calibration service included',
        'Industry-leading accuracy specifications'
      ]
    });
  }
  
  // Blueprint-aware recommendation adjustments
  let finalRecommendations = [...baseRecommendations];
  
  if (projectData.blueprint && typeof projectData.blueprint === 'string') {
    console.log('🔧 Adjusting recommendations based on blueprint analysis...');
    
    const blueprintText = projectData.blueprint.toLowerCase();
    
    // Add drilling tools if blueprint mentions drilling, holes, anchors, etc.
    if (blueprintText.includes('drill') || blueprintText.includes('hole') || 
        blueprintText.includes('anchor') || blueprintText.includes('bore')) {
      console.log('📍 Blueprint indicates drilling requirements - adding specialized drilling tools');
      
      finalRecommendations.push({
        name: "TE 2-22 Cordless rotary hammer",
        model: "TE 2-22",
        description: "Lightweight cordless rotary hammer for drilling and light chiseling in concrete",
        quantity: Math.ceil(projectData.laborCount / 10),
        monthlyCost: 85,
        totalCost: calculateTotalCost(85, Math.ceil(projectData.laborCount / 10), projectData.timeline),
        rentalDuration: projectData.timeline,
        category: "Drilling",
        productUrl: "https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_ROTARY_HAMMERS_7124/r22",
        specifications: [
          "Brushless motor for extended runtime",
          "SDS-plus chuck system",
          "Active Torque Control (ATC)",
          "Compact design for tight spaces"
        ],
        justification: [
          "Blueprint analysis identified drilling requirements",
          "Lightweight design ideal for overhead drilling",
          "Cordless convenience for blueprint-specified locations",
          "ATC technology prevents operator injury during drilling tasks",
          "Fleet service ensures consistent availability for project duration"
        ],
        competitiveAdvantages: [
          'Brushless technology for extended runtime',
          'Industry-leading ATC safety system',
          'Professional Fleet service included'
        ]
      });
    }
    
    // Add cutting tools if blueprint mentions cutting, sawing, etc.
    if (blueprintText.includes('cut') || blueprintText.includes('saw') || 
        blueprintText.includes('slab') || blueprintText.includes('concrete')) {
      console.log('✂️ Blueprint indicates cutting requirements - adding cutting tools');
      
      finalRecommendations.push({
        name: "DSH 600-X 12\" Hand-held saw",
        model: "DSH 600-X",
        description: "Powerful handheld gas saw for cutting concrete, asphalt, and other materials",
        quantity: Math.ceil(projectData.laborCount / 20),
        monthlyCost: 280,
        totalCost: calculateTotalCost(280, Math.ceil(projectData.laborCount / 20), projectData.timeline),
        rentalDuration: projectData.timeline,
        category: "Cutting",
        productUrl: "https://www.hilti.com/c/CLS_POWER_TOOLS_7124/CLS_CUTTING_TOOLS_7124/r600x",
        specifications: [
          "12\" cutting capacity",
          "X-Torq engine for reduced fuel consumption",
          "Active Air Filtration system",
          "Semi-automatic belt tensioning"
        ],
        justification: [
          "Blueprint analysis identified concrete cutting requirements",
          "Powerful engine handles tough materials specified in blueprints",
          "Reduced emissions important for indoor work areas shown in plans",
          "Fleet service includes blade replacement and maintenance",
          "Professional-grade performance for blueprint specifications"
        ],
        competitiveAdvantages: [
          'X-Torq engine technology',
          'Active Air Filtration system',
          'Complete Fleet service support'
        ]
      });
    }
    
    // Add measuring tools if blueprint mentions layout, measurements, levels
    if (blueprintText.includes('level') || blueprintText.includes('measure') || 
        blueprintText.includes('layout') || blueprintText.includes('align')) {
      console.log('📏 Blueprint indicates precision layout requirements - prioritizing measurement tools');
      
      // Update existing laser level recommendation to higher priority
      const laserLevelIndex = finalRecommendations.findIndex(rec => rec.name.includes('Laser'));
      if (laserLevelIndex >= 0) {
        finalRecommendations[laserLevelIndex].justification.unshift(
          "Blueprint analysis identified precise layout requirements"
        );
        finalRecommendations[laserLevelIndex].quantity += 1; // Add extra unit
        finalRecommendations[laserLevelIndex].totalCost = calculateTotalCost(
          finalRecommendations[laserLevelIndex].monthlyCost,
          finalRecommendations[laserLevelIndex].quantity,
          projectData.timeline
        );
      }
    }
  }
  
  // Handle manual scope selections if provided (without blueprint)
  if (projectData.selectedScopes && projectData.selectedScopes.length > 0 && (!projectData.blueprint || typeof projectData.blueprint !== 'string')) {
    console.log('🎯 Adjusting recommendations based on manual scope selections...');
    
    projectData.selectedScopes.forEach(scope => {
      const scopeLower = scope.toLowerCase();
      
      // Add tools based on selected scopes
      if (scopeLower.includes('drilling') || scopeLower.includes('anchoring')) {
        console.log(`📍 Scope "${scope}" indicates drilling needs - prioritizing drilling tools`);
        // Increase quantities for existing drilling tools or add more
        const drillingTools = finalRecommendations.filter(rec => 
          rec.category.toLowerCase().includes('drilling') || 
          rec.name.toLowerCase().includes('drill') ||
          rec.name.toLowerCase().includes('hammer')
        );
        drillingTools.forEach(tool => {
          tool.justification.unshift(`Manual scope selection identified ${scope} requirements`);
        });
      }
      
      if (scopeLower.includes('cutting') || scopeLower.includes('sawing')) {
        console.log(`✂️ Scope "${scope}" indicates cutting needs - prioritizing cutting tools`);
        // Similar logic for cutting tools
        const cuttingTools = finalRecommendations.filter(rec => 
          rec.category.toLowerCase().includes('cutting') || 
          rec.name.toLowerCase().includes('saw') ||
          rec.name.toLowerCase().includes('cut')
        );
        cuttingTools.forEach(tool => {
          tool.justification.unshift(`Manual scope selection identified ${scope} requirements`);
        });
      }
      
      if (scopeLower.includes('measuring') || scopeLower.includes('layout')) {
        console.log(`📏 Scope "${scope}" indicates layout needs - prioritizing measuring tools`);
        const measuringTools = finalRecommendations.filter(rec => 
          rec.category.toLowerCase().includes('layout') || 
          rec.name.toLowerCase().includes('laser') ||
          rec.name.toLowerCase().includes('level')
        );
        measuringTools.forEach(tool => {
          tool.justification.unshift(`Manual scope selection identified ${scope} requirements`);
        });
      }
    });
  }
  
  // Multi-floor considerations
  if (projectData.noOfFloors && projectData.noOfFloors > 1) {
    console.log(`🏢 Multi-story project (${projectData.noOfFloors} floors) - adjusting for vertical work`);
    
    // Increase quantities for tools needed for multi-story work
    finalRecommendations.forEach(rec => {
      if (rec.name.toLowerCase().includes('laser') || 
          rec.name.toLowerCase().includes('level') ||
          rec.category.toLowerCase().includes('layout')) {
        
        // Add extra equipment for multi-story layout work  
        const floorsMultiplier = Math.ceil((projectData.noOfFloors || 1) / 3); // Extra unit per 3 floors
        rec.quantity += floorsMultiplier;
        rec.totalCost = calculateTotalCost(rec.monthlyCost / (rec.quantity - floorsMultiplier), rec.quantity, projectData.timeline);
        rec.justification.unshift(`Multi-story project (${projectData.noOfFloors} floors) requires additional layout equipment`);
      }
    });
  }
  
  console.log(`📋 Final recommendations count: ${finalRecommendations.length} (${finalRecommendations.length - baseRecommendations.length} added based on analysis)`);
  
  // Enrich with real API pricing data and catalog fallback
  const enrichedRecommendations = await enrichRecommendationsWithPricing(finalRecommendations, hiltiCatalogData);
  
  return enrichedRecommendations;
};

/**
 * Enrich tool recommendations with pricing data (prioritizing updated catalog over API calls)
 */
async function enrichRecommendationsWithPricing(recommendations: ToolRecommendation[], catalogData: any[]): Promise<ToolRecommendation[]> {
  try {
    // Create a lookup map to find catalog items by name/model
    const catalogLookup = new Map();
    catalogData.forEach(category => {
      category.products?.forEach((product: any) => {
        // Map by both name and sku for flexible lookup
        catalogLookup.set(product.name, product);
        catalogLookup.set(product.sku, product);
      });
    });

    console.log('💰 Using ONLY real catalog pricing - no estimates or AI pricing allowed');

    // Filter recommendations to ONLY include tools with real pricing data
    const enrichedRecommendations = recommendations
      .map(rec => {
        // Try to find the product in catalog by exact name match first
        let catalogProduct = catalogLookup.get(rec.name);
        
        if (!catalogProduct) {
          // Try to find by model/sku
          catalogProduct = catalogLookup.get(rec.model);
        }
        
        if (!catalogProduct) {
          // Try partial name matching as last resort
          for (const [key, product] of catalogLookup.entries()) {
            if (typeof key === 'string' && key.includes(rec.name.split(' ')[0])) {
              catalogProduct = product;
              break;
            }
          }
        }
        
        // ONLY use tools with real pricing data - reject any without real pricing
        if (!catalogProduct?.pricing || 
            !catalogProduct.pricing.standardPrice || 
            catalogProduct.pricing.standardPrice <= 0 ||
            !catalogProduct.pricing.fleetMonthlyPrice ||
            catalogProduct.pricing.fleetMonthlyPrice <= 0) {
          
          console.warn(`❌ REJECTED ${rec.name} - no real pricing data in catalog`);
          return null; // Reject tools without real pricing
        }
        
        // Use ONLY real pricing from catalog - no calculations or estimates
        const realPricing = {
          standardPrice: catalogProduct.pricing.standardPrice,
          fleetMonthlyPrice: catalogProduct.pricing.fleetMonthlyPrice,
          fleetUpfrontCost: catalogProduct.pricing.fleetUpfrontCost || 0,
          currency: catalogProduct.pricing.currency || 'USD',
          lastUpdated: catalogProduct.pricing.lastUpdated,
          priceSource: 'catalog_updated' as const
        };
        
        // Calculate total monthly cost: fleet monthly price per unit × quantity
        const totalMonthlyCost = realPricing.fleetMonthlyPrice * rec.quantity;
        const totalFleetCost = totalMonthlyCost * rec.rentalDuration;
        
        console.log(`✅ ${rec.name}: $${realPricing.fleetMonthlyPrice}/unit/month × ${rec.quantity} units = $${totalMonthlyCost}/month`);
        
        return {
          ...rec,
          monthlyCost: totalMonthlyCost,
          totalCost: totalFleetCost,
          pricing: realPricing
        };
      })
      .filter(rec => rec !== null); // Remove rejected tools
    
    const successCount = enrichedRecommendations.length;
    console.log(`✅ ${successCount} tools with real pricing retained, ${recommendations.length - successCount} rejected`);
    
    return enrichedRecommendations;
    
  } catch (error) {
    console.error('❌ Error using catalog pricing:', error);
    
    // Return empty array if catalog lookup fails - no estimates allowed
    return [];
  }
}

export default generateBedrockRecommendations;