import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

// Define the available AI style options
export const AI_STYLES = [
  { id: "photo", name: "Realistic Photo", description: "Photorealistic style with natural lighting and details" },
  { id: "cartoon", name: "Cartoon", description: "Stylized cartoon with bold colors and outlines" },
  { id: "pixel", name: "Pixel Art", description: "Retro pixel art like classic video games" },
  { id: "3d", name: "3D Render", description: "3D rendered image with depth and textures" },
  { id: "sketch", name: "Sketch", description: "Hand-drawn sketch or illustration style" },
  { id: "watercolor", name: "Watercolor", description: "Artistic watercolor painting style" },
  { id: "minimalist", name: "Minimalist", description: "Simple, clean design with minimal elements" },
  { id: "anime", name: "Anime", description: "Japanese anime and manga inspired style" },
  { id: "cyberpunk", name: "Cyberpunk", description: "Futuristic cyberpunk aesthetic with neon colors" },
  { id: "vintage", name: "Vintage", description: "Retro or vintage style with aged effects" },
];

interface StyleSelectorProps {
  selectedStyle: string;
  onChange: (style: string) => void;
}

export default function StyleSelector({ selectedStyle, onChange }: StyleSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedStyle}
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select style" />
        </SelectTrigger>
        <SelectContent>
          {AI_STYLES.map((style) => (
            <SelectItem key={style.id} value={style.id}>
              {style.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p className="text-sm font-medium">AI Style</p>
            <p className="text-xs text-muted-foreground">
              Select a visual style for the AI to use when generating your meme image
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}