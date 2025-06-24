import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  prompts: any[];
  onPromptSelect: (promptId: number) => void;
  onClearHistory: () => void;
}

export function Sidebar({ prompts, onPromptSelect, onClearHistory }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrompts = prompts.filter(prompt =>
    prompt.originalText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'image': return 'bg-primary';
      case 'saga': return 'bg-green-500';
      case 'video': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'image': return '3 images';
      case 'saga': return 'Story mode';
      case 'video': return '3 videos';
      default: return mode;
    }
  };

  return (
    <aside className="w-80 bg-gray-800 text-white fixed left-0 top-20 bottom-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Prompt History</h2>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary"
          />
        </div>

        {/* History Items */}
        <div className="space-y-3">
          {filteredPrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="bg-gray-700 border-gray-600 p-4 cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => onPromptSelect(prompt.id)}
            >
              <div className="flex items-start space-x-3">
                {/* Thumbnail - show first image if available */}
                {prompt.images && prompt.images.length > 0 ? (
                  <img
                    src={prompt.images[0].thumbnailUrl || prompt.images[0].imageUrl}
                    alt="Generated thumbnail"
                    className="w-12 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-10 bg-gray-600 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-400">No img</span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {prompt.originalText}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimeAgo(new Date(prompt.createdAt))}
                  </p>
                  <div className="flex items-center mt-2">
                    <Badge className={`text-xs px-2 py-1 ${getModeColor(prompt.mode)}`}>
                      {getModeLabel(prompt.mode)}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {filteredPrompts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">
                {searchQuery ? "No matching prompts found" : "No prompts yet"}
              </p>
            </div>
          )}
        </div>

        {/* Clear History Button */}
        {prompts.length > 0 && (
          <Button
            onClick={onClearHistory}
            className="w-full mt-6 bg-gray-600 hover:bg-gray-500 text-white"
            variant="secondary"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>
    </aside>
  );
}
