# Hilti Fleet Management Server

Enhanced server implementation with AWS Bedrock integration and comprehensive fleet management logic ported from FleetFlow-Hack.

## Features

- 🤖 **AWS Bedrock Integration** - Claude 3.5 Sonnet for AI-powered recommendations
- 📊 **Enhanced Recommendation Engine** - Sophisticated fleet management calculations
- 💼 **Comprehensive TCO Analysis** - Total Cost of Ownership with ROI metrics
- 🔧 **Fleet Contract Generation** - Professional fleet management proposals
- 📋 **Blueprint Processing** - AI analysis of construction documents
- 🛡️ **Security & Rate Limiting** - Production-ready API with proper security

## Quick Start

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your AWS credentials
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Build for Production**
```bash
npm run build
npm start
```

## Environment Variables

### Required
- `AWS_ACCESS_KEY_ID` - AWS access key for Bedrock
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for Bedrock
- `AWS_REGION` - AWS region (default: eu-central-1)

### Optional
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `CLIENT_URL` - CORS allowed origin (default: http://localhost:5173)
- `API_RATE_LIMIT` - Rate limit per 15 minutes (default: 100)

## API Endpoints

### Health & Config
- `GET /health` - Server health check
- `GET /api/config` - Configuration data (project types, tools, etc.)

### Main Features
- `POST /api/analyze` - Project analysis with AI recommendations
- `POST /api/proposal` - Generate fleet management proposals
- `GET /api/tools/:id` - Get detailed tool information

## Architecture

```
src/
├── index.ts              # Main server with Express setup
├── types/
│   └── ProjectData.ts    # TypeScript definitions
└── utils/
    ├── bedrockClient.ts  # AWS Bedrock integration
    ├── recommendationEngine.ts  # Fleet recommendations
    └── accurateCalculations.ts  # TCO & ROI calculations
```

## AWS Bedrock Setup

1. Create AWS account with Bedrock access
2. Enable Claude 3.5 Sonnet model in your region
3. Create IAM user with Bedrock permissions
4. Add credentials to `.env` file

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure proper CORS origins
3. Set up SSL/TLS termination
4. Configure rate limiting
5. Add monitoring and logging

## Development

- `npm run dev` - Development with auto-reload
- `npm run build` - TypeScript compilation
- `npm run lint` - Code linting
- `npm test` - Run tests (when implemented)

Built with Express, TypeScript, AWS SDK, and comprehensive security middleware.