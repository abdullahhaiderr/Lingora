import { ArrowUpRight, CircleCheck, Globe2, Lock, WandSparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AboutView } from './components/AboutView';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HistoryView } from './components/HistoryView';
import { TranslationWorkspace } from './components/TranslationWorkspace';
import { getApiConfigured } from './lib/translationClient';
import { insertHistory, loadHistory, loadTheme, saveHistory, saveTheme } from './lib/storage';
import type { Theme, TranslationEntry, TranslationResult, View } from './types';
import { LANGUAGES } from './data/languages';

function App() {
  const [view, setView] = useState<View>('translate');
  const [theme, setTheme] = useState<Theme>(loadTheme);
  const [history, setHistory] = useState<TranslationEntry[]>(loadHistory);
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  const [sourceText, setSourceText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [result, setResult] = useState<TranslationResult | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f7f7f2' : '#171e1a');
    saveTheme(theme);
  }, [theme]);
  useEffect(() => { saveHistory(history); }, [history]);
  useEffect(() => { void getApiConfigured().then(setApiConfigured); }, []);

  const navigate = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleSuccess = useCallback((original: string, translation: TranslationResult) => {
    const entry: TranslationEntry = {
      id: crypto.randomUUID(),
      sourceText: original,
      ...translation,
      createdAt: Date.now(),
    };
    setHistory(prev => insertHistory(prev, entry));
  }, []);
  const reuseTranslation = (entry: TranslationEntry) => {
    setSourceText(entry.sourceText);
    setSourceLanguage(entry.sourceLanguage);
    setTargetLanguage(entry.targetLanguage);
    setResult({
      translatedText: entry.translatedText,
      detectedLanguage: entry.detectedLanguage,
      sourceLanguage: entry.sourceLanguage,
      targetLanguage: entry.targetLanguage,
    });
    navigate('translate');
  };
  const clearHistory = () => {
    if (window.confirm('Clear all saved translations from this browser? This cannot be undone.')) setHistory([]);
  };

  return <div className="site-root">
    <Header view={view} onNavigate={navigate} theme={theme} onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} />
    <main id="main-content">
      {view === 'translate' && <>
        <div className="page-container home-hero">
          <div className="hero-topline"><div className="eyebrow"><span className="eyebrow-line"/> LANGUAGE, WITHOUT LIMITS <span className="eyebrow-suffix">/ LINGORA 01</span></div>
            <div className="hero-edition">A SPACE FOR BETTER CONVERSATIONS <ArrowUpRight size={14}/></div></div>
          <div className="hero-heading-row"><div><h1>Words travel.<br/><em>Meaning connects.</em></h1></div>
            <p>Translate your thoughts into another language, clearly and naturally. Good conversations have no borders.</p></div>
          <div className="hero-decorative-line" aria-hidden="true"><span>✳</span><span>EST. FOR EVERYWHERE</span></div>
        </div>
        <div className="page-container"><TranslationWorkspace
          sourceText={sourceText} setSourceText={setSourceText}
          sourceLanguage={sourceLanguage} setSourceLanguage={setSourceLanguage}
          targetLanguage={targetLanguage} setTargetLanguage={setTargetLanguage}
          result={result} setResult={setResult} onSuccess={handleSuccess}
          apiConfigured={apiConfigured} onVisitHistory={() => navigate('history')} /></div>
        <section className="page-container features-section" aria-label="Lingora features">
          <div className="features-intro"><span>THOUGHTFULLY DESIGNED</span><h2>Less friction.<br/><em>More connection.</em></h2></div>
          <div className="features-grid">
            <div className="feature-item"><div className="feature-icon"><Globe2 size={20}/></div><span>01 — GLOBAL</span><h3>{LANGUAGES.length} languages. One place.</h3><p>Find the right words for conversations near and far.</p></div>
            <div className="feature-item"><div className="feature-icon"><WandSparkles size={20}/></div><span>02 — EFFORTLESS</span><h3>Good words, good flow.</h3><p>Detect, translate, listen and copy with a simple click.</p></div>
            <div className="feature-item"><div className="feature-icon"><Lock size={20}/></div><span>03 — PERSONAL</span><h3>Your words, your space.</h3><p>Keep your recent translations locally for another day.</p></div>
          </div>
        </section>
        <div className="page-container closing-band"><div><CircleCheck size={16}/><span>Made for moments when words matter.</span></div><span>LINGORA / THINK BEYOND LANGUAGE</span></div>
      </>}
      {view === 'history' && <HistoryView history={history} onReuse={reuseTranslation} onClear={clearHistory}
        onRemove={id => setHistory(prev => prev.filter(entry => entry.id !== id))} onNavigate={() => navigate('translate')}/>} 
      {view === 'about' && <AboutView onNavigate={() => navigate('translate')}/>}
    </main>
    <Footer onNavigate={navigate} />
  </div>;
}
export default App;
