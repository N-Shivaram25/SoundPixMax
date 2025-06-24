export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  transcript: string;
  language: string;
}

export interface GenerationMode {
  type: 'image' | 'saga' | 'video';
  label: string;
  icon: string;
  color: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  googleId?: string;
}

export interface PromptWithImages {
  id: number;
  originalText: string;
  translatedText: string;
  language: string;
  mode: string;
  createdAt: Date;
  images: any[];
  videos: any[];
}
