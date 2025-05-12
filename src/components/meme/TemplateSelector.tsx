
import React, { useState } from 'react';
import { MEME_TEMPLATES } from '@/lib/constants';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Maximize } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: any;
  setSelectedTemplate: (template: any) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, setSelectedTemplate }) => {
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  
  // Initialize selectedTemplate if it's null
  React.useEffect(() => {
    if (!selectedTemplate && MEME_TEMPLATES.length > 0) {
      setSelectedTemplate(MEME_TEMPLATES[0]);
    }
  }, [selectedTemplate, setSelectedTemplate]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
      {MEME_TEMPLATES.map((template) => (
        <div
          key={template.id}
          className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
            selectedTemplate && selectedTemplate.id === template.id
              ? 'border-brand-purple shadow-lg scale-105'
              : 'border-transparent hover:border-muted hover:scale-102'
          }`}
          onClick={() => setSelectedTemplate(template)}
          onMouseEnter={() => setPreviewTemplate(template)}
          onMouseLeave={() => setPreviewTemplate(null)}
        >
          <div className="relative h-full">
            <img
              src={template.url}
              alt={template.name}
              className="w-full h-full object-cover"
            />
            {selectedTemplate && selectedTemplate.id === template.id && (
              <div className="absolute inset-0 bg-brand-purple/20 flex items-center justify-center">
                <span className="bg-brand-purple text-white text-xs px-2 py-1 rounded">Selected</span>
              </div>
            )}

            {/* Preview button */}
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded hover:bg-black/90"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-80">
                <div className="p-1">
                  <img 
                    src={template.url} 
                    alt={template.name} 
                    className="w-full h-auto rounded"
                  />
                  <div className="p-2 text-center text-sm font-medium">
                    {template.name}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplateSelector;
