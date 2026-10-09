import type { IncomingMessage, ServerResponse } from 'node:http';
import { hasCredentials } from '../server/translator.ts';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for configuration status.' } }));
    return;
  }
  res.statusCode = 200;
  res.end(JSON.stringify({ configured: hasCredentials({ key: process.env.AZURE_TRANSLATOR_KEY }) }));
}
