import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'Vibe QA API', 
    version: '0.0.0',
    status: 'running' 
  });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
