import { useState, useEffect } from 'react';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Avatar } from './components/Avatar';
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { CommandFeedback } from './components/CommandFeedback';
import { socketClient } from './services/socketClient';
import { voiceService } from './services/voiceService';
import { AvatarState } from './types';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [feedback, setFeedback] = useState({ message: '', type: 'info' as any, visible: false });
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    // Connect to WebSocket
    const socket = socketClient.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      showFeedback('Connected to Swaraj AI', 'success');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      showFeedback('Disconnected from server', 'error');
    });

    socketClient.onStatus((data) => {
      if (data.state === 'processing') {
        setAvatarState('thinking');
        showFeedback(data.message, 'processing');
      }
    });

    socketClient.onVoiceResponse((data) => {
      setAvatarState('speaking');
      setResponse(data.text);
      showFeedback('Response received', 'success');

      // Play audio if available
      if (data.audioBase64) {
        voiceService.playAudioFromBase64(data.audioBase64, () => {
          setAvatarState('idle');
        });
      } else {
        voiceService.speak(data.text, () => {
          setAvatarState('idle');
        });
      }
    });

    socketClient.onActionResult((data) => {
      if (data.success && data.data?.action === 'open_url') {
        window.open(data.data.url, '_blank');
      }
    });

    socketClient.onError((data) => {
      showFeedback(data.message, 'error');
      setAvatarState('idle');
    });

    return () => {
      socketClient.disconnect();
    };
  }, []);

  const showFeedback = (message: string, type: any) => {
    setFeedback({ message, type, visible: true });
    setTimeout(() => {
      setFeedback((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const startListening = () => {
    setIsListening(true);
    setAvatarState('listening');
    setAudioLevel(0.5);

    voiceService.startListening(
      (text, language) => {
        setTranscript(text);
        setIsListening(false);
        setAvatarState('thinking');
        setAudioLevel(0);
        
        showFeedback(`You said: "${text}"`, 'info');
        socketClient.sendTranscript(text, language);
      },
      (error) => {
        console.error('Voice error:', error);
        showFeedback('Voice recognition error', 'error');
        setIsListening(false);
        setAvatarState('idle');
        setAudioLevel(0);
      }
    );
  };

  const stopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
    setAvatarState('idle');
    setAudioLevel(0);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      <CommandFeedback
        message={feedback.message}
        type={feedback.type}
        visible={feedback.visible}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 text-glow text-cyber-blue">
            Swaraj AI
          </h1>
          <p className="text-xl text-gray-400 mb-2">
            A calm mind, a clear vision, and a code that speaks for itself.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Avatar */}
        <div className="mb-8">
          <Avatar state={avatarState} audioLevel={audioLevel} />
        </div>

        {/* Waveform Visualizer */}
        <div className="w-full max-w-2xl mb-8">
          <WaveformVisualizer isActive={isListening || avatarState === 'speaking'} audioLevel={audioLevel} />
        </div>

        {/* Transcript and Response */}
        <div className="w-full max-w-2xl mb-8 space-y-4">
          {transcript && (
            <div className="glass-effect rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">You said:</p>
              <p className="text-white">{transcript}</p>
            </div>
          )}
          {response && (
            <div className="glass-effect rounded-lg p-4 border-l-4 border-cyber-blue">
              <p className="text-sm text-gray-400 mb-1">Swaraj AI:</p>
              <p className="text-white">{response}</p>
            </div>
          )}
        </div>

        {/* Control Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={!isConnected}
          className={`px-8 py-4 rounded-lg font-semibold text-white transition-all duration-200 shadow-lg ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/50'
              : 'bg-gradient-to-r from-cyber-blue to-cyber-purple hover:scale-105 hover:shadow-cyber-blue/50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isListening ? '🛑 Stop Listening' : '🎤 Start Conversation'}
        </button>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-gray-500 space-y-1">
          <p>Press the button and speak naturally</p>
          <p>Supports English and Hindi</p>
        </div>
      </div>
    </div>
  );
}

export default App;
