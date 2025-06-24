import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { VoiceInterface } from "@/components/VoiceInterface";
import { ImageGrid } from "@/components/ImageGrid";
import { FolderModal } from "@/components/FolderModal";
import { AuthModal } from "@/components/AuthModal";
import { APIClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import type { AuthUser } from "@/types";

export default function Home() {
  const [currentMode, setCurrentMode] = useState<'image' | 'saga' | 'video'>('image');
  const [showGallery, setShowGallery] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<any[]>([]);
  const [currentPromptId, setCurrentPromptId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user prompts
  const { data: promptsData } = useQuery({
    queryKey: ['/api/prompts', user?.id],
    enabled: !!user?.id,
  });

  // Fetch user folders
  const { data: foldersData } = useQuery({
    queryKey: ['/api/folders', user?.id],
    enabled: !!user?.id,
  });

  const prompts = promptsData?.prompts || [];
  const folders = foldersData?.folders || [];

  // Authentication mutation
  const authMutation = useMutation({
    mutationFn: ({ email, username }: { email: string; username: string }) =>
      APIClient.authenticateUser(email, username),
    onSuccess: (data) => {
      setUser(data.user);
      toast({
        title: "Welcome to SoundPix!",
        description: "You're now signed in.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/prompts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
    },
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: (name: string) => APIClient.createFolder(user!.id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      toast({
        title: "Folder created",
        description: "Your new folder has been created successfully.",
      });
    },
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: (folderId: number) => APIClient.deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      toast({
        title: "Folder deleted",
        description: "The folder has been deleted successfully.",
      });
    },
  });

  const handleGenerate = async (text: string, language: string, mode: 'image' | 'saga' | 'video') => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setIsGenerating(true);
    setShowResults(true);
    
    try {
      // Translate text if not English
      let translatedText = text;
      if (language !== 'en') {
        const translation = await APIClient.translateText(text, 'en');
        translatedText = translation.translatedText;
      }

      // Create prompt
      const promptResponse = await APIClient.createPrompt(
        user.id,
        text,
        translatedText,
        language,
        mode
      );
      
      const promptId = promptResponse.prompt.id;
      setCurrentPromptId(promptId);

      if (mode === 'video') {
        // Generate videos
        const videoResponse = await APIClient.generateVideos(promptId, translatedText);
        setGeneratedVideos(videoResponse.videos);
        toast({
          title: "Videos generated!",
          description: `Successfully generated ${videoResponse.videos.length} videos.`,
        });
      } else {
        // Generate images
        const imageResponse = await APIClient.generateImages(promptId, translatedText, mode);
        setGeneratedImages(imageResponse.images);
        toast({
          title: "Images generated!",
          description: `Successfully generated ${imageResponse.images.length} images.`,
        });
      }

      // Refresh prompts
      queryClient.invalidateQueries({ queryKey: ['/api/prompts'] });
      
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptSelect = (promptId: number) => {
    // Load selected prompt's images/videos
    const selectedPrompt = prompts.find(p => p.id === promptId);
    if (selectedPrompt) {
      setCurrentPromptId(promptId);
      setGeneratedImages(selectedPrompt.images || []);
      setGeneratedVideos(selectedPrompt.videos || []);
      setCurrentMode(selectedPrompt.mode as 'image' | 'saga' | 'video');
      setShowResults(true);
    }
  };

  const handleLogin = (email: string, username: string) => {
    authMutation.mutate({ email, username });
  };

  const handleSaveImage = (imageId: number) => {
    setShowFolderModal(true);
  };

  const handleSaveAll = () => {
    setShowFolderModal(true);
  };

  const handleDownloadAll = async () => {
    // Implement ZIP download functionality
    toast({
      title: "Download started",
      description: "Your files are being prepared for download.",
    });
  };

  const handleFolderSelect = async (folderId: number) => {
    // Assign current images to selected folder
    try {
      for (const image of generatedImages) {
        await APIClient.assignImageToFolder(image.id, folderId);
      }
      toast({
        title: "Images saved",
        description: "All images have been saved to the selected folder.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "There was an error saving the images.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onModeChange={setCurrentMode}
        onGalleryOpen={() => window.location.href = '/gallery'}
        onAuthOpen={() => setShowAuth(true)}
        currentMode={currentMode}
        user={user}
      />

      <div className="flex pt-20">
        <Sidebar
          prompts={prompts}
          onPromptSelect={handlePromptSelect}
          onClearHistory={() => {
            // Implement clear history
            toast({
              title: "History cleared",
              description: "All prompt history has been cleared.",
            });
          }}
        />

        <main className="flex-1 ml-80 p-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">SoundPix</h1>
            <p className="text-2xl text-gray-600">~Voice to Image</p>
          </div>

          <VoiceInterface
            onGenerate={handleGenerate}
            mode={currentMode}
            isGenerating={isGenerating}
          />

          <ImageGrid
            images={generatedImages}
            videos={generatedVideos}
            mode={currentMode}
            onSaveImage={handleSaveImage}
            onSaveAll={handleSaveAll}
            onDownloadAll={handleDownloadAll}
            isVisible={showResults}
            isLoading={isGenerating}
          />
        </main>
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onLogin={handleLogin}
      />

      <FolderModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        folders={folders}
        onCreateFolder={(name) => createFolderMutation.mutate(name)}
        onSelectFolder={handleFolderSelect}
        onDeleteFolder={(id) => deleteFolderMutation.mutate(id)}
      />
    </div>
  );
}
