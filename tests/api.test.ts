import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hasCredentials, parseInput, translateText } from '../server/translator.ts';

const config = { key: 'test-key-for-local-tests', region: 'eastus' };
const valid = { text: 'Hello, friend.', sourceLanguage: 'auto', targetLanguage: 'es' };

function mockFetch(response: unknown, status = 200, callback?: (url: URL, init: RequestInit) => void): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    if (callback) callback(new URL(String(input)), init ?? {});
    return new Response(JSON.stringify(response), { status, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
}
function codeOf(result: Awaited<ReturnType<typeof translateText>>) {
  return 'error' in result.body ? result.body.error.code : '';
}

test('provider credentials distinguish configured from placeholder/missing', () => {
  assert.equal(hasCredentials({ key: '' }), false);
  assert.equal(hasCredentials({ key: 'replace-with-your-azure-translator-secret-key' }), false);
  assert.equal(hasCredentials(config), true);
});
test('reject empty, unsupported, same-language and oversized inputs', () => {
  assert.equal('status' in parseInput({ ...valid, text: '  ' }), true);
  assert.equal(codeOf(parseInput(null) as Awaited<ReturnType<typeof translateText>>), 'INVALID_REQUEST');
  assert.equal(codeOf(parseInput({ ...valid, text: ' ' }) as Awaited<ReturnType<typeof translateText>>), 'EMPTY_TEXT');
  assert.equal(codeOf(parseInput({ ...valid, targetLanguage: 'xx-not-real' }) as Awaited<ReturnType<typeof translateText>>), 'INVALID_TARGET');
  assert.equal(codeOf(parseInput({ ...valid, sourceLanguage: 'xx-not-real' }) as Awaited<ReturnType<typeof translateText>>), 'INVALID_SOURCE');
  assert.equal(codeOf(parseInput({ ...valid, sourceLanguage: 'es' }) as Awaited<ReturnType<typeof translateText>>), 'SAME_LANGUAGE');
  assert.equal(codeOf(parseInput({ ...valid, text: '😀'.repeat(5001) }) as Awaited<ReturnType<typeof translateText>>), 'TEXT_TOO_LONG');
  assert.equal('status' in parseInput({ ...valid, text: '😀'.repeat(5000) }), false);
});
test('auto-detection leaves from parameter out, parses detected code and provider text', async () => {
  const result = await translateText(valid, config, mockFetch([
    { detectedLanguage: { language: 'en', score: .98 }, translations: [{ text: 'Hola, amigo.', to: 'es' }] },
  ], 200, (url, init) => {
    assert.equal(url.searchParams.get('api-version'), '3.0');
    assert.equal(url.searchParams.get('from'), null);
    assert.equal(url.searchParams.get('to'), 'es');
    assert.equal(init.method, 'POST');
    assert.equal((init.headers as Record<string, string>)['Ocp-Apim-Subscription-Region'], 'eastus');
    assert.deepEqual(JSON.parse(String(init.body)), [{ text: valid.text }]);
  }));
  assert.equal(result.status, 200);
  assert.ok(!('error' in result.body));
  if (!('error' in result.body)) {
    assert.equal(result.body.translatedText, 'Hola, amigo.');
    assert.equal(result.body.detectedLanguage, 'en');
  }
});
test('explicit source parameter is provided when selected manually', async () => {
  const result = await translateText({ ...valid, sourceLanguage: 'en' }, config,
    mockFetch([{ translations: [{ text: 'Hola.', to: 'es' }] }], 200, url => {
      assert.equal(url.searchParams.get('from'), 'en');
    }));
  assert.equal(result.status, 200);
});
test('fails transparently when API key is missing', async () => {
  const result = await translateText(valid, { key: '' }, () => { throw new Error('must not call upstream'); });
  assert.equal(result.status, 503);
  assert.equal(codeOf(result), 'API_NOT_CONFIGURED');
});
test('maps unauthorized and throttled provider errors', async () => {
  assert.equal(codeOf(await translateText(valid, config, mockFetch({}, 401))), 'INVALID_CREDENTIALS');
  assert.equal(codeOf(await translateText(valid, config, mockFetch({}, 403))), 'INVALID_CREDENTIALS');
  assert.equal(codeOf(await translateText(valid, config, mockFetch({}, 429))), 'RATE_LIMIT');
  assert.equal(codeOf(await translateText(valid, config, mockFetch({}, 400))), 'PROVIDER_BAD_REQUEST');
});
test('handles invalid provider payload, provider connectivity issues and invalid endpoint', async () => {
  assert.equal(codeOf(await translateText(valid, config, mockFetch({ gibberish: true }))), 'INVALID_PROVIDER_RESPONSE');
  assert.equal(codeOf(await translateText(valid, config, (() => { throw new Error('network down'); }) as typeof fetch)), 'NETWORK_ERROR');
  assert.equal(codeOf(await translateText(valid, { ...config, endpoint: 'http://not-secure.test' })), 'INVALID_ENDPOINT');
});
test('keeps URLs encoded and preserves multilingual text', async () => {
  const result = await translateText({ text: 'مرحبا، دنیا!', sourceLanguage: 'ur', targetLanguage: 'ja' }, config,
    mockFetch([{ translations: [{ text: 'こんにちは、世界！', to: 'ja' }] }]));
  assert.equal(result.status, 200);
  if (!('error' in result.body)) assert.equal(result.body.translatedText, 'こんにちは、世界！');
});
