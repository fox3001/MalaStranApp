/** Megafono per gli Shout */
export function ShoutIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 10v4h3l9 5V5L6 10z" />
      <path d="M6 14l1.5 5h2.5l-1.3-4.3" />
      <path d="M18 9.5a3.5 3.5 0 0 1 0 5M20.5 7a7 7 0 0 1 0 10" />
    </svg>
  );
}
