import { Router } from 'express';
import { generateSpeech, generateSpeechStream } from '../core/elevenlabs.js';

const router = Router();

// Generate speech and return as base64
router.post('/', async (req, res) => {
  try {
    const { text, stream = false } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (stream) {
      // Stream audio
      const audioStream = await generateSpeechStream({ text });
      res.setHeader('Content-Type', 'audio/mpeg');
      audioStream.pipe(res);
    } else {
      // Return base64 audio
      const audioBuffer = await generateSpeech({ text });
      const base64Audio = audioBuffer.toString('base64');
      res.json({ audio: base64Audio });
    }
  } catch (error: any) {
    console.error('TTS route error:', error);
    res.status(500).json({ error: 'Failed to generate speech', message: error.message });
  }
});

export default router;
