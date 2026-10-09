import { ArrowUpRight } from 'lucide-react';
import type { View } from '../types';
export function Footer({ onNavigate }: { onNavigate: (view: View) => void }) {
  return <footer className="site-footer"><div className="page-container footer-inner">
    <div className="footer-left"><span className="footer-logo">lingora<span>.</span></span><span className="footer-copyright">© {new Date().getFullYear()} Lingora. Words, without borders.</span></div>
    <div className="footer-right"><span>Built for curious minds.</span><button type="button" onClick={() => onNavigate('about')}>About the project <ArrowUpRight size={15}/></button></div>
  </div></footer>;
}
