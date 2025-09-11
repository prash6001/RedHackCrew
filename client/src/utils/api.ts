// API Client for Hilti Fleet Management Server
// Enhanced API integration with comprehensive error handling

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export interface ProjectFormData {
  projectName: string;
  projectType: 'residential' | 'commercial' | 'infrastructure' | 'industrial' | 'renovation' | 'roadwork';
  location: string;
  laborCount: number;
  timeline: number;
  budget: number;
  existingTools: string[];
  specialRequirements?: string;
  projectComplexity: 'low' | 'medium' | 'high';
  blueprint?: File | string; // Either file or Gemini analysis text
}

export interface ToolRecommendation {
  id: string;
  name: string;
  model: string;
  description: string;
  quantity: number;
  monthlyCost: number;
  totalCost: number;
  rentalDuration: number;
  justification: string[];
  category: string;
  productUrl: string;
  specifications: string[];
  competitiveAdvantages?: string[];
  roi?: number;
  utilizationRate?: number;
  priority?: 'high' | 'medium' | 'standard';
  // Real pricing from Hilti API
  pricing?: {
    standardPrice: number;
    fleetMonthlyPrice: number;
    fleetUpfrontCost: number;
    currency: string;
    priceSource: 'hilti_api' | 'estimated' | 'catalog_updated';
  };
}

export interface ProjectAnalysis {
  project: {
    name: string;
    type: string;
    location: string;
    complexity: string;
    timeline: number;
    laborCount: number;
    budget: number;
    hasBlueprint: boolean;
  };
  analysis: {
    method: 'bedrock' | 'enhanced_rules';
    model: string;
    processingTime: number;
  };
  recommendations: ToolRecommendation[];
  financial: {
    totalInvestment: number;
    monthlyPayment: number;
    estimatedSavings: number;
    savingsPercentage: number;
    paybackPeriod: number;
    budgetUtilization: number;
  };
  metrics: {
    productivityIncrease: number;
    downtimeReduction: number;
    laborSavings: number;
    downtimeSavings: number;
    totalROI: number;
    netPresentValue: number;
    returnOnInvestment: number;
  };
  contract: {
    totalCost: number;
    monthlyCost: number;
    duration: number;
    estimatedSavings: number;
    benefits: string[];
    terms: string[];
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Enhanced API client with comprehensive error handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
      
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorDetails;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorDetails = errorData.details;
        } catch {
          // If JSON parsing fails, use the default error message
        }
        
        throw new ApiError(errorMessage, response.status, errorDetails);
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new ApiError(
          data.error || 'API request failed',
          response.status,
          data.details
        );
      }

      console.log(`✅ API Success: ${endpoint}`);
      return data.data as T;
      
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network errors, timeout, etc.
      console.error(`❌ API Error: ${endpoint}`, error);
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0,
        error
      );
    }
  }

  // Get server health and configuration
  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    version: string;
    services: Record<string, string>;
  }> {
    return this.request('/health');
  }

  // Get configuration data (project types, tools, etc.)
  async getConfig(): Promise<{
    projectTypes: Array<{ value: string; label: string; description: string }>;
    complexityLevels: Array<{ value: string; label: string; description: string }>;
    commonTools: string[];
    budgetRanges: Array<{ value: number; label: string }>;
  }> {
    return this.request('/api/config');
  }

  // Comprehensive project analysis with AI/Bedrock integration
  async analyzeProject(projectData: ProjectFormData): Promise<ProjectAnalysis> {
    const { blueprint } = projectData;
    
    // Check if blueprint is text (Gemini analysis) or file
    if (typeof blueprint === 'string') {
      // Send as JSON when blueprint is Gemini analysis text
      console.log('📄 Sending Gemini analysis text as blueprint');
      return this.request('/api/analyze', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
    } else {
      // Send as FormData when blueprint is a file
      console.log('📁 Sending blueprint file for analysis');
      const formData = new FormData();
      
      // Prepare project data (excluding blueprint file for JSON)
      const { blueprint: _, ...projectDetails } = projectData;
      formData.append('projectData', JSON.stringify(projectDetails));
      
      // Add blueprint file if present
      if (blueprint) {
        formData.append('blueprint', blueprint);
      }

      return this.request('/api/analyze', {
        method: 'POST',
        headers: {
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        body: formData,
      });
    }
  }

  // Generate fleet management proposal
  async generateProposal(data: {
    projectData: ProjectFormData;
    recommendations: ToolRecommendation[];
    contractTerm?: 12 | 24 | 36;
  }): Promise<{
    metadata: {
      generated: string;
      validUntil: string;
      proposalId: string;
      version: string;
    };
    project: ProjectFormData;
    contractOptions: Array<{
      term: number;
      monthlyRate: number;
      setupFee: number;
      totalCost: number;
      savings: string;
      benefits: string[];
      recommended?: boolean;
    }>;
    tools: ToolRecommendation[];
    servicePackage: {
      inclusions: string[];
      exclusions: string[];
    };
    timeline: Array<{
      phase: string;
      duration: string;
      description: string;
    }>;
    nextSteps: string[];
  }> {
    return this.request('/api/proposal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get detailed information about a specific tool
  async getToolDetails(toolId: string): Promise<{
    id: string;
    specifications: {
      detailed: boolean;
      dimensions: string;
      weight: string;
      powerSource: string;
      performance: string;
    };
    documentation: Array<{
      name: string;
      url: string;
    }>;
    training: Array<{
      name: string;
      duration: string;
      type: string;
    }>;
  }> {
    return this.request(`/api/tools/${toolId}`);
  }
}

// Create and export API client instance
export const api = new ApiClient();

// Export utility functions for error handling
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const handleApiError = (error: unknown): {
  message: string;
  status: number;
  details?: any;
} => {
  if (isApiError(error)) {
    return {
      message: error.message,
      status: error.status,
      details: error.details
    };
  }
  
  return {
    message: error instanceof Error ? error.message : 'Unknown error',
    status: 0
  };
};

// Retry utility for transient failures
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Only retry on network errors or 5xx server errors
      if (isApiError(error) && error.status >= 400 && error.status < 500) {
        break; // Don't retry client errors
      }
      
      console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  
  throw lastError;
};

export default api;