import { LANGUAGE_CODES, TEXT_LIMIT } from '../src/data/languages.ts';
import type { TranslationResult } from '../src/types.ts';

export interface TranslateRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}
export interface ServerResult {
  status: number;
  body: TranslationResult | { error: { code: string; message: string } };
}

type TranslateInput = { text?: unknown; sourceLanguage?: unknown; targetLanguage?: unknown } | null;
export interface TranslatorConfig {
  key?: string;
  region?: string;
  endpoint?: string;
}
export type Fetcher = typeof fetch;

const error = (status: number, code: string, message: string): ServerResult => ({
  status,
  body: { error: { code, message } },
});

export function hasCredentials(config: TranslatorConfig): boolean {
  const key = config.key?.trim();
  return Boolean(key && !key.toLowerCase().includes('replace-with') && key.length > 5);
}

export function parseInput(input: unknown): TranslateRequest | ServerResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return error(400, 'INVALID_REQUEST', 'Send a JSON object containing text, sourceLanguage, and targetLanguage.');
  }
  const { text, sourceLanguage, targetLanguage } = input as TranslateInput & Record<string, unknown>;
  if (typeof text !== 'string' || !text.trim()) {
    return error(400, 'EMPTY_TEXT', 'Enter some text before translating.');
  }
  if (Array.from(text).length > TEXT_LIMIT) {
    return error(413, 'TEXT_TOO_LONG', `Keep your text under ${TEXT_LIMIT.toLocaleString('en-US')} characters.`);
  }
  if (typeof sourceLanguage !== 'string' || (sourceLanguage !== 'auto' && !LANGUAGE_CODES.has(sourceLanguage))) {
    return error(400, 'INVALID_SOURCE', 'Choose a supported source language or Auto detect.');
  }
  if (typeof targetLanguage !== 'string' || !LANGUAGE_CODES.has(targetLanguage)) {
    return error(400, 'INVALID_TARGET', 'Choose a supported target language.');
  }
  if (sourceLanguage === targetLanguage) {
    return error(400, 'SAME_LANGUAGE', 'Choose two different languages to translate between.');
  }
  return { text: text.trim(), sourceLanguage, targetLanguage };
}

function translatorEndpoint(endpoint?: string): URL | null {
  try {
    const url = new URL(endpoint || 'https://api.cognitive.microsofttranslator.com');
    // Azure endpoints must be HTTPS; no credentials transmitted via an insecure origin.
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return null;
    const pathname = url.pathname.replace(/\/+$/, '');
    url.pathname = `${pathname}/translate`;
    url.searchParams.set('api-version', '3.0');
    return url;
  } catch {
    return null;
  }
}

/** Provider interaction is kept separate so errors, validation and parsing can be tested. */
export async function translateText(
  input: unknown,
  config: TranslatorConfig,
  fetcher: Fetcher = fetch,
): Promise<ServerResult> {
  const parsed = parseInput(input);
  if ('status' in parsed) return parsed;
  if (!hasCredentials(config)) {
    return error(503, 'API_NOT_CONFIGURED', 'Translation is not configured yet. Add your Azure Translator API key to the server environment.');
  }
  const url = translatorEndpoint(config.endpoint);
  if (!url) return error(500, 'INVALID_ENDPOINT', 'The configured translation service endpoint is invalid. Check the server settings.');
  url.searchParams.set('to', parsed.targetLanguage);
  if (parsed.sourceLanguage !== 'auto') url.searchParams.set('from', parsed.sourceLanguage);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const headers: Record<string, string> = {
      'Ocp-Apim-Subscription-Key': config.key!.trim(),
      'Content-Type': 'application/json; charset=utf-8',
      'X-ClientTraceId': crypto.randomUUID(),
    };
    if (config.region?.trim()) headers['Ocp-Apim-Subscription-Region'] = config.region.trim();
    const response = await fetcher(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify([{ text: parsed.text }]),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return error(502, 'INVALID_CREDENTIALS', 'The translation provider rejected the API credentials. Check the Azure key and region.');
      }
      if (response.status === 429) return error(429, 'RATE_LIMIT', 'Translation limit reached. Please try again in a moment.');
      if (response.status === 400) return error(400, 'PROVIDER_BAD_REQUEST', 'The provider could not translate this language combination or text.');
      if (response.status === 413) return error(413, 'PROVIDER_TEXT_LIMIT', 'This text exceeds the provider request limit. Shorten your text and try again.');
      return error(502, 'PROVIDER_ERROR', 'The translation provider is temporarily unavailable. Please try again.');
    }

    const json: unknown = await response.json();
    if (!Array.isArray(json) || !json[0] || typeof json[0] !== 'object') {
      return error(502, 'INVALID_PROVIDER_RESPONSE', 'The translation provider returned an unexpected response.');
    }
    const item = json[0] as Record<string, unknown>;
    const translations = item.translations;
    const first = Array.isArray(translations) ? translations[0] as Record<string, unknown> | undefined : undefined;
    if (!first || typeof first.text !== 'string') {
      return error(502, 'INVALID_PROVIDER_RESPONSE', 'The translation provider returned an unexpected response.');
    }
    const detected = item.detectedLanguage;
    const detectedCode = detected && typeof detected === 'object' && 'language' in detected && typeof detected.language === 'string'
      ? detected.language : null;
    return {
      status: 200,
      body: {
        translatedText: first.text,
        detectedLanguage: detectedCode,
        sourceLanguage: parsed.sourceLanguage,
        targetLanguage: parsed.targetLanguage,
      },
    };
  } catch (caught) {
    if (caught instanceof Error && caught.name === 'AbortError') {
      return error(504, 'TRANSLATION_TIMEOUT', 'The request took too long. Check your connection and try again.');
    }
    return error(502, 'NETWORK_ERROR', 'Could not reach the translation service. Check your connection and try again.');
  } finally {
    clearTimeout(timeoutId);
  }
}
