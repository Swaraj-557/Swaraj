import { Router } from 'express';
import { generateSpeech, generateSpeechStream } from '../core/google-tts.js';

const router = Router();

// Generate speech and return as base64
router.post('/', async (req, res) => {
  try {
    const { text, stream = false, voice, languageCode, speakingRate, pitch } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const ttsOptions = {
      text,
      voice: voice || 'hi-IN-Neural2-B',
      languageCode: languageCode || 'hi-IN',
      speakingRate: speakingRate || 1.0,
      pitch: pitch || 0,
    };

    if (stream) {
      // For Google TTS, we still return the complete audio
      const audioBuffer = await generateSpeechStream(ttsOptions);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(audioBuffer);
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
