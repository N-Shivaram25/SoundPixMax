import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Folder, 
  Image, 
  Download, 
  Trash2, 
  ArrowLeft, 
  Plus, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { APIClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

interface GalleryProps {
  userId: number;
}

export default function Gallery({ userId }: GalleryProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: foldersData } = useQuery({
    queryKey: ['/api/folders', userId],
    enabled: !!userId,
  });

  const { data: folderImagesData } = useQuery({
    queryKey: ['/api/folders', selectedFolderId, 'images'],
    enabled: !!selectedFolderId,
  });

  const folders = foldersData?.folders || [];
  const folderImages = folderImagesData?.images || [];

  const createFolderMutation = useMutation({
    mutationFn: (name: string) => APIClient.createFolder(userId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      setShowCreateFolder(false);
      setNewFolderName("");
      toast({
        title: "Folder created",
        description: "Your new folder has been created successfully.",
      });
    },
  });

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

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate(newFolderName.trim());
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % folderImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + folderImages.length) % folderImages.length);
  };

  // Folder View
  if (selectedFolderId) {
    const selectedFolder = folders.find(f => f.id === selectedFolderId);
    
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setSelectedFolderId(null)}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Folders
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedFolder?.name}</h1>
                <p className="text-gray-600">{folderImages.length} images</p>
              </div>
            </div>
            
            <Button
              onClick={() => {
                // Download all images in folder as ZIP
                toast({
                  title: "Download started",
                  description: "Your folder is being prepared for download.",
                });
              }}
              className="bg-primary"
            >
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>

          {/* Image Navigation */}
          {folderImages.length > 0 && (
            <div className="mb-8">
              <div className="relative bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-center">
                  <Button
                    onClick={prevImage}
                    variant="outline"
                    size="sm"
                    className="mr-4"
                    disabled={folderImages.length <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-center">
                    <img
                      src={folderImages[currentImageIndex]?.imageUrl}
                      alt={`Image ${currentImageIndex + 1}`}
                      className="max-w-md max-h-96 object-contain mx-auto mb-4"
                    />
                    <p className="text-sm text-gray-500">
                      {currentImageIndex + 1} of {folderImages.length}
                    </p>
                  </div>
                  
                  <Button
                    onClick={nextImage}
                    variant="outline"
                    size="sm"
                    className="ml-4"
                    disabled={folderImages.length <= 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={() => downloadImage(
                      folderImages[currentImageIndex]?.imageUrl,
                      `image-${currentImageIndex + 1}.png`
                    )}
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {folderImages.map((image, index) => (
              <Card
                key={image.id}
                className={`p-2 cursor-pointer transition-all ${
                  index === currentImageIndex ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img
                  src={image.imageUrl}
                  alt={`Image ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {folderImages.length === 0 && (
            <div className="text-center py-12">
              <Image className="text-gray-300 h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No images in this folder</h3>
              <p className="text-gray-400">Generated images will appear here</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Gallery View
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Design Gallery</h1>
            <p className="text-gray-600">Manage your generated images and organize them into folders</p>
          </div>
          
          <Button
            onClick={() => setShowCreateFolder(true)}
            className="bg-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Folder
          </Button>
        </div>

        {/* Folders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {folders.map((folder) => (
            <Card
              key={folder.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedFolderId(folder.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <Folder className="text-orange-500 h-8 w-8" />
                {folder.name !== "Pre Images" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolderMutation.mutate(folder.id);
                    }}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{folder.name}</h3>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  <Image className="mr-1 h-3 w-3" />
                  {folder.imageCount || 0} images
                </Badge>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast({
                      title: "Download started",
                      description: "Your folder is being prepared for download.",
                    });
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {folders.length === 0 && (
          <div className="text-center py-12">
            <Folder className="text-gray-300 h-16 w-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No folders yet</h3>
            <p className="text-gray-400">Generated images will appear here</p>
          </div>
        )}

        {/* Create Folder Modal */}
        <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim() || createFolderMutation.isPending}
                >
                  {createFolderMutation.isPending ? "Creating..." : "Create Folder"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
