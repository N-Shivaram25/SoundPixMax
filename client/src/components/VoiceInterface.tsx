import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Play, Square, RotateCcw, Wand2 } from "lucide-react";
import { speechRecognition } from "@/lib/speechRecognition";
import { cn } from "@/lib/utils";

interface VoiceInterfaceProps {
  onGenerate: (text: string, language: string, mode: 'image' | 'saga' | 'video') => void;
  mode: 'image' | 'saga' | 'video';
  isGenerating: boolean;
}

export function VoiceInterface({ onGenerate, mode, isGenerating }: VoiceInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState("en");
  const [showWaves, setShowWaves] = useState(false);

  useEffect(() => {
    if (!speechRecognition.isAvailable()) {
      console.warn("Speech recognition not supported in this browser");
    }
  }, []);

  const startRecording = () => {
    if (!speechRecognition.isAvailable()) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    setIsRecording(true);
    setShowWaves(true);
    
    let silenceTimer: NodeJS.Timeout;
    let finalTranscript = "";
    
    speechRecognition.start(
      {
        language: language,
        continuous: true,
        interimResults: true,
      },
      {
        onResult: (text: string, isFinal: boolean) => {
          // Clear previous silence timer
          if (silenceTimer) clearTimeout(silenceTimer);
          
          if (isFinal) {
            finalTranscript += text + " ";
            setTranscript(finalTranscript);
          } else {
            setTranscript(finalTranscript + text);
          }
          
          // Set new silence timer for 5 seconds
          silenceTimer = setTimeout(() => {
            if (isRecording) {
              speechRecognition.stop();
            }
          }, 5000);
        },
        onError: (error: string) => {
          console.error("Speech recognition error:", error);
          setIsRecording(false);
          setShowWaves(false);
          if (silenceTimer) clearTimeout(silenceTimer);
        },
        onEnd: () => {
          setIsRecording(false);
          setShowWaves(false);
          if (silenceTimer) clearTimeout(silenceTimer);
        },
      }
    );
  };

  const stopRecording = () => {
    speechRecognition.stop();
    setIsRecording(false);
    setShowWaves(false);
  };

  const resetRecording = () => {
    speechRecognition.abort();
    setIsRecording(false);
    setShowWaves(false);
    setTranscript("");
  };

  const handleGenerate = () => {
    if (transcript.trim()) {
      let processedText = transcript;
      
      // For saga mode, split the story into segments
      if (mode === 'saga') {
        const segments = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
        processedText = segments.join(' | '); // Use pipe separator for segments
      }
      
      onGenerate(processedText, language, mode);
    }
  };

  const getGenerateButtonText = () => {
    switch (mode) {
      case 'image': return 'Generate 3 Images';
      case 'saga': return 'Generate Story Images';
      case 'video': return 'Generate 3 Videos';
      default: return 'Generate';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Language Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Language
        </label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
            <SelectItem value="te">Telugu (తెలుగు)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Microphone Interface */}
      <Card className="p-8 mb-8">
        <CardContent className="p-0">
          {/* Animated Microphone */}
          <div className="text-center mb-8">
            <div 
              className={cn(
                "inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-primary to-blue-700 rounded-full mb-6 transition-all duration-300",
                isRecording && "animate-pulse scale-110"
              )}
            >
              <Mic className="text-white text-4xl h-12 w-12" />
            </div>
            
            {/* Voice Wave Animation */}
            {showWaves && (
              <div className="flex items-end justify-center space-x-1 h-12 mb-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 bg-primary rounded-full animate-pulse",
                      i === 0 || i === 4 ? "h-4" : i === 1 || i === 3 ? "h-6" : "h-8"
                    )}
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: "1.5s"
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              onClick={startRecording}
              disabled={isRecording}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 font-medium"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Speaking
            </Button>
            
            <Button
              onClick={stopRecording}
              disabled={!isRecording}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 font-medium"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Speaking
            </Button>
            
            <Button
              onClick={resetRecording}
              className="px-8 py-3 bg-gray-500 hover:bg-gray-600 font-medium"
              variant="secondary"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Speech Text Display */}
          <div className="bg-gray-50 rounded-lg p-6 min-h-32">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Recognized Speech:
            </h3>
            <div className="text-gray-700 leading-relaxed">
              {transcript || (
                <span className="text-gray-400 italic">
                  Click "Start Speaking" to begin voice recognition...
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="text-center mb-8">
        <Button
          onClick={handleGenerate}
          disabled={!transcript.trim() || isGenerating}
          className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          <Wand2 className="mr-3 h-5 w-5" />
          {isGenerating ? "Generating..." : getGenerateButtonText()}
        </Button>
        
        {/* Helper text */}
        <p className="text-sm text-gray-500 mt-2">
          {!transcript.trim() 
            ? "Speak something first to enable generation" 
            : `Ready to generate ${mode === 'image' ? '3 images' : mode === 'saga' ? 'story images' : '3 videos'}`
          }
        </p>
      </div>
    </div>
  );
}
