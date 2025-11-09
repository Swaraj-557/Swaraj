import { motion, AnimatePresence } from 'framer-motion';

interface CommandFeedbackProps {
  message: string;
  type: 'info' | 'success' | 'error' | 'processing';
  visible: boolean;
}

export const CommandFeedback = ({ message, type, visible }: CommandFeedbackProps) => {
  const getIcon = () => {
    switch (type) {
      case 'processing':
        return '⚡';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'processing':
        return 'border-cyber-blue bg-cyber-blue/10';
      case 'success':
        return 'border-green-500 bg-green-500/10';
      case 'error':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-cyber-purple bg-cyber-purple/10';
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg border-2 ${getColor()} backdrop-blur-md shadow-lg`}
        >
          <div className="flex items-center gap-3">
            <motion.span
              className="text-2xl"
              animate={type === 'processing' ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              {getIcon()}
            </motion.span>
            <span className="text-white font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
