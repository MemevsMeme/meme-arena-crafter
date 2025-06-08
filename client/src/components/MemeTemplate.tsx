import { cn } from "@/lib/utils";
import { Template } from "@shared/schema";

interface MemeTemplateProps {
  template: Template;
  isSelected: boolean;
  onSelect: (template: Template) => void;
  label: string;
}

const MemeTemplate = ({ template, isSelected, onSelect, label }: MemeTemplateProps) => {
  return (
    <div 
      className={cn(
        "p-2 border rounded-lg bg-gray-50 cursor-pointer hover:border-primary transition",
        isSelected ? "border-primary border-2" : "border-gray-200"
      )}
      onClick={() => onSelect(template)}
    >
      <p className="text-sm font-medium mb-1">{label}</p>
      <img 
        src={template.imageUrl} 
        alt={template.name}
        className="w-full h-24 object-cover rounded" 
      />
    </div>
  );
};

export default MemeTemplate;
