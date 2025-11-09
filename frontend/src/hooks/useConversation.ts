import { useState, useCallback } from 'react';
import { socketClient } from '../services/socketClient';
import { voiceService } from '../services/voiceService';
import { AvatarState, Message } from '../types';

export const useConversation = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isProcessing, setIsProcessing] = useState(false);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const message: Message = {
      id: `msg_${Date.now()}`,
      role,
      content,
      language: 'en',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, message]);
  }, []);

  const startListening = useCallback(() => {
    setIsListening(true);
    setAvatarState('listening');

    voiceService.startListening(
      (text, language) => {
        addMessage('user', text);
        setIsListening(false);
        setAvatarState('thinking');
        setIsProcessing(true);
        socketClient.sendTranscript(text, language);
      },
      (error) => {
        console.error('Voice error:', error);
        setIsListening(false);
        setAvatarState('idle');
      }
    );
  }, [addMessage]);

  const stopListening = useCallback(() => {
    voiceService.stopListening();
    setIsListening(false);
    setAvatarState('idle');
  }, []);

  const handleResponse = useCallback((text: string, audioBase64?: string) => {
    addMessage('assistant', text);
    setAvatarState('speaking');
    setIsProcessing(false);

    if (audioBase64) {
      voiceService.playAudioFromBase64(audioBase64, () => {
        setAvatarState('idle');
      });
    } else {
      voiceService.speak(text, () => {
        setAvatarState('idle');
      });
    }
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isListening,
    avatarState,
    isProcessing,
    startListening,
    stopListening,
    handleResponse,
    clearMessages,
  };
};
