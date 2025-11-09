import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../lib/store';
import { useEffect } from 'react';

export default function ToolNotification() {
  const toolNotifications = useStore((state) => state.toolNotifications);
  const clearToolNotifications = useStore((state) => state.clearToolNotifications);

  useEffect(() => {
    if (toolNotifications.length > 0) {
      const timer = setTimeout(() => {
        clearToolNotifications();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toolNotifications, clearToolNotifications]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toolNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-gradient-to-r from-neon-purple to-neon-pink p-4 rounded-lg shadow-lg max-w-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="text-white font-medium text-sm">
                {notification.message}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
