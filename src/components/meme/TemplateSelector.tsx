
import React from 'react';
import { MEME_TEMPLATES } from '@/lib/constants';

interface TemplateSelectorProps {
  selectedTemplate: any;
  setSelectedTemplate: (template: any) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, setSelectedTemplate }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
      {MEME_TEMPLATES.map((template) => (
        <div
          key={template.id}
          className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
            selectedTemplate.id === template.id
              ? 'border-brand-purple shadow-lg scale-105'
              : 'border-transparent hover:border-muted hover:scale-102'
          }`}
          onClick={() => setSelectedTemplate(template)}
        >
          <div className="relative h-full">
            <img
              src={template.url}
              alt={template.name}
              className="w-full h-full object-cover"
            />
            {selectedTemplate.id === template.id && (
              <div className="absolute inset-0 bg-brand-purple/20 flex items-center justify-center">
                <span className="bg-brand-purple text-white text-xs px-2 py-1 rounded">Selected</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplateSelector;
