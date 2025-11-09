// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export class VoiceRecognition {
  private recognition: SpeechRecognition | null = null;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-IN';
    }
  }

  isAvailable(): boolean {
    return this.recognition !== null;
  }

  start(
    onResult: (text: string) => void,
    onError: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError('Speech recognition not available in this browser');
      return;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      if (this.onResultCallback) {
        this.onResultCallback(transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error || 'Recognition error');
      }
    };

    this.recognition.onend = () => {
      // Recognition ended
    };

    try {
      this.recognition.start();
    } catch (error) {
      if (this.onErrorCallback) {
        this.onErrorCallback('Failed to start recognition');
      }
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

export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private analyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;

  async play(
    audioSrc: string,
    onStart?: () => void,
    onEnd?: () => void,
    onVolumeUpdate?: (volume: number) => void
  ): Promise<void> {
    this.stop();

    this.audio = new Audio(audioSrc);

    // Setup audio context for visualization
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    const source = this.audioContext.createMediaElementSource(this.audio);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    this.audio.onplay = () => {
      if (onStart) onStart();
      this.updateVolume(onVolumeUpdate);
    };

    this.audio.onended = () => {
      if (onEnd) onEnd();
    };

    await this.audio.play();
  }

  private updateVolume(onVolumeUpdate?: (volume: number) => void): void {
    if (!this.analyser || !this.dataArray || !this.audio || this.audio.paused) {
      return;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate average volume
    const sum = this.dataArray.reduce((a, b) => a + b, 0);
    const average = sum / this.dataArray.length;
    const normalizedVolume = average / 255;

    if (onVolumeUpdate) {
      onVolumeUpdate(normalizedVolume);
    }

    requestAnimationFrame(() => this.updateVolume(onVolumeUpdate));
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
  }

  isPlaying(): boolean {
    return this.audio !== null && !this.audio.paused;
  }
}
