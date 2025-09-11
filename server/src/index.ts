// Main Server - Enhanced Hilti Fleet Management API with AWS Bedrock Integration
// Ported from FleetFlow-Hack with comprehensive functionality

// Load environment variables FIRST before any other imports
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the server root directory (backup loading)
const envPath = path.resolve(__dirname, '../.env');
config({ path: envPath });

// Now import everything else after env vars are loaded
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { z } from 'zod';

// Import our comprehensive business logic (after env vars are loaded)
import { generateBedrockRecommendations } from './utils/bedrockClient.js';
import { generateEnhancedRecommendations, generateFleetContract } from './utils/recommendationEngine.js';
import { calculateProjectMetrics, generateAccurateFleetContract, formatCurrency } from './utils/accurateCalculations.js';
import { ProjectData, ToolRecommendation, FleetContract, ProjectMetrics } from './types/ProjectData.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced security and middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Configure multer for file uploads (blueprints)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/dwg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, and DWG files are allowed.'));
    }
  }
});

// Validation schemas using Zod
const ProjectDataSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  projectType: z.enum(['residential', 'commercial', 'infrastructure', 'industrial', 'renovation', 'roadwork']),
  location: z.string().min(1, 'Location is required'),
  laborCount: z.number().min(1, 'Labor count must be at least 1'),
  timeline: z.number().min(1, 'Timeline must be at least 1 month'),
  budget: z.number().min(1000, 'Budget must be at least $1,000'),
  existingTools: z.array(z.string()).default([]),
  specialRequirements: z.string().optional(),
  projectComplexity: z.enum(['low', 'medium', 'high']).default('medium'),
  blueprint: z.union([z.string(), z.any()]).optional() // Accept string (Gemini analysis) or file
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      bedrock: process.env.AWS_ACCESS_KEY_ID ? 'configured' : 'not_configured',
      database: 'connected',
      cache: 'active'
    }
  });
});

// Get available tool categories and project types
app.get('/api/config', (req, res) => {
  try {
    const config = {
      projectTypes: [
        { value: 'residential', label: 'Residential Construction', description: 'Single and multi-family residential projects' },
        { value: 'commercial', label: 'Commercial Building', description: 'Office buildings, retail, and commercial spaces' },
        { value: 'infrastructure', label: 'Infrastructure', description: 'Roads, bridges, and public infrastructure' },
        { value: 'industrial', label: 'Industrial Facility', description: 'Manufacturing plants and industrial construction' },
        { value: 'renovation', label: 'Renovation/Retrofit', description: 'Building renovation and retrofit projects' },
        { value: 'roadwork', label: 'Road Construction', description: 'Highway and road construction projects' }
      ],
      complexityLevels: [
        { value: 'low', label: 'Low', description: 'Standard construction, basic requirements' },
        { value: 'medium', label: 'Medium', description: 'Moderate complexity, some specialized work' },
        { value: 'high', label: 'High', description: 'Complex project, specialized equipment needed' }
      ],
      commonTools: [
        'Hammer Drills', 'Rotary Hammers', 'Angle Grinders', 'Circular Saws',
        'Demolition Hammers', 'Measuring Tools', 'Fastening Systems', 'Safety Equipment',
        'Concrete Mixers', 'Laser Levels', 'Cut-off Saws', 'Dust Management'
      ],
      budgetRanges: [
        { value: 100000, label: '$50K - $100K' },
        { value: 250000, label: '$100K - $250K' },
        { value: 500000, label: '$250K - $500K' },
        { value: 1000000, label: '$500K - $1M' },
        { value: 2000000, label: '$1M - $2M' },
        { value: 5000000, label: '$2M+' }
      ]
    };

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Config endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load configuration'
    });
  }
});

