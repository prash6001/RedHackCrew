// AWS Bedrock Client for Hilti Recommendations - Ported from FleetFlow-Hack
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { hiltiPricingService } from './hiltiPricingService.js';
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
}
catch (error) {
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
// Filter products by project relevance
const getRelevantProducts = (projectData) => {
    const { projectType } = projectData;
    // Define relevant categories based on project type
    const categoryMap = {
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
    const relevantCategories = categoryMap[projectType] || categoryMap['commercial'];
    // Filter products by relevant categories
    const relevantProducts = [];
    hiltiCatalogData.forEach((categoryData) => {
        const isRelevantCategory = relevantCategories.some(relCat => categoryData.category.toLowerCase().includes(relCat.toLowerCase()) ||
            relCat.toLowerCase().includes(categoryData.category.toLowerCase()));
        if (isRelevantCategory) {
            // Add top products from this category
            const topProducts = categoryData.products
                .filter((product) => product.description && product.technicalSpecs.length > 0)
                .slice(0, 3); // Limit to top 3 products per category
            relevantProducts.push(...topProducts.map((product) => ({
                ...product,
                category: categoryData.category
            })));
        }
    });
    return relevantProducts.slice(0, 30); // Limit total products
};
// Create comprehensive Hilti Fleet Management prompt
const createBedrockPrompt = (projectData) => {
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
- **Existing Tools & Equipment**: ${projectData.existingTools.join(', ') || 'None specified'}
- **Special Requirements**: ${projectData.specialRequirements || 'None specified'}

## AVAILABLE HILTI PRODUCTS:
${productCatalogSection}

## TASK:
From the ACTUAL HILTI PRODUCTS listed above, select the most appropriate tools for this ${projectData.projectType} project with ${projectData.laborCount} workers over ${projectData.timeline} months.

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
let bedrockClient = null;
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
        }
        else {
            // AWS credentials incomplete, will use mock recommendations
        }
    }
    catch (error) {
        // Failed to initialize Bedrock client, using mock recommendations
    }
};
// Initialize on load
initializeBedrockClient();
// Main function to generate recommendations with enhanced catalog integration
export const generateBedrockRecommendations = async (projectData) => {
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
                role: 'user',
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
        // Received response from AWS Bedrock
        // Parse the JSON response
        let recommendations;
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
        }
        catch (parseError) {
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
    }
    catch (error) {
        console.error('❌ AWS Bedrock API Error, falling back to enhanced recommendations:', error);
        return await generateEnhancedMockRecommendations(projectData);
    }
};
// Enhanced mock recommendations with comprehensive Fleet Management intelligence
const generateEnhancedMockRecommendations = async (projectData) => {
    // Generating comprehensive Fleet Management recommendations
    // Helper function to calculate correct total cost
    const calculateTotalCost = (monthlyCost, quantity, duration) => {
        return monthlyCost * quantity * duration;
    };
    // Base recommendations with accurate Fleet Management pricing
    const baseRecommendations = [
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
    // Generated comprehensive Fleet Management recommendations
    // Enrich with real API pricing data and catalog fallback
    const enrichedRecommendations = await enrichRecommendationsWithPricing(baseRecommendations, hiltiCatalogData);
    return enrichedRecommendations;
};
/**
 * Enrich tool recommendations with real Hilti API pricing data
 */
async function enrichRecommendationsWithPricing(recommendations, catalogData) {
    try {
        // Create a lookup map to find catalog items by name/model
        const catalogLookup = new Map();
        catalogData.forEach(category => {
            category.products?.forEach((product) => {
                // Map by both name and sku for flexible lookup
                catalogLookup.set(product.name, product);
                catalogLookup.set(product.sku, product);
            });
        });
        // We need to find the correct product IDs that work with Hilti API
        // For now, let's try different ID formats and see which ones work
        const pricingRequests = [];
        for (const rec of recommendations) {
            // Try to find the product in catalog by name first, then by model/sku
            let catalogProduct = catalogLookup.get(rec.name) || catalogLookup.get(rec.model);
            if (!catalogProduct) {
                // Try partial name matching as fallback
                for (const [key, product] of catalogLookup.entries()) {
                    if (typeof key === 'string' && key.includes(rec.name.split(' ')[0])) {
                        catalogProduct = product;
                        break;
                    }
                }
            }
            if (catalogProduct) {
                // Use the API product IDs we extracted from tag_item_numbers
                if (catalogProduct.apiProductIds && catalogProduct.apiProductIds.length > 0) {
                    // Use the first API product ID
                    const productId = catalogProduct.apiProductIds[0];
                    pricingRequests.push({
                        productId: productId.toString(),
                        quantity: rec.quantity || 1
                    });
                    // Found catalog match and API product ID
                }
                else {
                    console.warn(`⚠️ No API product ID found for ${rec.name} in catalog`);
                }
            }
            else {
                console.warn(`⚠️ No catalog match found for ${rec.name}`);
            }
        }
        if (pricingRequests.length === 0) {
            console.warn('⚠️ No valid product IDs found for API pricing');
            return recommendations.map(rec => ({
                ...rec,
                pricing: null // No fake data - only real API data or null
            }));
        }
        // Fetching real prices from Hilti API
        // Fetch pricing data with retry logic and catalog fallback
        const pricingResults = await hiltiPricingService.fetchPricesWithRetry(pricingRequests, 2, catalogData);
        // Create pricing lookup map by product ID
        const pricingMap = new Map(pricingResults.map(p => [p.productId, p]));
        // Enrich recommendations with ONLY real API pricing - no fake data
        const enrichedRecommendations = recommendations.map(rec => {
            // Find the catalog product to get its API product ID
            let catalogProduct = catalogLookup.get(rec.name) || catalogLookup.get(rec.model);
            if (!catalogProduct) {
                for (const [key, product] of catalogLookup.entries()) {
                    if (typeof key === 'string' && key.includes(rec.name.split(' ')[0])) {
                        catalogProduct = product;
                        break;
                    }
                }
            }
            // Get real pricing if available
            let realPricing = null;
            if (catalogProduct?.apiProductIds?.length > 0) {
                const productId = catalogProduct.apiProductIds[0].toString();
                const pricing = pricingMap.get(productId);
                if (pricing && pricing.success) {
                    realPricing = {
                        standardPrice: pricing.standardPrice,
                        fleetMonthlyPrice: pricing.fleetMonthlyPrice,
                        fleetUpfrontCost: pricing.fleetUpfrontCost,
                        currency: pricing.currency,
                        priceSource: 'hilti_api'
                    };
                    // Real API price found
                }
            }
            if (realPricing) {
                // Use real fleet pricing if available, otherwise keep original estimated monthlyCost
                const realFleetMonthlyCost = realPricing.fleetMonthlyPrice > 0 ? realPricing.fleetMonthlyPrice : rec.monthlyCost;
                return {
                    ...rec,
                    monthlyCost: realFleetMonthlyCost,
                    totalCost: realFleetMonthlyCost * rec.quantity * rec.rentalDuration,
                    pricing: realPricing
                };
            }
            else {
                console.warn(`⚠️ No real API price found for ${rec.name} - excluding pricing data`);
                // NO fake pricing data - only return tool without pricing if no API data
                return {
                    ...rec,
                    // Keep original monthlyCost for calculations but don't add fake pricing object
                    pricing: null
                };
            }
        });
        const successCount = pricingResults.filter(p => p.success).length;
        // Successfully enriched recommendations with real API pricing
        return enrichedRecommendations;
    }
    catch (error) {
        console.error('❌ Error fetching real API pricing:', error);
        // NO fake data - return recommendations without pricing if API fails
        return recommendations.map(rec => ({
            ...rec,
            pricing: null
        }));
    }
}
export default generateBedrockRecommendations;
//# sourceMappingURL=bedrockClient.js.map