import { motion } from 'framer-motion';
import { useStore } from '../lib/store';

export default function Avatar() {
  const aiState = useStore((state) => state.aiState);

  const getStateConfig = () => {
    switch (aiState) {
      case 'listening':
        return {
          color: '#00d4ff',
          scale: 1.1,
          glow: '0 0 40px #00d4ff',
          text: 'Listening...',
        };
      case 'thinking':
        return {
          color: '#b877ff',
          scale: 1.05,
          glow: '0 0 30px #b877ff',
          text: 'Thinking...',
        };
      case 'speaking':
        return {
          color: '#ff0080',
          scale: 1.15,
          glow: '0 0 50px #ff0080',
          text: 'Speaking...',
        };
      default:
        return {
          color: '#00d4ff',
          scale: 1,
          glow: '0 0 20px #00d4ff',
          text: 'Ready',
        };
    }
  };

  const config = getStateConfig();

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Avatar Circle */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={{
          scale: config.scale,
        }}
        transition={{
          duration: 0.5,
          ease: 'easeInOut',
        }}
      >
        {/* Outer Glow Ring */}
        <motion.div
          className="absolute w-64 h-64 rounded-full"
          style={{
            background: `radial-gradient(circle, ${config.color}20 0%, transparent 70%)`,
          }}
          animate={{
            scale: aiState === 'idle' ? [1, 1.2, 1] : [1, 1.3, 1],
            opacity: aiState === 'idle' ? [0.5, 0.8, 0.5] : [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Middle Ring */}
        <motion.div
          className="absolute w-48 h-48 rounded-full border-2"
          style={{
            borderColor: config.color,
            boxShadow: config.glow,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            className="absolute w-3 h-3 rounded-full top-0 left-1/2 -translate-x-1/2"
            style={{ backgroundColor: config.color }}
          />
        </motion.div>

        {/* Inner Avatar */}
        <motion.div
          className="w-40 h-40 rounded-full flex items-center justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${config.color}40 0%, ${config.color}10 100%)`,
            border: `2px solid ${config.color}`,
            boxShadow: config.glow,
          }}
          animate={{
            boxShadow: [config.glow, `0 0 60px ${config.color}`, config.glow],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Avatar Icon/Initial */}
          <div className="text-6xl font-bold gradient-text">S</div>
          
          {/* Animated particles */}
          {aiState !== 'idle' && (
            <>
              <motion.div
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: config.color }}
                animate={{
                  x: [0, 30, 0],
                  y: [0, -30, 0],
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              <motion.div
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: config.color }}
                animate={{
                  x: [0, -30, 0],
                  y: [0, 30, 0],
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              />
            </>
          )}
        </motion.div>
      </motion.div>

      {/* State Text */}
      <motion.div
        className="mt-8 text-xl font-semibold"
        style={{ color: config.color }}
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {config.text}
      </motion.div>

      {/* Subtitle */}
      <div className="mt-2 text-sm text-gray-400">
        Swaraj AI - Digital Voice Assistant
      </div>
    </div>
  );
}
