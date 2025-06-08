import { useQuery } from "@tanstack/react-query";
import { Meme, Template } from "@shared/schema";

export function useMemes() {
  // Fetch all memes
  const { 
    data: memes = [], 
    isLoading: isLoadingMemes,
    refetch: refetchMemes
  } = useQuery<Meme[]>({
    queryKey: ["/api/memes"],
  });

  // Fetch templates
  const {
    data: templates = [],
    isLoading: isLoadingTemplates
  } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  return {
    memes,
    templates,
    isLoadingMemes,
    isLoadingTemplates,
    refetchMemes
  };
}
