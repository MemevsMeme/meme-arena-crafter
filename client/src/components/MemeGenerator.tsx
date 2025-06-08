import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import MemeTemplate from "./MemeTemplate";
import MemeEditor from "./MemeEditor";
import StyleSelector, { AI_STYLES } from "./StyleSelector";
import BasicSoundboard from "./BasicSoundboard";
import { Template } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, LogIn, Music, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface MemeGeneratorProps {
  templates: Template[];
  challengeId?: number | null;
  challengePrompt?: string;
  isBattle?: boolean;
}

type CreationMode = "ai" | "template" | "upload";
type EditorMode = "image" | "sound";

const MemeGenerator = ({ templates, challengeId, challengePrompt, isBattle = false }: MemeGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [creationMode, setCreationMode] = useState<CreationMode>("ai");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("image");
  const [attachedSounds, setAttachedSounds] = useState<string[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("photo");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const memeTemplates = templates.filter(t => t.type === "template");
  const reactionImages = templates.filter(t => t.type === "reaction");

  const handleGenerate = async () => {
    // Check authentication for AI generation (due to API requirements)
    if (creationMode === "ai") {
      // Check if logged in first (for server-side authentication)
      try {
        const authCheck = await fetch("/api/auth/user");
        if (!authCheck.ok) {
          toast({
            title: "Authentication required",
            description: "Please log in to generate AI memes.",
            variant: "destructive",
          });
          setTimeout(() => {
            // Redirect to auth page
            setLocation("/auth");
          }, 1500);
          return;
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        toast({
          title: "Authentication error",
          description: "Please log in to generate AI memes.",
          variant: "destructive",
        });
        return;
      }
    }

    // Validation based on creation mode
    if (creationMode === "ai" && !prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a meme description first.",
        variant: "destructive",
      });
      return;
    }

    if (creationMode === "template" && !selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a template first.",
        variant: "destructive",
      });
      return;
    }

    if (creationMode === "upload" && !selectedFile) {
      toast({
        title: "No image selected",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Handle upload mode separately
    if (creationMode === "upload" && uploadPreview) {
      setGeneratedImageUrl(uploadPreview);
      setShowEditor(true);
      setIsGenerating(false);
      return;
    }
    
    // Handle AI or template based generation
    try {
      const templateId = (creationMode === "template" && selectedTemplate) 
        ? selectedTemplate.id 
        : null;
      
      const response = await fetch("/api/memes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptText: prompt,
          templateId,
          generationType: creationMode,
          style: selectedStyle
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate meme: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setShowEditor(true);
      } else {
        throw new Error("No image URL received from server");
      }
    } catch (error) {
      console.error("Error generating meme:", error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your meme. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const [_, setLocation] = useLocation();

  // Use challenge prompt if provided
  useEffect(() => {
    if (challengePrompt) {
      setPrompt(challengePrompt);
      console.log("Setting prompt from challenge:", challengePrompt);
    }
  }, [challengePrompt]);
  
  const handleSaveMeme = async (editedImageUrl: string) => {
    try {
      // For challenge submissions, use the specific challenge submission endpoint
      if (challengeId) {
        const response = await fetch(`/api/daily-challenges/${challengeId}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            promptText: prompt,
            imageUrl: editedImageUrl,
            // Include sounds if any are attached
            soundEffects: attachedSounds.length > 0 ? attachedSounds : undefined
          })
        });
        
        if (!response.ok) {
          throw new Error("Failed to submit to challenge");
        }
        
        toast({
          title: isBattle ? "Battle entry submitted!" : "Challenge entry submitted!",
          description: attachedSounds.length > 0
            ? `Your meme with ${attachedSounds.length} sound effect${attachedSounds.length !== 1 ? 's' : ''} has been submitted!`
            : isBattle 
              ? "Your meme has been submitted to the battle successfully!" 
              : "Your entry for the daily challenge has been submitted successfully."
        });
      } else {
        // Regular meme creation
        const memeData = {
          promptText: prompt,
          imageUrl: editedImageUrl,
          templateId: selectedTemplate?.id || null,
          // Include sounds if any are attached
          soundEffects: attachedSounds.length > 0 ? attachedSounds : undefined
        };
        
        const response = await fetch("/api/memes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(memeData)
        });
        
        if (!response.ok) {
          throw new Error("Failed to save meme");
        }
        
        toast({
          title: "Meme created!",
          description: attachedSounds.length > 0
            ? `Your meme with ${attachedSounds.length} sound effect${attachedSounds.length !== 1 ? 's' : ''} has been added to the gallery!`
            : "Your meme has been created and added to the gallery."
        });
      }
      
      // Reset form
      setPrompt("");
      setSelectedTemplate(null);
      setSelectedFile(null);
      setUploadPreview(null);
      setGeneratedImageUrl(null);
      setShowEditor(false);
      setAttachedSounds([]);
      
      // Refresh memes data
      queryClient.invalidateQueries({ queryKey: ["/api/memes"] });
      
      // If this was for a challenge, also invalidate challenge queries
      if (challengeId) {
        queryClient.invalidateQueries({ queryKey: ['/api/daily-challenges'] });
        queryClient.invalidateQueries({ queryKey: ['/api/daily-challenges', challengeId] });
        
        // Redirect to the challenge page
        setTimeout(() => {
          setLocation(`/daily-challenge/${challengeId}`);
        }, 1500);
      }
      
    } catch (error) {
      toast({
        title: "Save failed",
        description: "There was an error saving your meme. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setIsGenerating(false);
    setGeneratedImageUrl(null);
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setCreationMode("template");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
      {showEditor && generatedImageUrl ? (
        <div className="space-y-6">
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Edit Image
              </TabsTrigger>
              <TabsTrigger value="sound" className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Add Sounds
              </TabsTrigger>
            </TabsList>
            <TabsContent value="image" className="pt-4">
              <MemeEditor
                imageUrl={generatedImageUrl}
                onSave={handleSaveMeme}
                onCancel={handleCancelEdit}
              />
            </TabsContent>
            <TabsContent value="sound" className="pt-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Add Sound Effects to Your Meme</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Make your meme interactive by adding sounds that play when clicked.
                </p>
                <BasicSoundboard 
                  onAttachSound={(soundId) => {
                    if (!attachedSounds.includes(soundId)) {
                      setAttachedSounds([...attachedSounds, soundId]);
                      toast({
                        title: "Sound attached",
                        description: "Sound effect added to your meme"
                      });
                    }
                  }}
                  attachedSounds={attachedSounds}
                />
                
                {attachedSounds.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Attached Sounds</h4>
                    <div className="flex flex-wrap gap-2">
                      {attachedSounds.map((soundId) => (
                        <Badge 
                          key={soundId} 
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Music className="h-3 w-3" />
                          {soundId}
                          <button 
                            className="ml-1 rounded-full hover:bg-gray-200 p-1"
                            onClick={() => {
                              setAttachedSounds(attachedSounds.filter(id => id !== soundId));
                            }}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleSaveMeme(generatedImageUrl)}
                  >
                    Save Meme With Sounds
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <>
          <h3 className="text-xl font-heading font-bold mb-4">Create Your Own Meme</h3>
          
          {/* Creation Mode Tabs */}
          <div className="flex border-b mb-6">
            <button 
              className={`py-2 px-4 font-medium ${creationMode === 'ai' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setCreationMode('ai')}
            >
              AI Generated
            </button>
            <button 
              className={`py-2 px-4 font-medium ${creationMode === 'template' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setCreationMode('template')}
            >
              Use Template
            </button>
            <button 
              className={`py-2 px-4 font-medium ${creationMode === 'upload' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              onClick={() => setCreationMode('upload')}
            >
              Upload Image
            </button>
          </div>
          
          {/* AI Generation Mode */}
          {creationMode === 'ai' && (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">Meme Prompt</label>
              <div className="flex">
                <Input
                  type="text"
                  className="flex-1 rounded-l-lg focus:ring-2 focus:ring-primary"
                  placeholder="Describe your meme idea..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <button
                  className="bg-primary text-white px-4 py-2 rounded-r-lg font-medium hover:bg-opacity-90 transition flex items-center"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>Generate</>
                  )}
                </button>
              </div>
              
              <div className="mt-4">
                <label className="block text-gray-700 mb-2 font-medium">Image Style</label>
                <StyleSelector 
                  selectedStyle={selectedStyle}
                  onChange={setSelectedStyle}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Choose a visual style for your AI-generated meme image
                </p>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">Powered by Gemini AI - Be creative with your prompts!</p>
            </div>
          )}
          
          {/* Template Mode */}
          {creationMode === 'template' && (
            <div className="mb-6">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Caption (optional)</label>
                <Input
                  type="text"
                  className="w-full"
                  placeholder="Add text for your meme..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              
              <label className="block text-gray-700 mb-2 font-medium">Select Template</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {memeTemplates.map((template) => (
                  <MemeTemplate
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onSelect={handleTemplateSelect}
                    label="Meme Template"
                  />
                ))}
                {reactionImages.map((template) => (
                  <MemeTemplate
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate?.id === template.id}
                    onSelect={handleTemplateSelect}
                    label="Reaction Image"
                  />
                ))}
              </div>
              
              <div className="flex justify-center mt-4">
                <button
                  className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition"
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedTemplate}
                >
                  {isGenerating ? 'Creating...' : 'Customize Meme'}
                </button>
              </div>
            </div>
          )}
          
          {/* Upload Mode */}
          {creationMode === 'upload' && (
            <div className="mb-6">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium">Caption (optional)</label>
                <Input
                  type="text"
                  className="w-full"
                  placeholder="Add text for your meme..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              
              <label className="block text-gray-700 mb-2 font-medium">Upload Image</label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              
              {uploadPreview ? (
                <div className="mb-4 text-center">
                  <img 
                    src={uploadPreview} 
                    alt="Upload preview" 
                    className="max-h-60 max-w-full mx-auto rounded border p-1"
                  />
                  <button 
                    className="mt-2 text-primary underline"
                    onClick={triggerFileInput}
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition"
                  onClick={triggerFileInput}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">Click to upload an image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF (max 5MB)</p>
                </div>
              )}
              
              <div className="flex justify-center mt-4">
                <button
                  className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition"
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedFile}
                >
                  {isGenerating ? 'Processing...' : 'Customize Meme'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemeGenerator;