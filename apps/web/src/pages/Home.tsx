import { useState, useRef, useEffect } from 'react';
import { useStore } from '../lib/store';
import { VoiceRecognition, AudioPlayer } from '../lib/audio';
import { sendMessage, generateSpeech, executeTool } from '../lib/api';
import Avatar from '../components/Avatar';
import Waveform from '../components/Waveform';
import MicButton from '../components/MicButton';
import ChatBubble from '../components/ChatBubble';
import ToolNotification from '../components/ToolNotification';

export default function Home() {
  const {
    aiState,
    setAIState,
    messages,
    addMessage,
    sessionId,
    setIsAudioPlaying,
    setAudioVolume,
    addToolNotification,
  } = useStore();

  const [error, setError] = useState<string>('');
  const [autoListen, setAutoListen] = useState<boolean>(false);
  const voiceRecognitionRef = useRef<VoiceRecognition | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    voiceRecognitionRef.current = new VoiceRecognition();
    audioPlayerRef.current = new AudioPlayer();

    if (!voiceRecognitionRef.current.isAvailable()) {
      setError('Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleVoiceInput = async () => {
    if (!voiceRecognitionRef.current) return;

    setAIState('listening');
    setError('');

    voiceRecognitionRef.current.start(
      async (transcript) => {
        console.log('Transcript:', transcript);
        addMessage('user', transcript);
        await processUserMessage(transcript);
      },
      (error) => {
        console.error('Voice recognition error:', error);
        setError(`Voice recognition error: ${error}`);
        setAIState('idle');
      }
    );
  };

  const processUserMessage = async (text: string) => {
    try {
      setAIState('thinking');

      // Send to chat API
      const response = await sendMessage(text, sessionId);
      console.log('Chat response:', response);

      // Execute tool if detected
      if (response.tool) {
        const toolResult = await executeTool(response.tool.name, response.tool.args, sessionId);
        console.log('Tool result:', toolResult);
        
        // Show tool notification
        addToolNotification(toolResult.result);

        // Handle special actions
        if (toolResult.action) {
          const [actionType, actionData] = toolResult.action.split(':');
          if (actionType === 'open_url') {
            window.open(actionData, '_blank');
          }
        }

        // Use speakable text for TTS
        addMessage('assistant', toolResult.speakable);
        await speakText(toolResult.speakable);
      } else {
        // Normal response
        addMessage('assistant', response.reply);
        await speakText(response.reply);
      }
    } catch (error: any) {
      console.error('Error processing message:', error);
      setError(`Error: ${error.message}`);
      setAIState('idle');
    }
  };

  const speakText = async (text: string) => {
    try {
      setAIState('speaking');
      setIsAudioPlaying(true);

      // Generate speech
      const audioSrc = await generateSpeech(text);

      // Play audio
      await audioPlayerRef.current?.play(
        audioSrc,
        () => {
          console.log('Audio started');
        },
        () => {
          console.log('Audio ended');
          setAIState('idle');
          setIsAudioPlaying(false);
          setAudioVolume(0);
          
          // Auto-listen: Automatically start listening again after response
          if (autoListen) {
            setTimeout(() => {
              handleVoiceInput();
            }, 500); // Small delay before starting to listen again
          }
        },
        (volume) => {
          setAudioVolume(volume);
        }
      );
    } catch (error: any) {
      console.error('Error generating speech:', error);
      setError(`Speech error: ${error.message}`);
      setAIState('idle');
      setIsAudioPlaying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Tool Notifications */}
      <ToolNotification />

      {/* Header */}
      <header className="p-6 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-2">Swaraj AI</h1>
        <p className="text-gray-400 text-sm">Code. Secure. Create.</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 space-y-8">
        {/* Avatar */}
        <Avatar />

        {/* Waveform */}
        <Waveform />

        {/* Mic Button */}
        <div className="flex flex-col items-center gap-4">
          <MicButton onClick={handleVoiceInput} />
          <p className="text-sm text-gray-400">
            {aiState === 'idle' && 'Tap to speak'}
            {aiState === 'listening' && 'Listening...'}
            {aiState === 'thinking' && 'Processing...'}
            {aiState === 'speaking' && 'Speaking...'}
          </p>
          
          {/* Auto-Listen Toggle */}
          <button
            onClick={() => setAutoListen(!autoListen)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              autoListen
                ? 'bg-neon-blue text-dark-bg'
                : 'bg-dark-surface text-gray-400 border border-gray-600'
            }`}
          >
            {autoListen ? '🔄 Auto-Listen: ON' : '⏸️ Auto-Listen: OFF'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg max-w-md text-center text-sm">
            {error}
          </div>
        )}

        {/* Chat History */}
        {messages.length > 0 && (
          <div className="w-full max-w-2xl mt-8">
            <div className="bg-dark-surface/50 backdrop-blur-sm rounded-2xl p-6 border border-neon-blue/20">
              <h2 className="text-lg font-semibold text-neon-blue mb-4">Conversation</h2>
              <div
                ref={chatContainerRef}
                className="max-h-96 overflow-y-auto space-y-2 pr-2"
              >
                {messages.map((message, index) => (
                  <ChatBubble key={message.id} message={message} index={index} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-500">
        <p>Built with Gemini AI + ElevenLabs + React</p>
        <p className="mt-1">
          By <span className="text-neon-blue">Swaraj Satyam</span> |{' '}
          <a
            href="https://cyra-assistant.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-purple hover:underline"
          >
            cyra-assistant.tech
          </a>
        </p>
      </footer>
    </div>
  );
}
