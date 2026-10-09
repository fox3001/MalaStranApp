import { Flock } from "@/components/Flock";

/** La torre disegnata a china: sta dietro a tutta la pagina, la punta resta in vista in alto. */
export function TowerBackdrop({ birds = 20 }: { birds?: number }) {
  return (
    <>
      <img
        src="/sfondi/torre-regia.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[80px] h-[700px] w-[620px] max-w-none -translate-x-1/2 select-none"
      />
      {/* lo stormo vola sopra il disegno ma dietro a tutti i riquadri */}
      <Flock count={birds} className="absolute inset-x-0 top-[80px] h-[560px]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[320px] h-[700px]"
        style={{ background: "linear-gradient(to bottom, rgba(243,236,221,0) 0%, rgba(243,236,221,.6) 25%, rgba(243,236,221,.78) 100%)" }}
      />
    </>
  );
}


/** Tasto dello stormo: una sagoma di user con tre uccellini attorno. Acceso (normale) = un condor per ogni user registrato; spento = 20 condor. */
export function FlockButton({ on, count, onToggle, light = true, label }: { on: boolean; count: number; onToggle: () => void; light?: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={label ?? (on ? `Stormo: ${count} condor. Tocca per vederne 20` : "Mostra un condor per ogni user")}
      className={
        "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border " +
        (light ? (on ? "border-gold-light bg-white text-accent" : "border-gold-light text-white") : on ? "border-primary bg-primary text-white" : "border-gold bg-card text-primary")
      }
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        {/* user: testa e corpo */}
        <circle cx="12" cy="12.2" r="3" fill="currentColor" />
        <path d="M6.6 22c.6-3.8 2.7-5.6 5.4-5.6s4.8 1.8 5.4 5.6z" fill="currentColor" />
        {/* tre uccellini fermi attorno */}
        <path d="M1.2 7.4 q1.7-1.6 3.4 0 q1.7-1.6 3.4 0 q-1.7-.5-3.4 1.3 q-1.7-1.8-3.4-1.3z" fill="currentColor" />
        <path d="M14.8 3.6 q1.7-1.6 3.4 0 q1.7-1.6 3.4 0 q-1.7-.5-3.4 1.3 q-1.7-1.8-3.4-1.3z" fill="currentColor" />
        <path d="M16.6 11 q1.4-1.3 2.8 0 q1.4-1.3 2.8 0 q-1.4-.4-2.8 1.1 q-1.4-1.5-2.8-1.1z" fill="currentColor" />
      </svg>
      {on && (
        <span className={
            "absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border px-1 font-sans text-[10px] font-bold " +
            (light ? "border-accent bg-white text-accent" : "border-primary bg-white text-primary")
          }>
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

