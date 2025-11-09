import { Router } from 'express';
import { chat } from '../core/gemini.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { text, sessionId = 'default' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await chat(text, sessionId);
    res.json(response);
  } catch (error: any) {
    console.error('Chat route error:', error);
    res.status(500).json({ error: 'Failed to process chat', message: error.message });
  }
});

export default router;
