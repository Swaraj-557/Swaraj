import { Router } from 'express';
import { googleTTS } from '../core/google-tts.js';

const router = Router();

// Generate speech and return as base64
router.post('/', async (req, res) => {
  try {
    const { text, voice } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const voiceName = voice || 'en-US-Neural2-D';
    const languageCode = voiceName.split('-').slice(0, 2).join('-');

    const audioBuffer = await googleTTS(text, languageCode, voiceName);
    if (audioBuffer) {
        const base64Audio = Buffer.from(audioBuffer as Uint8Array).toString('base64');
        res.json({ audio: base64Audio });
    } else {
        return res.status(500).json({ error: 'Audio generation failed, buffer is null' });
    }

  } catch (error: any) {
    console.error('TTS route error:', error);
    res.status(500).json({ error: 'Failed to generate speech', message: error.message });
  }
});

export default router;
