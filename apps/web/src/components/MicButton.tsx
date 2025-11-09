import { motion } from 'framer-motion';
import { useStore } from '../lib/store';

interface MicButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function MicButton({ onClick, disabled = false }: MicButtonProps) {
  const aiState = useStore((state) => state.aiState);
  const isListening = aiState === 'listening';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || aiState === 'thinking' || aiState === 'speaking'}
      className={`
        relative w-20 h-20 rounded-full flex items-center justify-center
        transition-all duration-300
        ${isListening 
          ? 'bg-gradient-to-br from-neon-blue to-neon-purple' 
          : 'bg-gradient-to-br from-dark-surface to-dark-bg border-2 border-neon-blue'}
        ${disabled || aiState === 'thinking' || aiState === 'speaking'
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:scale-110 cursor-pointer'}
      `}
      whileTap={{ scale: 0.95 }}
      animate={
        isListening
          ? {
              boxShadow: [
                '0 0 20px #00d4ff',
                '0 0 40px #00d4ff',
                '0 0 20px #00d4ff',
              ],
            }
          : {}
      }
      transition={{
        duration: 1,
        repeat: isListening ? Infinity : 0,
      }}
    >
      {/* Microphone Icon */}
      <svg
        className={`w-10 h-10 ${isListening ? 'text-white' : 'text-neon-blue'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {isListening ? (
          // Stop icon when listening
          <rect x="6" y="6" width="12" height="12" strokeWidth="2" />
        ) : (
          // Microphone icon when idle
          <>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </>
        )}
      </svg>

      {/* Pulse effect when listening */}
      {isListening && (
        <motion.div
          className="absolute w-full h-full rounded-full border-2 border-neon-blue"
          animate={{
            scale: [1, 1.5, 1.5],
            opacity: [0.5, 0, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </motion.button>
  );
}
