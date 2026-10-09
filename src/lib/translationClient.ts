import type { ApiError, TranslationResult } from '../types';

export class TranslationClientError extends Error {
  constructor(message: string, public code: string, public status: number) {
    super(message);
    this.name = 'TranslationClientError';
  }
}

function getErrorPayload(value: unknown): ApiError['error'] | null {
  if (!value || typeof value !== 'object' || !('error' in value)) return null;
  const inner = (value as ApiError).error;
  return inner && typeof inner.message === 'string' && typeof inner.code === 'string' ? inner : null;
}

export async function requestTranslation(payload: {
  text: string; sourceLanguage: string; targetLanguage: string;
}, signal?: AbortSignal): Promise<TranslationResult> {
  let response: Response;
  try {
    response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new TranslationClientError('Could not connect to the Lingora server. Check that the API is running.', 'OFFLINE', 0);
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const providerError = getErrorPayload(data);
    throw new TranslationClientError(
      providerError?.message || 'Something went wrong while translating. Please try again.',
      providerError?.code || 'UNKNOWN', response.status,
    );
  }
  if (!data || typeof data !== 'object' || !('translatedText' in data)
    || typeof data.translatedText !== 'string'
    || !('sourceLanguage' in data) || typeof data.sourceLanguage !== 'string'
    || !('targetLanguage' in data) || typeof data.targetLanguage !== 'string'
    || !('detectedLanguage' in data) || (data.detectedLanguage !== null && typeof data.detectedLanguage !== 'string')) {
    throw new TranslationClientError('The server returned an invalid translation. Please try again.', 'BAD_RESPONSE', 502);
  }
  return data as TranslationResult;
}

export async function getApiConfigured(): Promise<boolean | null> {
  try {
    const response = await fetch('/api/status', { cache: 'no-store' });
    if (!response.ok) return null;
    const json: unknown = await response.json();
    if (json && typeof json === 'object' && 'configured' in json && typeof json.configured === 'boolean') return json.configured;
    return null;
  } catch { return null; }
}
