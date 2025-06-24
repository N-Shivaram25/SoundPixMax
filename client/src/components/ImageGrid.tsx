import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Save, Download, FolderPlus, Archive } from "lucide-react";

interface ImageGridProps {
  images: any[];
  videos?: any[];
  mode: 'image' | 'saga' | 'video';
  onSaveImage: (imageId: number) => void;
  onSaveAll: () => void;
  onDownloadAll: () => void;
  isVisible: boolean;
  isLoading: boolean;
}

export function ImageGrid({ 
  images, 
  videos = [], 
  mode, 
  onSaveImage, 
  onSaveAll, 
  onDownloadAll,
  isVisible,
  isLoading 
}: ImageGridProps) {
  if (!isVisible) return null;

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

  const content = mode === 'video' ? videos : images;
  const itemType = mode === 'video' ? 'video' : 'image';

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Generated {mode === 'video' ? 'Videos' : 'Images'}
      </h2>
      
      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">
            Generating your {mode === 'video' ? 'videos' : 'images'}...
          </p>
        </div>
      )}

      {/* Content Grid */}
      {!isLoading && content.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {content.map((item, index) => (
              <Card key={item.id || index} className="overflow-hidden shadow-lg">
                {mode === 'video' ? (
                  <video
                    src={item.videoUrl}
                    poster={item.thumbnailUrl}
                    controls
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <img
                    src={item.imageUrl}
                    alt={`Generated ${itemType} ${index + 1}`}
                    className="w-full h-64 object-cover"
                  />
                )}
                
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {itemType.charAt(0).toUpperCase() + itemType.slice(1)} {index + 1}
                    </span>
                    <div className="flex space-x-2">
                      {mode !== 'video' && (
                        <Button
                          onClick={() => onSaveImage(item.id)}
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Save className="mr-1 h-3 w-3" />
                          Save
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => downloadImage(
                          item.imageUrl || item.videoUrl,
                          `${itemType}-${index + 1}.${mode === 'video' ? 'mp4' : 'png'}`
                        )}
                        size="sm"
                        variant="secondary"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Batch Actions */}
          <div className="text-center">
            {mode !== 'video' && (
              <Button
                onClick={onSaveAll}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 font-medium mr-4"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Save All to Folder
              </Button>
            )}
            
            <Button
              onClick={onDownloadAll}
              className="px-8 py-3 bg-gray-600 hover:bg-gray-700 font-medium"
              variant="secondary"
            >
              <Archive className="mr-2 h-4 w-4" />
              Download All as ZIP
            </Button>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && content.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No {mode === 'video' ? 'videos' : 'images'} generated yet
          </p>
        </div>
      )}
    </div>
  );
}