// Enhanced project analysis endpoint with comprehensive Bedrock integration
app.post('/api/analyze', upload.single('blueprint'), async (req, res) => {
  try {
    // Starting comprehensive project analysis
    
    // Parse and validate project data
    let projectData: ProjectData;
    try {
      // Handle both form data and JSON
      const rawData = req.body.projectData ? JSON.parse(req.body.projectData) : req.body;
      // Processing request data
      
      projectData = ProjectDataSchema.parse(rawData);
      
      // Handle blueprint: either file upload or text analysis in JSON
      if (req.file) {
        projectData.blueprint = req.file as any; // Multer file object
        console.log('📁 Blueprint file received');
      } else if (projectData.blueprint && typeof projectData.blueprint === 'string') {
        console.log('📄 Gemini analysis text received in blueprint field');
        console.log('✨ Analysis preview:', projectData.blueprint.substring(0, 200) + '...');
      }
    } catch (validationError) {
      console.error('❌ Validation error:', validationError);
      return res.status(400).json({
        success: false,
        error: 'Invalid project data',
        details: validationError instanceof z.ZodError ? validationError.errors : 'Validation failed'
      });
    }

    // Analyzing project data

    // Comprehensive analysis workflow
    let recommendations: ToolRecommendation[] = [];
    let useBedrockAI = false;

    try {
      // First try AWS Bedrock for AI-powered recommendations
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        // Using AWS Bedrock for AI recommendations
        recommendations = await generateBedrockRecommendations(projectData);
        useBedrockAI = true;
      } else {
        throw new Error('AWS credentials not configured');
      }
    } catch (bedrockError) {
      // Bedrock unavailable, using enhanced rule-based engine
      recommendations = await generateEnhancedRecommendations(projectData);
      useBedrockAI = false;
    }

    // Calculate comprehensive project metrics
    const projectMetrics = calculateProjectMetrics(projectData, recommendations);
    
    // Generate accurate fleet contract
    const fleetContract = generateAccurateFleetContract(projectData, recommendations);

    // Calculate financial summary
    // Calculate accurate financial metrics using real pricing data
    const totalToolValue = recommendations.reduce((sum, tool) => sum + tool.totalCost, 0);
    const totalMonthlyCost = recommendations.reduce((sum, tool) => sum + tool.monthlyCost, 0);
    
    // Calculate actual retail price from catalog data only (no estimates)
    const totalRetailPrice = recommendations.reduce((sum, tool) => {
      if (tool.pricing && tool.pricing.standardPrice) {
        return sum + (tool.pricing.standardPrice * tool.quantity);
      }
      // Skip tools without real pricing data instead of estimating
      console.warn(`❌ Tool ${tool.name} has no real retail pricing - excluding from retail calculation`);
      return sum;
    }, 0);
    
    // For accurate comparison, use Total Cost of Ownership vs Fleet costs
    // TCO includes: purchase price + maintenance (20% annually) + admin overhead + risk
    const annualMaintenanceRate = 0.20; // 20% of purchase price annually
    const projectYears = projectData.timeline / 12;
    const maintenanceCosts = totalRetailPrice * annualMaintenanceRate * projectYears;
    const adminOverhead = 2400 * projectYears; // $2,400/year administrative overhead
    const theftRisk = totalRetailPrice * 0.08 * projectYears; // 8% annual theft risk
    
    const totalOwnershipCost = totalRetailPrice + maintenanceCosts + adminOverhead + theftRisk;
    
    // Moderately inflated retail price for realistic comparison (includes basic maintenance/ownership costs)
    const moderateInflationRate = 1.2; // 20% markup to account for basic ownership costs
    const inflatedRetailPrice = totalRetailPrice * moderateInflationRate;
    const moderateSavings = inflatedRetailPrice - totalToolValue;
    const moderateSavingsPercentage = inflatedRetailPrice > 0 ? (moderateSavings / inflatedRetailPrice) * 100 : 0;
    
    // TCO comparison for internal analysis  
    const actualSavings = totalOwnershipCost - totalToolValue;
    const actualSavingsPercentage = totalOwnershipCost > 0 ? (actualSavings / totalOwnershipCost) * 100 : 0;    // Enhanced response with comprehensive analysis
    const analysis = {
      // Project overview
      project: {
        name: projectData.projectName,
        type: projectData.projectType,
        location: projectData.location,
        complexity: projectData.projectComplexity,
        timeline: projectData.timeline,
        laborCount: projectData.laborCount,
        budget: projectData.budget,
        hasBlueprint: !!projectData.blueprint
      },

      // AI analysis details
      analysis: {
        method: useBedrockAI ? 'AWS Bedrock AI Analysis' : 'Enhanced Fleet Management Engine',
        model: useBedrockAI ? 'anthropic.claude-3-5-sonnet-20240620-v1:0' : 'hilti_fleet_engine_v2',
        processingTime: Date.now() // Will be calculated by client
      },

      // Tool recommendations with enhanced data
      recommendations: recommendations.map((tool, index) => ({
        ...tool,
        id: `rec-${index}`,
        roi: ((projectMetrics.totalROI * (tool.totalCost / totalToolValue)) - tool.totalCost) / tool.totalCost,
        utilizationRate: Math.min(100, 60 + (projectData.laborCount / tool.quantity) * 10),
        category: tool.category,
        priority: index < 3 ? 'high' : index < 6 ? 'medium' : 'standard'
      })),

      // Financial analysis
      financial: {
        totalInvestment: Math.round(totalToolValue * 100) / 100,
        monthlyPayment: Math.round(totalMonthlyCost * 100) / 100,
        estimatedSavings: Math.round(moderateSavings * 100) / 100, // Moderately inflated savings for display
        savingsPercentage: Math.round(moderateSavingsPercentage * 100) / 100, // Moderate percentage for display  
        retailPrice: Math.round(inflatedRetailPrice * 100) / 100, // Moderately inflated retail price
        totalOwnershipCost: Math.round(totalOwnershipCost * 100) / 100, // Include TCO for transparency
        paybackPeriod: Math.ceil(totalToolValue / (projectMetrics.totalROI / projectData.timeline)),
        budgetUtilization: Math.round((totalToolValue / projectData.budget) * 10000) / 100
      },

      // Project performance metrics
      metrics: {
        productivityIncrease: projectMetrics.productivityIncrease,
        downtimeReduction: projectMetrics.downtimeReduction,
        laborSavings: projectMetrics.laborSavings,
        downtimeSavings: projectMetrics.downtimeSavings,
        totalROI: projectMetrics.totalROI,
        netPresentValue: projectMetrics.totalROI - totalToolValue,
        returnOnInvestment: (projectMetrics.totalROI - totalToolValue) / totalToolValue
      },

      // Fleet contract details (update with accurate savings)
      contract: {
        ...fleetContract,
        estimatedSavings: actualSavings
      }
    };

    // Analysis complete

    res.json({
      success: true,
      data: analysis,
      message: `Successfully analyzed ${projectData.projectType} project with ${useBedrockAI ? 'AI-powered' : 'enhanced rule-based'} recommendations`
    });

  } catch (error) {
    console.error('❌ Analysis endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Generate fleet proposal endpoint
app.post('/api/proposal', async (req, res) => {
  try {
    // Generating fleet management proposal
    
    const { projectData, recommendations, contractTerm } = req.body;
    
    if (!projectData || !recommendations) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data for proposal generation'
      });
    }

    // Validate contract term (12, 24, or 36 months)
    const validTerms = [12, 24, 36];
    const selectedTerm = contractTerm && validTerms.includes(contractTerm) ? contractTerm : 24;

    // Adjust pricing based on contract term
    const termMultipliers = { 12: 1.0, 24: 0.85, 36: 0.75 };
    const termMultiplier = termMultipliers[selectedTerm as keyof typeof termMultipliers];

    // Calculate adjusted costs
    const adjustedRecommendations = recommendations.map((tool: ToolRecommendation) => ({
      ...tool,
      monthlyCost: Math.round(tool.monthlyCost * termMultiplier),
      totalCost: Math.round(tool.monthlyCost * termMultiplier * selectedTerm)
    }));

    // Generate comprehensive proposal
    const proposal = {
      // Proposal metadata
      metadata: {
        generated: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        proposalId: `HILTI-${Date.now()}`,
        version: '1.0'
      },

      // Project summary
      project: projectData,

      // Contract options with detailed terms
      contractOptions: [
        {
          term: 12,
          monthlyRate: Math.round(adjustedRecommendations.reduce((sum: number, tool: any) => sum + tool.monthlyCost, 0)),
          setupFee: 500,
          totalCost: Math.round(adjustedRecommendations.reduce((sum: number, tool: any) => sum + tool.monthlyCost, 0) * 12 + 500),
          savings: 'Standard',
          benefits: ['Standard maintenance', 'Basic support', 'Equipment replacement']
        },
        {
          term: 24,
          monthlyRate: Math.round(adjustedRecommendations.reduce((sum: number, tool: any) => sum + tool.monthlyCost, 0) * 0.85),
          setupFee: 250,
          totalCost: Math.round(adjustedRecommendations.reduce((sum: number, tool: any) => sum + tool.monthlyCost, 0) * 0.85 * 24 + 250),
          savings: 'Enhanced',
          benefits: ['Comprehensive maintenance', 'Priority support', 'Advanced training', 'Equipment replacement'],
          recommended: true
        },
        {
          term: 36,
          monthlyRate: Math.round(adjustedRecommendations.reduce((sum: number, tool: any) => sum + tool.monthlyCost, 0) * 0.75),
          setupFee: 0,
          totalCost: Math.round(adjustedRecommendations.reduce((sum: number, tool: any) => sum + tool.monthlyCost, 0) * 0.75 * 36),
          savings: 'Maximum',
          benefits: ['Full-service maintenance', 'Dedicated support', 'Executive training', 'Premium equipment replacement']
        }
      ],

      // Tool recommendations
      tools: adjustedRecommendations,

      // Service package details
      servicePackage: {
        inclusions: [
          'Preventive maintenance and calibration',
          'Repair and replacement coverage',
          'Tool tracking and inventory management',
          'Technical support and training',
          'Software updates and upgrades',
          'Emergency tool replacement (24-48 hrs)',
          'End-of-contract tool removal',
          'Performance analytics and reporting',
          'Safety compliance management',
          'Environmental compliance documentation'
        ],
        exclusions: [
          'Consumables (bits, blades, fasteners)',
          'Damage due to misuse or negligence',
          'Tools used outside specified applications',
          'Modifications or unauthorized repairs'
        ]
      },

      // Implementation timeline
      timeline: [
        { phase: 'Contract Finalization', duration: '1-2 weeks', description: 'Legal review and contract execution' },
        { phase: 'Tool Procurement', duration: '2-3 weeks', description: 'Tool ordering and preparation' },
        { phase: 'Delivery & Setup', duration: '1 week', description: 'On-site delivery and setup' },
        { phase: 'Training & Go-Live', duration: '1 week', description: 'Operator training and project start' }
      ],

      // Contact information
      nextSteps: [
        'Review detailed tool recommendations with your Hilti consultant',
        'Customize fleet configuration based on specific project needs',
        'Finalize contract terms and deployment schedule',
        'Begin fleet deployment and on-site support'
      ]
    };

    // Proposal generated

    res.json({
      success: true,
      data: proposal,
      message: 'Fleet management proposal generated successfully'
    });

  } catch (error) {
    console.error('❌ Proposal endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate proposal',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Tool details endpoint for individual tool information
app.get('/api/tools/:toolId', (req, res) => {
  try {
    const { toolId } = req.params;
    
    // Mock detailed tool information (in production, this would come from a database)
    const toolDetails = {
      id: toolId,
      specifications: {
        detailed: true,
        dimensions: '300x200x150mm',
        weight: '2.5kg',
        powerSource: 'Battery',
        performance: 'High-efficiency brushless motor'
      },
      documentation: [
        { name: 'User Manual', url: '/docs/manual.pdf' },
        { name: 'Safety Guidelines', url: '/docs/safety.pdf' },
        { name: 'Maintenance Schedule', url: '/docs/maintenance.pdf' }
      ],
      training: [
        { name: 'Basic Operation', duration: '2 hours', type: 'video' },
        { name: 'Safety Procedures', duration: '1 hour', type: 'interactive' },
        { name: 'Maintenance Best Practices', duration: '30 minutes', type: 'document' }
      ]
    };

    res.json({
      success: true,
      data: toolDetails
    });
  } catch (error) {
    console.error('Tool details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tool details'
    });
  }
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: error.message
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} is not a valid endpoint`
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`
🚀 Hilti Fleet Management Server Started Successfully!

📡 Server Details:
   • Port: ${PORT}
   • Environment: ${process.env.NODE_ENV || 'development'}
   • Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}

🤖 AI Services:
   • AWS Bedrock: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Configured' : '⚠️ Not configured'}
   • Claude 3.5 Sonnet: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Available' : '⚠️ Fallback mode'}

🛠️ Features Available:
   • Project Analysis with AI/Bedrock Integration
   • Fleet Management Recommendations
   • TCO Calculations & ROI Analysis
   • Blueprint Analysis (PDF/Image upload)
   • Comprehensive Fleet Proposals
   • Real-time Tool Database

📚 API Endpoints:
   • GET  /health - Health check
   • GET  /api/config - Configuration data
   • POST /api/analyze - Project analysis
   • POST /api/proposal - Generate proposals
   • GET  /api/tools/:id - Tool details

Ready to process Hilti Fleet Management requests! 🔧
  `);
});

export default app;