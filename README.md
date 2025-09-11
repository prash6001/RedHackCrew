# Hilti Fleet Management System

Complete client-server application with AWS Bedrock AI integration for intelligent construction tool recommendations and fleet management proposals. All FleetFlow-Hack functionality has been successfully ported to this architecture.

## 🎯 Project Overview

This system provides:
- **AI-Powered Tool Recommendations** using AWS Bedrock Claude 3.5 Sonnet
- **Comprehensive Fleet Management** with TCO analysis and ROI calculations
- **Blueprint Analysis** with intelligent scope detection
- **Professional Proposals** with detailed contract terms and pricing
- **Client-Server Architecture** with minimal client-side logic and comprehensive server-side intelligence

## 🏗️ Architecture

```
RedHackCrew/
├── client/          # React frontend (minimal logic, API calls)
├── server/          # Node.js backend (all business logic)
└── FleetFlow-Hack/  # Original implementation (can be removed)
```

## 🚀 Quick Start

### 1. Start the Server (Required)

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your AWS Bedrock credentials
npm run dev
```

The server will start at `http://localhost:3001`

### 2. Start the Client

```bash
cd client
npm install
cp .env.example .env  # Optional: customize API URL
npm run dev
```

The client will start at `http://localhost:5173`

## 🔧 Configuration

### Server Environment (.env)
```bash
# AWS Bedrock Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=eu-central-1

# Server Configuration
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Client Environment (Optional)
```bash
# API Server URL
VITE_API_URL=http://localhost:3001
```

## 📊 Features Ported from FleetFlow-Hack

### ✅ Complete AWS Bedrock Integration
- Claude 3.5 Sonnet AI model
- Intelligent tool matching
- Comprehensive prompts with product catalogs
- Fallback to enhanced rule-based engine

### ✅ Advanced Recommendation Engine
- Project type optimization (residential, commercial, industrial, etc.)
- Labor count and timeline calculations
- Complexity-based adjustments
- Existing tool filtering

### ✅ Comprehensive Fleet Management
- Total Cost of Ownership (TCO) analysis
- Return on Investment (ROI) calculations
- Contract term optimization (12, 24, 36 months)
- Productivity and downtime metrics

### ✅ Enhanced Calculations
- Project metrics calculation
- Accurate fleet pricing models
- Financial impact analysis
- Risk assessment

### ✅ Professional UI Components
- Project analysis with real-time progress
- Tool recommendations with specifications
- Savings and productivity charts
- Fleet proposal generation

## 🤖 AI Integration

### AWS Bedrock Claude 3.5 Sonnet
- **Model**: `anthropic.claude-3-5-sonnet-20240620-v1:0`
- **Purpose**: Intelligent tool recommendations based on project requirements
- **Fallback**: Enhanced rule-based engine when Bedrock unavailable
- **Data**: Real Hilti product catalog with 30+ tools

### Blueprint Analysis
- Upload PDF, JPG, PNG, or DWG files
- AI-powered scope detection
- Enhanced recommendations based on document analysis

## 📈 Business Logic

### Project Analysis Workflow
1. **Data Collection** - Project details, team size, timeline, complexity
2. **AI Processing** - Bedrock analysis or enhanced rules
3. **Tool Matching** - Catalog filtering and optimization
4. **Financial Calculation** - TCO, ROI, productivity metrics
5. **Proposal Generation** - Professional fleet management contracts

### Fleet Management Benefits
- **Capital Preservation** - OpEx vs CapEx transformation
- **Risk Mitigation** - 80% theft coverage, maintenance included
- **Productivity Gains** - 25-45% improvement vs ownership
- **Service Guarantees** - 24-hour replacement, unlimited repairs

## 🔍 API Documentation

### Key Endpoints

```typescript
// Project analysis with AI recommendations
POST /api/analyze
{
  projectData: ProjectFormData,
  blueprint?: File
}

// Generate fleet management proposal
POST /api/proposal
{
  projectData: ProjectFormData,
  recommendations: ToolRecommendation[],
  contractTerm?: 12 | 24 | 36
}

// Server health and configuration
GET /health
GET /api/config
```

## 🛠️ Development

### Server Development
```bash
cd server
npm run dev     # Development with auto-reload
npm run build   # TypeScript compilation
npm run lint    # Code linting
```

### Client Development
```bash
cd client
npm run dev     # Vite dev server
npm run build   # Production build
npm run lint    # ESLint
```

## 🔒 Security Features

- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS Protection** - Configured origins only
- **Helmet Security** - Security headers
- **Input Validation** - Zod schema validation
- **File Upload Security** - Type validation, size limits

## 🌟 Key Improvements Over FleetFlow-Hack

1. **Separation of Concerns** - Clean client-server architecture
2. **Enhanced Error Handling** - Comprehensive API error management
3. **Better Security** - Production-ready security middleware
4. **Scalability** - Server can handle multiple clients
5. **Maintainability** - TypeScript, proper structure, documentation
6. **Flexibility** - API-driven, can support mobile apps, integrations

## 📋 Next Steps

1. **Remove FleetFlow-Hack** - All functionality successfully ported
2. **Configure AWS Credentials** - Set up Bedrock access
3. **Customize Branding** - Update UI colors, logos, content
4. **Add Tests** - Unit and integration testing
5. **Deploy** - Production deployment with monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper TypeScript types
4. Test both client and server
5. Submit pull request

---

**Status**: ✅ Complete - FleetFlow-Hack functionality fully ported to client-server architecture with enhanced features and AWS Bedrock integration.