import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Shield,
  Clock,
  Loader2,
} from "lucide-react";
import ScopeOfWorkSelector from "../components/ScopeOfWorkSelector";
import BlueprintUploader from "../components/BlueprintUploader";

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [scopeDetails, setScopeDetails] = useState<
    { id: string; description: string }[]
  >([]);
  const [blueprint, setBlueprint] = useState<File | null>(null);
  const [projectDetails, setProjectDetails] = useState({
    name: "",
    projectType: "",
    duration: "",
    budget: "",
    teamSize: "",
    noOfFloors: "",
    complexity: "medium",
    existingTools: "",
  });
  const [geminiResult, setGeminiResult] = useState<unknown>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  const handleScopeDetailChange = (scopeId: string, description: string) => {
    setScopeDetails((prev) => {
      const existing = prev.find((detail) => detail.id === scopeId);
      if (existing) {
        return prev.map((detail) =>
          detail.id === scopeId ? { ...detail, description } : detail
        );
      } else {
        return [...prev, { id: scopeId, description }];
      }
    });
  };

  const handleScopeChange = (scopes: string[]) => {
    setSelectedScopes(scopes);
    // Remove scope details for unselected scopes
    setScopeDetails((prev) =>
      prev.filter((detail) => scopes.includes(detail.id))
    );
  };

  const validateScopeDetails = () => {
    if (selectedScopes.length === 0) return true; // No scopes selected, validation passes
    return selectedScopes.every((scopeId) => {
      const detail = scopeDetails.find((d) => d.id === scopeId);
      return detail && detail.description.trim().length > 0;
    });
  };

  const handleStartAnalysis = () => {
    const hasRequiredData = blueprint || selectedScopes.length > 0;
    const scopeDetailsValid = validateScopeDetails();
    if (hasRequiredData && scopeDetailsValid && projectDetails.name) {
      const combined: {
        projectDetails: typeof projectDetails;
        gemini?: unknown;
        scopeDetails?: { id: string; description: string }[];
      } = {
        projectDetails,
      };

      // Only add gemini if it's not null
      if (geminiResult !== null) {
        combined.gemini = geminiResult;
      }

      // Only add scopeDetails if it has content
      if (scopeDetails && scopeDetails.length > 0) {
        combined.scopeDetails = scopeDetails;
      }

      console.log("--- Combined Project Details and Additional Data ---");
      console.log(combined);
      navigate("/analysis", {
        state: {
          selectedScopes,
          scopeDetails,
          projectDetails,
          blueprint,
          geminiResult,
        },
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Optimize Your Fleet with
          <span className="text-[#e30613] block">
            AI-Powered Recommendations
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Analyze project requirements, get intelligent tool recommendations,
          and create tailored fleet contracts with significant cost savings and
          productivity gains.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Cost Savings</span>
          </div>
          <div className="flex items-center text-blue-600">
            <TrendingUp className="h-5 w-5 mr-2" />
            <span className="font-medium">Productivity Increase</span>
          </div>
          <div className="flex items-center text-purple-600">
            <Shield className="h-5 w-5 mr-2" />
            <span className="font-medium">Complete Service Coverage</span>
          </div>
        </div>
      </div>

      {/* Project Setup */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Configure Your Project Requirements
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Project Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Project Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={projectDetails.name}
                onChange={(e) =>
                  setProjectDetails((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e30613] focus:border-[#e30613] transition-colors"
                placeholder="Enter your project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Type *
              </label>
              <select
                value={projectDetails.projectType}
                onChange={(e) =>
                  setProjectDetails((prev) => ({
                    ...prev,
                    projectType: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e30613] focus:border-[#e30613]"
              >
                <option value="">Select project type</option>
                <option value="residential">Residential Construction</option>
                <option value="commercial">Commercial Buildings</option>
                <option value="infrastructure">Infrastructure & Civil</option>
                <option value="industrial">Industrial & Manufacturing</option>
                <option value="renovation">Renovation & Retrofit</option>
                <option value="specialty">Specialty Construction</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (months)
                </label>
                <input
                  type="number"
                  min="0"
                  value={projectDetails.duration}
                  onChange={(e) =>
                    setProjectDetails((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e30613] focus:border-[#e30613]"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Size
                </label>
                <input
                  type="number"
                  min="0"
                  value={projectDetails.teamSize}
                  onChange={(e) =>
                    setProjectDetails((prev) => ({
                      ...prev,
                      teamSize: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e30613] focus:border-[#e30613]"
                  placeholder="8"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number Of Floors
              </label>
              <input
                type="number"
                min="0"
                value={projectDetails.noOfFloors}
                onChange={(e) =>
                  setProjectDetails((prev) => ({
                    ...prev,
                    noOfFloors: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e30613] focus:border-[#e30613]"
                placeholder="8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <select
                value={projectDetails.budget}
                onChange={(e) =>
                  setProjectDetails((prev) => ({
                    ...prev,
                    budget: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e30613] focus:border-[#e30613]"
              >
                <option value="">Select budget range</option>
                <option value="25k-50k">$25k - $50k</option>
                <option value="50k-100k">$50k - $100k</option>
                <option value="100k-250k">$100k - $250k</option>
                <option value="250k-500k">$250k - $500k</option>
                <option value="500k-1m">$500k - $1M</option>
                <option value="1m-2.5m">$1M - $2.5M</option>
                <option value="2.5m-5m">$2.5M - $5M</option>
                <option value="5m+">$5M+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Complexity
              </label>
              <select
                value={projectDetails.complexity}
                onChange={(e) =>
                  setProjectDetails((prev) => ({
                    ...prev,
                    complexity: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e30613] focus:border-[#e30613]"
              >
                <option value="low">Low - Standard construction</option>
                <option value="medium">Medium - Commercial projects</option>
                <option value="high">High - Complex infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Tools Information
              </label>
              <textarea
                value={projectDetails.existingTools}
                onChange={(e) =>
                  setProjectDetails((prev) => ({
                    ...prev,
                    existingTools: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e30613] focus:border-[#e30613] h-24 resize-none"
                placeholder="List any existing tools, brands, or equipment you currently own (e.g., 5x Bosch drills, 2x DeWalt saws, etc.)"
              />
              <p className="text-xs text-gray-500 mt-1">
                This helps our AI optimize recommendations and avoid duplicating
                tools you already have
              </p>
            </div>
          </div>

          {/* Blueprint Upload or Scope of Work */}
          <div>
            {!blueprint ? (
              <>
                <BlueprintUploader
                  blueprint={blueprint}
                  onBlueprintChange={setBlueprint}
                  onGeminiResponse={setGeminiResult}
                  onLoadingChange={setIsGeminiLoading}
                />
                <div className="mt-8">
                  <div className="flex items-center mb-4">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-sm text-gray-500 bg-white">
                      OR
                    </span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-6">
                    Manual Scope Selection *
                  </h3>
                  <ScopeOfWorkSelector
                    selectedScopes={selectedScopes}
                    scopeDetails={scopeDetails}
                    onScopeChange={handleScopeChange}
                    onScopeDetailChange={handleScopeDetailChange}
                  />
                </div>
              </>
            ) : (
              <BlueprintUploader
                blueprint={blueprint}
                onBlueprintChange={setBlueprint}
                onGeminiResponse={setGeminiResult}
                onLoadingChange={setIsGeminiLoading}
              />
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleStartAnalysis}
            disabled={
              (!blueprint && selectedScopes.length === 0) ||
              !projectDetails.name ||
              !projectDetails.projectType ||
              !validateScopeDetails() ||
              isGeminiLoading
            }
            className="inline-flex items-center px-8 py-4 bg-[#e30613] text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isGeminiLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Blueprint...
              </>
            ) : (
              <>
                Start Fleet Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            {isGeminiLoading
              ? "AI is analyzing your blueprint. Please wait..."
              : blueprint
              ? "AI will analyze your blueprint and generate recommendations"
              : selectedScopes.length > 0
              ? "Please provide detailed descriptions for all selected scopes"
              : "Select scopes and provide descriptions, or upload a blueprint"}
          </p>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cost Optimization
          </h3>
          <p className="text-gray-600">
            Fleet contracts reduce tool costs compared to individual purchases,
            with predictable monthly payments.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Productivity Gains
          </h3>
          <p className="text-gray-600">
            Right-sized fleets ensure optimal tool availability, reducing
            downtime and increasing project efficiency.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Complete Service
          </h3>
          <p className="text-gray-600">
            Full maintenance, repair, and replacement coverage included. No
            unexpected costs or project delays.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
