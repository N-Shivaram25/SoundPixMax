import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, Plus, Trash2, X } from "lucide-react";

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: any[];
  onCreateFolder: (name: string) => void;
  onSelectFolder: (folderId: number) => void;
  onDeleteFolder: (folderId: number) => void;
}

export function FolderModal({
  isOpen,
  onClose,
  folders,
  onCreateFolder,
  onSelectFolder,
  onDeleteFolder,
}: FolderModalProps) {
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName("");
    }
  };

  const handleSelectFolder = (folderId: number) => {
    onSelectFolder(folderId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Save to Folder
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Create New Folder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Create New Folder
            </label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="flex-1"
              />
              <Button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Existing Folders */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Existing Folder
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSelectFolder(folder.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Folder className="text-orange-500 h-4 w-4" />
                      <span className="text-sm text-gray-700">{folder.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {folder.imageCount || 0} images
                      </Badge>
                    </div>
                    
                    {folder.name !== "Pre Images" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFolder(folder.id);
                        }}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
              
              {folders.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">No folders yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
