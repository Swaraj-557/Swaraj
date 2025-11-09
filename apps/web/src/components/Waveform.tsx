import { useEffect, useRef } from 'react';
import { useStore } from '../lib/store';

export default function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioVolume = useStore((state) => state.audioVolume);
  const aiState = useStore((state) => state.aiState);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;
    const bars = 50;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const barWidth = width / bars;
      const time = Date.now() / 1000;

      for (let i = 0; i < bars; i++) {
        const x = i * barWidth;
        
        // Base wave height
        let baseHeight = Math.sin(i * 0.5 + time * 2) * 20;
        
        // Add volume-based height when speaking
        if (aiState === 'speaking') {
          baseHeight += audioVolume * 80;
        } else if (aiState === 'listening') {
          baseHeight += Math.random() * 30;
        }

        const barHeight = Math.abs(baseHeight);

        // Gradient color
        const gradient = ctx.createLinearGradient(x, centerY - barHeight, x, centerY + barHeight);
        
        if (aiState === 'speaking') {
          gradient.addColorStop(0, '#ff0080');
          gradient.addColorStop(0.5, '#b877ff');
          gradient.addColorStop(1, '#00d4ff');
        } else if (aiState === 'listening') {
          gradient.addColorStop(0, '#00d4ff');
          gradient.addColorStop(1, '#00d4ff40');
        } else {
          gradient.addColorStop(0, '#00d4ff60');
          gradient.addColorStop(1, '#00d4ff20');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, centerY - barHeight / 2, barWidth - 2, barHeight);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioVolume, aiState]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <canvas
        ref={canvasRef}
        width={800}
        height={120}
        className="w-full h-auto rounded-lg"
        style={{
          background: 'linear-gradient(90deg, #1a1a2e00 0%, #1a1a2e40 50%, #1a1a2e00 100%)',
        }}
      />
    </div>
  );
}
