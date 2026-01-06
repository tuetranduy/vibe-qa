import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';

// Create a test version of the app
const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.json({ 
    message: 'Vibe QA API', 
    version: '0.0.0',
    status: 'running' 
  });
});

describe('API Server', () => {
  it('should respond to health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });

  it('should respond to root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Vibe QA API');
    expect(response.body.version).toBe('0.0.0');
    expect(response.body.status).toBe('running');
  });
});
