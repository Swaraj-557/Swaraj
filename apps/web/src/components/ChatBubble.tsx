import { motion } from 'framer-motion';
import { Message } from '../lib/store';

interface ChatBubbleProps {
  message: Message;
  index: number;
}

export default function ChatBubble({ message, index }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`
          max-w-[70%] p-4 rounded-2xl
          ${isUser
            ? 'bg-gradient-to-br from-neon-blue to-neon-purple text-white rounded-br-none'
            : 'bg-dark-surface border border-neon-blue/30 text-gray-100 rounded-bl-none'
          }
        `}
      >
        {/* Role label */}
        <div className={`text-xs font-semibold mb-1 ${isUser ? 'text-white/70' : 'text-neon-blue'}`}>
          {isUser ? 'You' : 'Swaraj AI'}
        </div>

        {/* Message content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Timestamp */}
        <div className={`text-xs mt-2 ${isUser ? 'text-white/50' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </motion.div>
  );
}
