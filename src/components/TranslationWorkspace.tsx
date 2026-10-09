import {
  AlertCircle, ArrowDownUp, ArrowRight, Check, CheckCheck, Clipboard, Copy,
  Info, Languages, LoaderCircle, RotateCw, Sparkles, Volume2, VolumeX, X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { languageByCode, languageName, TEXT_LIMIT } from '../data/languages';
import { requestTranslation, TranslationClientError } from '../lib/translationClient';
import { useSpeech } from '../hooks/useSpeech';
import type { TranslationResult } from '../types';
import { LanguageSelect } from './LanguageSelect';

interface WorkspaceProps {
  sourceText: string;
  setSourceText: (value: string) => void;
  sourceLanguage: string;
  setSourceLanguage: (value: string) => void;
  targetLanguage: string;
  setTargetLanguage: (value: string) => void;
  result: TranslationResult | null;
  setResult: (value: TranslationResult | null) => void;
  onSuccess: (sourceText: string, result: TranslationResult) => void;
  apiConfigured: boolean | null;
  onVisitHistory: () => void;
}
export function TranslationWorkspace(props: WorkspaceProps) {
  const {
    sourceText, setSourceText, sourceLanguage, setSourceLanguage, targetLanguage, setTargetLanguage,
    result, setResult, onSuccess, apiConfigured, onVisitHistory,
  } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState<'source' | 'target' | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<AbortController | null>(null);
  const inFlight = useRef(false);
  const { speak, stop, speaking, speechError, supported } = useSpeech();
  const characterCount = Array.from(sourceText).length;

  const cancelPending = useCallback(() => {
    pending.current?.abort(); pending.current = null; inFlight.current = false;
    setLoading(false);
  }, []);
  useEffect(() => () => { pending.current?.abort(); if (timer.current) clearTimeout(timer.current); }, []);
  const clearResult = useCallback(() => { setResult(null); setError(null); setNotice(null); stop(); cancelPending(); }, [cancelPending, setResult, stop]);

  const onInput = (text: string) => { setSourceText(text); clearResult(); };
  const onSource = (language: string) => { setSourceLanguage(language); clearResult(); };
  const onTarget = (language: string) => { setTargetLanguage(language); clearResult(); };

  const swap = () => {
    setNotice(null); setError(null); stop(); cancelPending();
    const actualSource = sourceLanguage === 'auto' ? result?.detectedLanguage : sourceLanguage;
    if (!actualSource || !languageByCode(actualSource)) {
      setNotice('To swap languages, choose a source language or translate once to detect it.');
      return;
    }
    setSourceLanguage(targetLanguage);
    setTargetLanguage(actualSource);
    // Only reverse text when translation is based on the current input and language pair.
    if (result && result.translatedText) {
      setSourceText(result.translatedText);
      setResult({ translatedText: sourceText, detectedLanguage: null, sourceLanguage: targetLanguage, targetLanguage: actualSource });
    } else setResult(null);
  };

  const translate = useCallback(async () => {
    if (inFlight.current) return;
    setNotice(null); setError(null);
    if (!sourceText.trim()) { setError('Add a few words on the left to start translating.'); return; }
    if (characterCount > TEXT_LIMIT) { setError(`Translation supports up to ${TEXT_LIMIT.toLocaleString()} characters at a time.`); return; }
    if (sourceLanguage === targetLanguage) { setError('Choose two different languages to translate between.'); return; }
    if (apiConfigured === false) { setError('Translation needs an Azure Translator API key. See the setup instructions in README.md.'); return; }
    const controller = new AbortController();
    pending.current = controller;
    inFlight.current = true;
    setLoading(true); setResult(null); stop();
    try {
      const translation = await requestTranslation({ text: sourceText, sourceLanguage, targetLanguage }, controller.signal);
      if (!controller.signal.aborted) {
        setResult(translation);
        onSuccess(sourceText.trim(), translation);
      }
    } catch (caught) {
      if (controller.signal.aborted) return;
      setError(caught instanceof TranslationClientError || caught instanceof Error
        ? caught.message : 'Translation failed. Please try again.');
    } finally {
      if (pending.current === controller) {
        pending.current = null; inFlight.current = false; setLoading(false);
      }
    }
  }, [apiConfigured, characterCount, onSuccess, setResult, sourceLanguage, sourceText, stop, targetLanguage]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault(); void translate();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [translate]);

  const copy = async (side: 'source' | 'target', text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(side);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 1800);
    } catch { setNotice('Could not copy automatically. Select the text and copy it manually.'); }
  };
  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) { setNotice('Your clipboard is empty.'); return; }
      if (Array.from(text).length > TEXT_LIMIT) { setNotice('Pasted text is too long. Please use 5,000 characters or fewer.'); return; }
      onInput(text);
    } catch { setNotice('Clipboard access was blocked. Use Ctrl + V or Cmd + V to paste.'); }
  };
  const translationPresent = !!result && !loading;
  const sourceReadCode = sourceLanguage === 'auto' ? result?.detectedLanguage ?? 'auto' : sourceLanguage;
  const rtlSource = ['ar', 'fa', 'he', 'ur'].includes(sourceReadCode);
  const rtlTarget = ['ar', 'fa', 'he', 'ur'].includes(targetLanguage);
  return <section className="workspace-shell" aria-label="Language translation workspace">
    <div className="workspace-topline"><div><span className="workspace-index">01</span><span className="workspace-top-label">YOUR TRANSLATION SPACE</span></div>
      <span className="workspace-top-right"><span className="live-pip"/> A LITTLE CLOSER, WITH EVERY WORD</span></div>
    <div className="workspace-card">
      <div className="workspace-language-row">
        <div className="selector-column"><span className="field-label">FROM</span>
          <LanguageSelect label="Source language" value={sourceLanguage} onChange={onSource} allowAuto /></div>
        <div className="swap-holder"><button type="button" onClick={swap} className="swap-button" title="Swap languages" aria-label="Swap source and target languages"><ArrowDownUp size={19} strokeWidth={1.8}/></button></div>
        <div className="selector-column target-selector"><span className="field-label">TO</span>
          <LanguageSelect label="Target language" value={targetLanguage} onChange={onTarget} align="right" /></div>
      </div>
      <div className="translation-panels">
        <div className="translation-panel input-panel">
          <div className="panel-heading"><span><span className="panel-heading-num">01 /</span> ORIGINAL TEXT</span><span className="input-hint">YOUR WORDS</span></div>
          <label className="sr-only" htmlFor="translation-input">Text to translate</label>
          <textarea id="translation-input" value={sourceText} onChange={event => onInput(event.target.value)}
            placeholder="Start typing something beautiful..." autoCapitalize="sentences"
            spellCheck lang={sourceReadCode !== 'auto' ? sourceReadCode : undefined}
            dir={rtlSource ? 'rtl' : 'auto'} aria-describedby="input-counter" />
          <div className="panel-bottom"><div className="panel-icon-actions">
            <button className="tool-button" type="button" onClick={() => void paste()} title="Paste from clipboard" aria-label="Paste text"><Clipboard size={18}/></button>
            <button className="tool-button" type="button" onClick={() => speak('source', sourceText, sourceReadCode)} disabled={!sourceText.trim()} title="Read original text aloud" aria-label={speaking === 'source' ? 'Stop speaking' : 'Read source text aloud'}>
              {speaking === 'source' ? <VolumeX size={18}/> : <Volume2 size={18}/>}</button>
            {sourceText && <button className="tool-button" type="button" onClick={() => void copy('source', sourceText)} title="Copy original text" aria-label="Copy original text">{copied === 'source' ? <Check size={18}/> : <Copy size={18}/>}</button>}
            {sourceText && <button className="tool-button" type="button" onClick={() => onInput('')} title="Clear text" aria-label="Clear source text"><X size={18}/></button>}
            {copied === 'source' && <span className="copied-inline" role="status">Copied</span>}
          </div><span id="input-counter" className={`char-count ${characterCount >= TEXT_LIMIT ? 'limit-count' : ''}`}>{characterCount.toLocaleString()} / {TEXT_LIMIT.toLocaleString()}</span></div>
        </div>
        <div className="translation-panel output-panel">
          <div className="panel-heading"><span><span className="panel-heading-num">02 /</span> TRANSLATION</span><span className="output-hint">NEW PERSPECTIVE <Sparkles size={13}/></span></div>
          <div className={`translation-output ${translationPresent ? 'output-filled' : ''}`} aria-label="Translated text" aria-live="polite" aria-busy={loading} dir={rtlTarget ? 'rtl' : 'auto'} lang={targetLanguage}>
            {loading ? <div className="output-centered"><LoaderCircle className="loading-icon" size={29}/><h3>Finding the right words...</h3><p>Translating your message with care.</p></div>
              : translationPresent ? result.translatedText
              : <div className="empty-output" dir="ltr"><div className="empty-symbol"><span>Aa</span><ArrowRight size={19} strokeWidth={1.5}/><span>あ</span></div>
                <h3>A new way to say it.</h3><p>Your translation will find its place here.</p></div>}
          </div>
          <div className="panel-bottom"><div className="panel-icon-actions">
            <button className="tool-button" type="button" disabled={!translationPresent} onClick={() => speak('target', result?.translatedText ?? '', targetLanguage)}
              title="Read translation aloud" aria-label={speaking === 'target' ? 'Stop speaking' : 'Read translation aloud'}>
              {speaking === 'target' ? <VolumeX size={18}/> : <Volume2 size={18}/>}</button>
            <button className={`tool-button copy-output ${copied === 'target' ? 'tool-success' : ''}`} type="button" disabled={!translationPresent}
              onClick={() => void copy('target', result?.translatedText ?? '')} title="Copy translation" aria-label="Copy translated text">
              {copied === 'target' ? <CheckCheck size={18}/> : <Copy size={18}/>}</button>
            {copied === 'target' && <span className="copied-inline" role="status">Copied!</span>}
          </div><span className="output-subnote">{translationPresent && sourceLanguage === 'auto' && result?.detectedLanguage
            ? `Detected: ${languageName(result.detectedLanguage)}` : translationPresent ? 'Translation complete' : 'READY WHEN YOU ARE'}</span></div>
        </div>
      </div>
      {(error || notice || speechError || apiConfigured === false) && <div className="message-stack" role="status">
        {apiConfigured === false && <div className="api-notice"><Info size={18}/><div><strong>Translation service needs setup.</strong>
          <span>Connect an Azure Translator API key in your server environment to enable live translations. See <code>README.md</code>.</span></div></div>}
        {error && <div className="inline-message message-error" role="alert"><AlertCircle size={17}/><span>{error}</span><button type="button" onClick={() => setError(null)} aria-label="Dismiss error"><X size={15}/></button></div>}
        {notice && <div className="inline-message"><Info size={17}/><span>{notice}</span><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notice"><X size={15}/></button></div>}
        {speechError && <div className="inline-message"><VolumeX size={17}/><span>{speechError}</span></div>}
      </div>}
      <div className="workspace-actionbar"><div className="actionbar-note"><span className="small-sparkle"><Sparkles size={16} strokeWidth={1.8}/></span><span>Every word has a world behind it.</span></div>
        <button type="button" onClick={() => void translate()} disabled={loading} className="primary-button translate-button">
          {loading ? <><LoaderCircle size={17} className="loading-icon"/> Translating...</> : <>Translate text <ArrowRight size={17}/></>}
          {!loading && <span className="shortcut-label">⌘ ↵</span>}
        </button>
      </div>
    </div>
    <div className="workspace-below"><span><Info size={14}/> {supported ? 'Tip: use Ctrl / Cmd + Enter to translate' : 'Translation works in your browser'}</span>
      <button type="button" onClick={onVisitHistory}>View your translation history <RotateCw size={14}/></button></div>
  </section>;
}
