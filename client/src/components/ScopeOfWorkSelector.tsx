import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const scopeOfWork = [
  {
    id: 'heavy-drilling',
    name: 'Heavy Drilling / Chiseling',
    description: 'High-power drilling and demolition work',
    icon: '🔨',
    tools: ['TE 3000-AVR', 'TE 1000-AVR', 'TE 70-ATC/AVR']
  },
  {
    id: 'diamond-coring',
    name: 'Diamond Coring',
    description: 'Precision concrete coring and cutting',
    icon: '💎',
    tools: ['DD 120', 'DD 160', 'DD 200']
  },
  {
    id: 'concrete-cutting',
    name: 'Concrete / Rebar Cutting',
    description: 'Heavy-duty concrete and rebar cutting',
    icon: '⚡',
    tools: ['DSH 700-X', 'DSH 900-X', 'DC-SE 20']
  },
  {
    id: 'indoor-cutting',
    name: 'Indoor Cutting (Cordless)',
    description: 'Battery-powered cutting for indoor use',
    icon: '🔋',
    tools: ['SCO 6-22', 'WSC 6.5-125', 'AG 4S-22']
  },
  {
    id: 'layout-leveling',
    name: 'Layout / Leveling',
    description: 'Precision measurement and alignment',
    icon: '📐',
    tools: ['PM 40-MG', 'PR 30-HVS', 'PD-I']
  },
  {
    id: 'fastening',
    name: 'Fastening / Nails',
    description: 'High-speed fastening solutions',
    icon: '🔩',
    tools: ['GX 3', 'DX 460', 'BX 3-ME']
  },
  {
    id: 'demolition',
    name: 'Demolition',
    description: 'Heavy demolition and breaking',
    icon: '🏗️',
    tools: ['TE 3000-AVR', 'TE 1500-AVR', 'TE 2000-22']
  }
];

interface ScopeOfWorkSelectorProps {
  selectedScopes: string[];
  onScopeChange: (scopes: string[]) => void;
}

const ScopeOfWorkSelector: React.FC<ScopeOfWorkSelectorProps> = ({
  selectedScopes,
  onScopeChange
}) => {
  const toggleScope = (scopeId: string) => {
    if (selectedScopes.includes(scopeId)) {
      onScopeChange(selectedScopes.filter(id => id !== scopeId));
    } else {
      onScopeChange([...selectedScopes, scopeId]);
    }
  };

  return (
    <div className="space-y-3">
      {scopeOfWork.map((scope) => {
        const isSelected = selectedScopes.includes(scope.id);
        return (
          <div
            key={scope.id}
            onClick={() => toggleScope(scope.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              isSelected
                ? 'border-[#e30613] bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                {isSelected ? (
                  <CheckCircle className="h-5 w-5 text-[#e30613]" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{scope.icon}</span>
                  <h4 className={`font-medium ${isSelected ? 'text-[#e30613]' : 'text-gray-900'}`}>
                    {scope.name}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{scope.description}</p>
                <div className="flex flex-wrap gap-1">
                  {scope.tools.map((tool) => (
                    <span
                      key={tool}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScopeOfWorkSelector;