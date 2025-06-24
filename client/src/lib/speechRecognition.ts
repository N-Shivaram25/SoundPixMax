export interface SpeechRecognitionOptions {
  language: string;
  continuous: boolean;
  interimResults: boolean;
}

export class SpeechRecognitionManager {
  private recognition: any = null;
  private isSupported = false;

  constructor() {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.isSupported = true;
    }
  }

  isAvailable(): boolean {
    return this.isSupported;
  }

  start(options: SpeechRecognitionOptions, callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: string) => void;
    onEnd: () => void;
  }): boolean {
    if (!this.recognition) {
      callbacks.onError('Speech recognition not supported');
      return false;
    }

    try {
      this.recognition.lang = options.language;
      this.recognition.continuous = options.continuous;
      this.recognition.interimResults = options.interimResults;

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          transcript += result[0].transcript;
          if (result.isFinal) {
            isFinal = true;
          }
        }

        callbacks.onResult(transcript, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        callbacks.onError(event.error || 'Speech recognition error');
      };

      this.recognition.onend = () => {
        callbacks.onEnd();
      };

      this.recognition.start();
      return true;
    } catch (error) {
      callbacks.onError('Failed to start speech recognition');
      return false;
    }
  }

  stop(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
    }
  }
}

export const speechRecognition = new SpeechRecognitionManager();
