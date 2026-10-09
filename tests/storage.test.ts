import assert from 'node:assert/strict';
import { test } from 'node:test';
import { insertHistory, loadHistory, loadTheme, saveHistory, saveTheme } from '../src/lib/storage.ts';
import type { TranslationEntry } from '../src/types.ts';

const makeEntry = (index: number): TranslationEntry => ({
  id: String(index),
  createdAt: index,
  sourceText: `Hello ${index}`,
  translatedText: `Hola ${index}`,
  sourceLanguage: 'en',
  targetLanguage: 'es',
  detectedLanguage: null,
});

test('history inserts newest first and de-duplicates the same direction/text', () => {
  const entry = makeEntry(1);
  const next = insertHistory([entry], { ...entry, id: 'new', createdAt: 2 });
  assert.deepEqual(next.map(item => item.id), ['new']);
});
test('history keeps only the newest 30 entries', () => {
  const next = Array.from({ length: 33 }, (_, i) => i).reduce<TranslationEntry[]>(
    (entries, i) => insertHistory(entries, makeEntry(i)), []);
  assert.equal(next.length, 30);
  assert.equal(next[0].id, '32');
  assert.equal(next.at(-1)?.id, '3');
});
test('local history and theme survive simulated reload and handle malformed data', () => {
  const memory = new Map<string, string>();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { localStorage: { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value) } },
  });
  assert.equal(loadTheme(), 'light');
  saveTheme('dark');
  assert.equal(loadTheme(), 'dark');
  assert.equal(saveHistory([makeEntry(4)]), true);
  assert.deepEqual(loadHistory(), [makeEntry(4)]);
  memory.set('lingora:history:v1', '{bad-json');
  assert.deepEqual(loadHistory(), []);
  delete (globalThis as { window?: unknown }).window;
});
