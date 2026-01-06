import express, { Request, Response } from 'express';
import cors from "cors";
import { prisma } from '@vibe-qa/database';
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './modules/users/users.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.use(requestIdMiddleware);

app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$connect();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Vibe QA API',
    version: '0.0.0',
    status: 'running'
  });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

app.use(errorHandler);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
};

startServer();

export { app };
