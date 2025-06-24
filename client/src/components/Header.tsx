import { Button } from "@/components/ui/button";
import { 
  Mic, 
  BookOpen, 
  Video, 
  Palette, 
  User 
} from "lucide-react";

interface HeaderProps {
  onModeChange: (mode: 'image' | 'saga' | 'video') => void;
  onGalleryOpen: () => void;
  onAuthOpen: () => void;
  currentMode: 'image' | 'saga' | 'video';
  user: any | null;
}

export function Header({ 
  onModeChange, 
  onGalleryOpen, 
  onAuthOpen, 
  currentMode,
  user 
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Mic className="text-primary-foreground text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SoundPix</h1>
            <p className="text-sm text-gray-500">Voice to Image</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => onModeChange('saga')}
            className={`px-6 py-2 font-medium transition-colors duration-200 ${
              currentMode === 'saga' 
                ? 'bg-primary hover:bg-primary/90' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Voice to Saga
          </Button>
          
          <Button
            onClick={() => onModeChange('video')}
            className={`px-6 py-2 font-medium transition-colors duration-200 ${
              currentMode === 'video'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <Video className="mr-2 h-4 w-4" />
            Voice to Video
          </Button>
          
          <Button
            onClick={onGalleryOpen}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 font-medium transition-colors duration-200"
          >
            <Palette className="mr-2 h-4 w-4" />
            Your Design
          </Button>
          
          <Button
            onClick={onAuthOpen}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
            size="sm"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
