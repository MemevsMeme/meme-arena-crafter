
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
              ? 'border-brand-purple shadow-md'
              : 'border-transparent hover:border-muted'
          }`}
          onClick={() => setSelectedTemplate(template)}
        >
          <img
            src={template.url}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default TemplateSelector;
