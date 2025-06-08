import React from "react";
import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Send, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SocialShareButtonsProps {
  url: string;
  title: string;
  className?: string;
  size?: "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export default function SocialShareButtons({
  url,
  title,
  className,
  size = "sm",
  variant = "outline"
}: SocialShareButtonsProps) {
  const { toast } = useToast();
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  
  const handleShare = async (platform: string) => {
    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank");
        break;
      case "telegram":
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, "_blank");
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(url);
          toast({
            title: "Link copied!",
            description: "The link has been copied to your clipboard.",
          });
        } catch (err) {
          toast({
            title: "Failed to copy",
            description: "Please copy the link manually.",
            variant: "destructive",
          });
        }
        break;
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={variant}
        size={size}
        className="rounded-full text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
        onClick={() => handleShare("twitter")}
      >
        <Twitter className="h-4 w-4" />
        <span className="sr-only">Share on Twitter</span>
      </Button>
      
      <Button
        variant={variant}
        size={size}
        className="rounded-full text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900"
        onClick={() => handleShare("facebook")}
      >
        <Facebook className="h-4 w-4" />
        <span className="sr-only">Share on Facebook</span>
      </Button>
      
      <Button
        variant={variant}
        size={size}
        className="rounded-full text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900"
        onClick={() => handleShare("telegram")}
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Share on Telegram</span>
      </Button>
      
      <Button
        variant={variant}
        size={size}
        className="rounded-full"
        onClick={() => handleShare("copy")}
      >
        <Copy className="h-4 w-4" />
        <span className="sr-only">Copy link</span>
      </Button>
    </div>
  );
}