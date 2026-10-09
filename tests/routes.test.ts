import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { IncomingMessage, ServerResponse } from 'node:http';
import translationHandler from '../api/translate.ts';
import statusHandler from '../api/status.ts';

interface Result { status: number; body: unknown; headers: Record<string, string> }
function mockResponse(): { res: ServerResponse; result: () => Result } {
  const result: Result = { status: 200, body: null, headers: {} };
  const response = {
    statusCode: 200,
    setHeader(name: string, value: string) { result.headers[name] = value; },
    end(body: string) { result.status = this.statusCode; result.body = JSON.parse(body); },
  };
  return { res: response as unknown as ServerResponse, result: () => result };
}

test('configuration endpoint does not expose secrets', () => {
  const { res, result } = mockResponse();
  statusHandler({ method: 'GET' } as IncomingMessage, res);
  assert.deepEqual(result().body, { configured: false });
  assert.equal(JSON.stringify(result().body).includes('KEY'), false);
});
test('translation route rejects non-POST methods with 405', async () => {
  const { res, result } = mockResponse();
  await translationHandler({ method: 'GET' } as IncomingMessage, res);
  assert.equal(result().status, 405);
});
test('translation route reports required setup without external API requests', async () => {
  const { res, result } = mockResponse();
  await translationHandler({ method: 'POST', body: { text: 'hello', sourceLanguage: 'en', targetLanguage: 'es' } } as IncomingMessage, res);
  assert.equal(result().status, 503);
  assert.deepEqual((result().body as { error: { code: string } }).error.code, 'API_NOT_CONFIGURED');
});
test('translation route returns a readable error for malformed Vercel JSON', async () => {
  const { res, result } = mockResponse();
  const req = { method: 'POST', get body() { throw new SyntaxError('invalid json'); } } as IncomingMessage;
  await translationHandler(req, res);
  assert.equal(result().status, 400);
  assert.equal((result().body as { error: { code: string } }).error.code, 'INVALID_JSON');
});
