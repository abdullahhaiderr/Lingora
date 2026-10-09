import { ArrowRight, Globe2, HeartHandshake, LockKeyhole, Sparkles } from 'lucide-react';

export function AboutView({ onNavigate }: { onNavigate: () => void }) {
  return <section className="page-container inner-page about-page" aria-labelledby="about-heading">
    <div className="eyebrow"><span className="eyebrow-line" /> THE IDEA BEHIND LINGORA <span className="eyebrow-suffix">/ 02</span></div>
    <div className="about-headline"><h1 id="about-heading">Language opens doors. <em>We help you walk through.</em></h1>
      <p>Lingora is a calm, considered space for translation—built to make sharing ideas across languages feel effortless.</p></div>
    <div className="about-values">
      <article><div className="value-icon"><Globe2 size={23}/></div><span>01 / REACH</span><h2>Across borders</h2><p>Thoughtful access to dozens of languages, bringing distant conversations a little closer.</p></article>
      <article><div className="value-icon"><HeartHandshake size={23}/></div><span>02 / INTENTION</span><h2>Meaning first</h2><p>A distraction-free translation workflow that puts what you want to say at the center.</p></article>
      <article><div className="value-icon"><LockKeyhole size={23}/></div><span>03 / PRIVACY</span><h2>Yours to keep</h2><p>Translation history stays in your browser. Text you translate is sent to the configured service provider.</p></article>
    </div>
    <div className="about-cta"><Sparkles size={20}/><div><h2>Every conversation starts somewhere.</h2><p>Let yours travel a little further.</p></div>
      <button type="button" className="primary-button" onClick={onNavigate}>Start translating <ArrowRight size={17}/></button></div>
  </section>;
}
