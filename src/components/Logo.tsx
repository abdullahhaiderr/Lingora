import type { SVGProps } from 'react';

function Mark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true" {...props}>
      <rect x="1" y="1" width="42" height="42" rx="12" fill="currentColor" />
      <path d="M12.75 13.5V30H24" stroke="var(--logo-cutout)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 13.5H33M27 13.5V30" stroke="var(--logo-cutout)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="33" cy="29.5" r="2.7" fill="#DCE6C6" />
    </svg>
  );
}
export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="logo-button group" aria-label="Lingora — go to Translate">
      <Mark className="logo-mark" />
      <span className="logo-type">lingora<span className="logo-point">.</span></span>
    </button>
  );
}
