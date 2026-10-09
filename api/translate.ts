import type { IncomingMessage, ServerResponse } from 'node:http';
import { translateText } from '../server/translator.ts';

interface ApiRequest extends IncomingMessage { body?: unknown }

export default async function handler(req: ApiRequest, res: ServerResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.statusCode = 405;
    res.end(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST to translate text.' } }));
    return;
  }
  // Vercel parses JSON lazily; malformed JSON can throw when req.body is accessed.
  let body: unknown;
  try { body = req.body; }
  catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: { code: 'INVALID_JSON', message: 'Send a valid JSON request.' } }));
    return;
  }
  const result = await translateText(body, {
    key: process.env.AZURE_TRANSLATOR_KEY,
    region: process.env.AZURE_TRANSLATOR_REGION,
    endpoint: process.env.AZURE_TRANSLATOR_ENDPOINT,
  });
  res.statusCode = result.status;
  res.end(JSON.stringify(result.body));
}
