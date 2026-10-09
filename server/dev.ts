import express from 'express';
import { config as loadEnvironment } from 'dotenv';
import { hasCredentials, translateText } from './translator.ts';

loadEnvironment();
const app = express();
app.disable('x-powered-by');
app.use('/api', express.json({ limit: '32kb' }));
app.get('/api/status', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ configured: hasCredentials({ key: process.env.AZURE_TRANSLATOR_KEY }) });
});
app.post('/api/translate', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const result = await translateText(req.body, {
    key: process.env.AZURE_TRANSLATOR_KEY,
    region: process.env.AZURE_TRANSLATOR_REGION,
    endpoint: process.env.AZURE_TRANSLATOR_ENDPOINT,
  });
  res.status(result.status).json(result.body);
});
app.use('/api', (_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Unknown API route.' } }));
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err && typeof err === 'object' && 'type' in err && err.type === 'entity.too.large') {
    res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'The request body is too large.' } });
  } else {
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Send a valid JSON request.' } });
  }
});
const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`Lingora API running at http://localhost:${port}`));
