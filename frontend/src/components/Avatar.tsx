import { motion } from 'framer-motion';
import { AvatarState } from '../types';

interface AvatarProps {
  state: AvatarState;
  audioLevel?: number;
}

export const Avatar = ({ state, audioLevel = 0 }: AvatarProps) => {
  const getStateColor = () => {
    switch (state) {
      case 'listening':
        return 'from-cyber-blue to-cyan-400';
      case 'thinking':
        return 'from-cyber-purple to-purple-400';
      case 'speaking':
        return 'from-cyber-pink to-pink-400';
      default:
        return 'from-cyber-blue via-cyber-purple to-cyber-pink';
    }
  };

  const scale = 1 + (audioLevel * 0.3);

  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl opacity-50"
        style={{
          background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main avatar circle */}
      <motion.div
        className={`absolute inset-8 rounded-full bg-gradient-to-br ${getStateColor()} flex items-center justify-center shadow-2xl`}
        animate={{
          scale: state === 'speaking' ? scale : 1,
        }}
        transition={{
          duration: 0.1,
        }}
      >
        {/* Inner circle with icon */}
        <div className="w-32 h-32 rounded-full bg-cyber-darker/50 backdrop-blur-sm flex items-center justify-center">
          <motion.div
            className="text-6xl"
            animate={{
              rotate: state === 'thinking' ? 360 : 0,
            }}
            transition={{
              duration: 2,
              repeat: state === 'thinking' ? Infinity : 0,
              ease: 'linear',
            }}
          >
            {state === 'listening' && '🎤'}
            {state === 'thinking' && '🧠'}
            {state === 'speaking' && '🗣️'}
            {state === 'idle' && '😊'}
          </motion.div>
        </div>
      </motion.div>

      {/* Pulse rings for listening state */}
      {state === 'listening' && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyber-blue"
            animate={{
              scale: [1, 1.5],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyber-blue"
            animate={{
              scale: [1, 1.5],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.5,
            }}
          />
        </>
      )}
    </div>
  );
};
