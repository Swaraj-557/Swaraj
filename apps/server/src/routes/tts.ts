import { Router } from 'express';
import { generateSpeech, generateSpeechStream } from '../core/azure-tts.js';

const router = Router();

// Generate speech and return as base64
router.post('/', async (req, res) => {
  try {
    const { text, stream = false, voice, style, rate, pitch } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const ttsOptions = {
      text,
      voice: voice || 'en-US-AdamMultilingualNeural',
      style: style || 'friendly',
      rate: rate || '0%',
      pitch: pitch || '0%',
    };

    if (stream) {
      // Stream audio
      const audioStream = await generateSpeechStream(ttsOptions);
      res.setHeader('Content-Type', 'audio/mpeg');
      audioStream.pipe(res);
    } else {
      // Return base64 audio
      const audioBuffer = await generateSpeech(ttsOptions);
      const base64Audio = audioBuffer.toString('base64');
      res.json({ audio: base64Audio });
    }
  } catch (error: any) {
    console.error('TTS route error:', error);
    res.status(500).json({ error: 'Failed to generate speech', message: error.message });
  }
});

export default router;
