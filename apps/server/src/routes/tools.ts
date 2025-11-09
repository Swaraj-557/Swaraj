import { Router } from 'express';
import { executeTool } from '../core/agent.js';

const router = Router();

router.post('/execute', async (req, res) => {
  try {
    const { name, args = {}, sessionId = 'default' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Tool name is required' });
    }

    const result = await executeTool(name, args, sessionId);
    res.json(result);
  } catch (error: any) {
    console.error('Tools route error:', error);
    res.status(500).json({ error: 'Failed to execute tool', message: error.message });
  }
});

export default router;
