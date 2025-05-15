import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fabric } from 'fabric';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { uploadImage, pinToIpfs } from '@/lib/utils';
import { createMeme, getPromptById } from '@/lib/database';
import { updateMemeStreak } from '@/lib/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MemeGeneratorProps {
  isDailyChallenge?: boolean;
}

const MemeGenerator: React.FC<MemeGeneratorProps> = ({ isDailyChallenge = false }) => {
  const [searchParams] = useSearchParams();
  const promptId = searchParams.get('promptId') || '';
  const [promptText, setPromptText] = useState<string>('');
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(40);
  const [fontColor, setFontColor] = useState<string>('#FFFFFF');
  const [fontFamily, setFontFamily] = useState<string>('Impact');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [saveToIpfs, setSaveToIpfs] = useState<boolean>(false);
  const [clearAfterSave, setClearAfterSave] = useState<boolean>(false);
  const [navigateAfterSave, setNavigateAfterSave] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch prompt text if promptId is available
  const { data: prompt } = useQuery({
    queryKey: ['prompt', promptId],
    queryFn: async () => {
      if (!promptId) return null;
      const promptData = await getPromptById(promptId);
      return promptData;
    },
    enabled: !!promptId,
    onSuccess: (data) => {
      if (data) {
        setPromptText(data.text);
      }
    }
  });

  useEffect(() => {
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 500,
      backgroundColor: '#f3f3f3',
    });

    setCanvas(newCanvas);

    return () => {
      newCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (canvas && imageUrl) {
      fabric.Image.fromURL(imageUrl, (img) => {
        img.scaleToWidth(canvas.width || 500);
        img.scaleToHeight(canvas.height || 500);
        canvas.centerObject(img);
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width ? img.width! / canvas.width : 1,
          scaleY: canvas.height ? img.height! / canvas.height : 1,
        });
        canvas.renderAll();
      });
    }
  }, [canvas, imageUrl]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCaption = () => {
    if (!canvas) return;

    // Remove existing caption if it exists
    canvas.getObjects('text').forEach((obj) => {
      canvas.remove(obj);
    });

    const text = new fabric.Textbox(caption, {
      left: canvas.width ? canvas.width / 2 : 250,
      top: canvas.height ? canvas.height - 100 : 400,
      width: canvas.width ? canvas.width - 20 : 480,
      fontSize: fontSize,
      fill: fontColor,
      fontFamily: fontFamily,
      textAlign: textAlign,
      originX: 'center',
      hasControls: false,
      hasBorders: false,
      lockScalingFlip: true,
      // Set shadow properties
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.7)',
        blur: 5,
        offsetX: 3,
        offsetY: 3
      })
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim() !== '') {
      e.preventDefault();
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const resetEditor = () => {
    setImageUrl('');
    setCaption('');
    setFontSize(40);
    setFontColor('#FFFFFF');
    setFontFamily('Impact');
    setTextAlign('center');
    setTags([]);
    setNewTag('');
    setSaveToIpfs(false);
    setClearAfterSave(false);
    setNavigateAfterSave(false);

    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = '#f3f3f3';
    }
  };

  // Find the saveMeme function and update it
  const saveMeme = async () => {
    if (!user) {
      toast.error("You need to be logged in to save memes", {
        description: "Please sign in to save your meme"
      });
      return;
    }

    if (!canvasRef.current || !caption) {
      toast.error("Unable to save meme", {
        description: "Make sure your meme has a caption"
      });
      return;
    }

    setIsSaving(true);

    try {
      // Generate a data URL from the canvas
      const dataUrl = canvasRef.current.toDataURL("image/png");

      // Upload the image first
      const { imageUrl } = await uploadImage(dataUrl, user.id);

      if (!imageUrl) {
        throw new Error("Failed to upload image");
      }

      // Prepare meme data
      const memeData = {
        prompt: promptText,
        prompt_id: promptId || null,
        imageUrl,
        caption,
        creatorId: user.id,
        votes: 0,
        createdAt: new Date(),
        tags: tags || [],
        isBattleSubmission: !!promptId // Mark as battle submission if prompt ID exists
      };

      // Upload to IPFS if enabled
      if (saveToIpfs) {
        try {
          const ipfsCid = await pinToIpfs(dataUrl, caption);
          if (ipfsCid) {
            memeData.ipfsCid = ipfsCid;
          }
        } catch (error) {
          console.error("IPFS upload failed:", error);
          // Continue even if IPFS fails
        }
      }

      // Save to database
      const savedMeme = await createMeme(memeData);

      if (!savedMeme) {
        throw new Error("Failed to save meme to database");
      }

      toast.success("Meme saved successfully!", {
        description: "Your meme has been saved"
      });

      // If this is part of a daily challenge, update the user's streak
      if (promptId && isDailyChallenge) {
        await updateMemeStreak(user.id);
        toast.success("Daily challenge completed!", {
          description: "Your meme streak has been updated"
        });
      }

      // Clear the form if asked to do so
      if (clearAfterSave) {
        resetEditor();
      }

      // Navigate to the meme if needed
      if (navigateAfterSave) {
        navigate(`/meme/${savedMeme.id}`);
      }

    } catch (error) {
      console.error("Error saving meme:", error);
      toast.error("Failed to save meme", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Meme Generator</h1>

      {promptText && (
        <div className="mb-4 p-4 bg-muted rounded-md">
          <h2 className="text-lg font-semibold">Prompt</h2>
          <p>{promptText}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <div className="mb-4">
            <Label htmlFor="imageUpload">Upload Image</Label>
            <Input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="mb-4">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              placeholder="Enter caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <Label>Font Size</Label>
            <Slider
              min={20}
              max={100}
              step={1}
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="fontColor">Font Color</Label>
            <Input
              type="color"
              id="fontColor"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <Label>Font Family</Label>
            <Select onValueChange={setFontFamily}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Impact">Impact</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label>Text Align</Label>
            <Select onValueChange={setTextAlign}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div key={tag} className="bg-muted rounded-full px-3 py-1 text-sm flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-gray-500">
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <Input
              type="text"
              placeholder="Add tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </div>

          <div className="mb-4 flex items-center space-x-2">
            <Switch id="saveToIpfs" checked={saveToIpfs} onCheckedChange={(checked) => setSaveToIpfs(checked)} />
            <Label htmlFor="saveToIpfs">Save to IPFS</Label>
          </div>

          <div className="mb-4 flex items-center space-x-2">
            <Switch id="clearAfterSave" checked={clearAfterSave} onCheckedChange={(checked) => setClearAfterSave(checked)} />
            <Label htmlFor="clearAfterSave">Clear After Save</Label>
          </div>

          <div className="mb-4 flex items-center space-x-2">
            <Switch id="navigateAfterSave" checked={navigateAfterSave} onCheckedChange={(checked) => setNavigateAfterSave(checked)} />
            <Label htmlFor="navigateAfterSave">Navigate After Save</Label>
          </div>

          <Button onClick={addCaption} className="w-full mb-4">Add Caption</Button>
          <Button onClick={saveMeme} disabled={isSaving} className="w-full bg-brand-purple hover:bg-brand-purple/90">
            {isSaving ? 'Saving...' : 'Save Meme'}
          </Button>
          <Button variant="secondary" onClick={resetEditor} className="w-full">Reset Editor</Button>
        </div>

        <div className="w-full md:w-1/2">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};

export default MemeGenerator;
