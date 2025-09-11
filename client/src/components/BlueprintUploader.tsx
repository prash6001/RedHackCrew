// Gemini API request function
async function sendToGemini({
  accessToken,
  promptText,
  base64Data,
  mimeType,
}: {
  accessToken: string;
  promptText: string;
  base64Data: string;
  mimeType: string;
}) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: {
        "X-goog-api-key": `${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: `${mimeType}`,
                  data: `${base64Data}`,
                },
              },
              {
                text: `${promptText}`,
              },
            ],
          },
        ],
      }),
    }
  );
  const result = await response.json();
  const geminiText =
    result?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No Gemini response text found.";
  console.log("Gemini API response text:", geminiText);
  return result;
}

import React, { useCallback, useRef } from "react";
import { Upload, FileImage, X, CheckCircle } from "lucide-react";

interface BlueprintUploaderProps {
  blueprint: File | null;
  onBlueprintChange: (file: File | null) => void;
  onGeminiResponse?: (response: any) => void;
}

const BlueprintUploader: React.FC<BlueprintUploaderProps> = ({
  blueprint,
  onBlueprintChange,
  onGeminiResponse,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (allowedTypes.includes(file.type)) {
          const base64 = await fileToBase64(file);
          const pureBase64 = base64.split(",")[1] || base64;
          onBlueprintChange(file);
          
          // Try to call Gemini API if configured
          const accessToken = import.meta.env.VITE_GEMINI_API_TOKEN;
          if (!accessToken) {
            console.warn("Gemini API token not configured. Blueprint uploaded without AI analysis.");
            return;
          }
          
          try {
            console.log("Calling Gemini API for blueprint analysis...");
            const promptText = import.meta.env.VITE_PROMPT_TEXT;
            console.log("🔍 Prompt text from env:", promptText);
            
            if (!promptText) {
              console.warn("VITE_PROMPT_TEXT not found, using fallback prompt");
            }
            
            // Use enhanced directive prompt to force concrete analysis
            const finalPrompt = promptText || `ANALYZE THIS BLUEPRINT AND EXTRACT SPECIFIC CONSTRUCTION REQUIREMENTS:

You are a construction equipment expert analyzing a building blueprint. You MUST analyze the actual blueprint image and provide concrete, actionable information for tool selection.

DO NOT ask questions. DO NOT request more information. ANALYZE WHAT YOU SEE IN THE BLUEPRINT.

**REQUIRED ANALYSIS OUTPUT:**

1. **STRUCTURAL ELEMENTS IDENTIFIED:**
   - What materials are shown? (concrete, steel, masonry, wood, etc.)
   - What structural systems are visible? (foundations, walls, beams, slabs, etc.)

2. **CONSTRUCTION OPERATIONS REQUIRED:**
   - Drilling needs: How many holes/anchors are specified? What sizes?
   - Cutting requirements: Any openings, modifications, or demolition work?
   - Fastening work: What attachment methods are shown?
   - Measuring/layout: What precision work is required?

3. **WORK ENVIRONMENT:**
   - Indoor or outdoor work areas?
   - Multi-story or single level?
   - Access limitations or space constraints?
   - Safety considerations?

4. **SPECIFIC HILTI TOOL REQUIREMENTS:**
   Based on what you see in the blueprint, identify specific tool needs:
   - Heavy drilling (rotary hammers for concrete)
   - Cutting tools (saws for openings)
   - Measuring equipment (levels for layout)
   - Safety equipment (dust management)
   - Fastening tools (for connections)

**CRITICAL:** Provide specific, concrete observations from the blueprint. Do not provide generic advice or ask for more information. Extract actionable construction requirements that can guide tool selection.

**FORMAT YOUR RESPONSE AS:**
BLUEPRINT ANALYSIS RESULTS:
[Provide detailed analysis based on actual blueprint content]

CONSTRUCTION REQUIREMENTS IDENTIFIED:
- [Specific requirement 1 based on blueprint]
- [Specific requirement 2 based on blueprint]
- [etc.]

RECOMMENDED TOOL CATEGORIES:
- [Tool category 1] for [specific blueprint requirement]
- [Tool category 2] for [specific blueprint requirement]
- [etc.]`;
            console.log("📝 Using enhanced directive prompt");
            
            const mimeType = file.type;
            const result = await sendToGemini({
              accessToken,
              promptText: finalPrompt,
              base64Data: pureBase64,
              mimeType,
            });
            if (onGeminiResponse) {
              onGeminiResponse(result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No Gemini response text found.");
            }
          } catch (error) {
            console.error("Gemini API call failed:", error);
            // Blueprint is still uploaded, just without AI analysis
          }
        }
      }
    },
    [onBlueprintChange, allowedTypes, onGeminiResponse]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (allowedTypes.includes(file.type)) {
        const base64 = await fileToBase64(file);
        const pureBase64 = base64.split(",")[1] || base64;
        onBlueprintChange(file);
        
        // Try to call Gemini API if configured
        const accessToken = import.meta.env.VITE_GEMINI_API_TOKEN;
        if (!accessToken) {
          console.warn("Gemini API token not configured. Blueprint uploaded without AI analysis.");
          return;
        }
        
        try {
          console.log("Calling Gemini API for blueprint analysis...");
          const promptText = import.meta.env.VITE_PROMPT_TEXT;
          console.log("🔍 Prompt text from env:", promptText);
          
          if (!promptText) {
            console.warn("VITE_PROMPT_TEXT not found, using fallback prompt");
          }
          
          // Use enhanced directive prompt to force concrete analysis
          const finalPrompt = promptText || `ANALYZE THIS BLUEPRINT AND EXTRACT SPECIFIC CONSTRUCTION REQUIREMENTS:

You are a construction equipment expert analyzing a building blueprint. You MUST analyze the actual blueprint image and provide concrete, actionable information for tool selection.

DO NOT ask questions. DO NOT request more information. ANALYZE WHAT YOU SEE IN THE BLUEPRINT.

**REQUIRED ANALYSIS OUTPUT:**

1. **STRUCTURAL ELEMENTS IDENTIFIED:**
   - What materials are shown? (concrete, steel, masonry, wood, etc.)
   - What structural systems are visible? (foundations, walls, beams, slabs, etc.)

2. **CONSTRUCTION OPERATIONS REQUIRED:**
   - Drilling needs: How many holes/anchors are specified? What sizes?
   - Cutting requirements: Any openings, modifications, or demolition work?
   - Fastening work: What attachment methods are shown?
   - Measuring/layout: What precision work is required?

3. **WORK ENVIRONMENT:**
   - Indoor or outdoor work areas?
   - Multi-story or single level?
   - Access limitations or space constraints?
   - Safety considerations?

4. **SPECIFIC HILTI TOOL REQUIREMENTS:**
   Based on what you see in the blueprint, identify specific tool needs:
   - Heavy drilling (rotary hammers for concrete)
   - Cutting tools (saws for openings)
   - Measuring equipment (levels for layout)
   - Safety equipment (dust management)
   - Fastening tools (for connections)

**CRITICAL:** Provide specific, concrete observations from the blueprint. Do not provide generic advice or ask for more information. Extract actionable construction requirements that can guide tool selection.

**FORMAT YOUR RESPONSE AS:**
BLUEPRINT ANALYSIS RESULTS:
[Provide detailed analysis based on actual blueprint content]

CONSTRUCTION REQUIREMENTS IDENTIFIED:
- [Specific requirement 1 based on blueprint]
- [Specific requirement 2 based on blueprint]
- [etc.]

RECOMMENDED TOOL CATEGORIES:
- [Tool category 1] for [specific blueprint requirement]
- [Tool category 2] for [specific blueprint requirement]
- [etc.]`;
          console.log("📝 Using enhanced directive prompt");
          
          const mimeType = file.type;
          const result = await sendToGemini({
            accessToken,
            promptText: finalPrompt,
            base64Data: pureBase64,
            mimeType,
          });
          if (onGeminiResponse) {
            onGeminiResponse(result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No Gemini response text found.");
          }
        } catch (error) {
          console.error("Gemini API call failed:", error);
          // Blueprint is still uploaded, just without AI analysis
        }
      }
    }
  };

  const removeBlueprint = () => {
    onBlueprintChange(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
        Project Blueprint (Optional)
      </h3>

      {!blueprint ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#e30613] transition-colors cursor-pointer"
        >
          <input
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="blueprint-upload"
            ref={fileInputRef}
          />
          <label htmlFor="blueprint-upload" className="cursor-pointer block">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Upload Project Blueprint
            </h4>
            <p className="text-gray-600 mb-4">
              Drag and drop your blueprint here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports: JPG, PNG, PDF (Max 10MB)
            </p>
            <button
              type="button" 
              className="mt-4 inline-flex items-center px-4 py-2 bg-[#e30613] text-white rounded-lg hover:bg-red-700 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </button>
          </label>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileImage className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">{blueprint.name}</h4>
                <p className="text-sm text-green-700">
                  {formatFileSize(blueprint.size)} • Uploaded successfully
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <button
                onClick={removeBlueprint}
                className="p-1 text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  AI Blueprint Analysis Enabled
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Our AI will analyze your blueprint to automatically determine
                  scope of work, project complexity, and recommend optimal tools
                  for your specific requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {blueprint && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">What happens next:</p>
          <ul className="space-y-1 text-xs">
            <li>• AI analyzes blueprint dimensions and structural elements</li>
            <li>
              • Automatically identifies required work types and complexity
            </li>
            <li>• Calculates optimal tool quantities based on project scale</li>
            <li>• Generates customized fleet recommendations</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default BlueprintUploader;
