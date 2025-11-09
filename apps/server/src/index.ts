import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import ttsRouter from './routes/tts.js';
import toolsRouter from './routes/tools.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Swaraj AI Server is running' });
});

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/tts', ttsRouter);
app.use('/api/tools', toolsRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Swaraj AI Server running on http://localhost:${PORT}`);
  console.log(`✨ Ready to assist with voice and intelligence`);
});
