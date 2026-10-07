import { useEffect, useMemo, useRef } from "react";

/*
 * Stormo di "condor" che gira attorno alla torre.
 * Ogni uccello ha un suo giro (più stretto o più largo, più in alto o più in basso),
 * una sua velocità e un suo battito d'ali; ogni tanto qualcuno si allarga molto e poi rientra.
 * Quando passa "dietro" la torre diventa un po' più piccolo e più chiaro, per dare profondità.
 */

const rand = (a: number, b: number) => a + Math.random() * (b - a);

// tre pose dell'ala (su, a metà, giù): si alternano senza mai diventare una linea sottile
const POSE_UP = "M0,2 Q5,-1 10,6 Q15,-1 20,2 Q15,3 10,9 Q5,3 0,2Z";
const POSE_MID = "M0,5.5 Q5,3.5 10,6.5 Q15,3.5 20,5.5 Q15,6.5 10,9 Q5,6.5 0,5.5Z";
const POSE_DOWN = "M0,10 Q5,5.5 10,6 Q15,5.5 20,10 Q15,7.5 10,9 Q5,7.5 0,10Z";

interface Condor {
  size: number;
  flap: number;
  delay: number;
  angle: number; // dove si trova sul giro
  speed: number; // radianti al secondo
  cy: number; // altezza del giro (0..1 della zona)
  rx: number; // larghezza del giro in px
  wobble: number; // fase dell'avvicinarsi/allontanarsi
  wobbleSpeed: number;
  bobPhase: number;
  wide: number; // allargamento temporaneo (0 = normale)
  wideTarget: number;
}

function makeCondor(): Condor {
  return {
    size: rand(11, 20),
    flap: rand(0.38, 0.8),
    delay: -rand(0, 0.8),
    angle: rand(0, Math.PI * 2),
    speed: rand(0.28, 0.6) * (Math.random() < 0.12 ? -1 : 1),
    cy: Math.random() < 0.85 ? rand(0.04, 0.4) : rand(0.4, 0.6), // quasi tutti nella parte alta, dove la torre si vede
    rx: rand(45, 150),
    wobble: rand(0, Math.PI * 2),
    wobbleSpeed: rand(0.08, 0.25),
    bobPhase: rand(0, Math.PI * 2),
    wide: 0,
    wideTarget: 0,
  };
}

export function Flock({ className, count = 20 }: { className?: string; count?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const birdRefs = useRef<(HTMLDivElement | null)[]>([]);
  const n = Math.max(0, Math.min(count, 80));
  const condors = useMemo(() => Array.from({ length: n }, makeCondor), [n]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const area = box.current;
      if (area) {
        const w = area.clientWidth;
        const h = area.clientHeight;
        const cx = w / 2;
        condors.forEach((c, i) => {
          const el = birdRefs.current[i];
          if (!el) return;
          c.angle += c.speed * dt;
          c.wobble += c.wobbleSpeed * dt;
          // ogni tanto un uccello allarga molto il giro, poi rientra
          if (c.wideTarget === 0 && Math.random() < dt * 0.025) c.wideTarget = rand(90, 190);
          else if (c.wideTarget > 0 && Math.random() < dt * 0.12) c.wideTarget = 0;
          c.wide += (c.wideTarget - c.wide) * Math.min(1, dt * 0.6);
          const rx = c.rx * (0.75 + 0.35 * Math.sin(c.wobble)) + c.wide;
          const ry = rx * 0.22;
          const depth = Math.sin(c.angle); // >0 davanti alla torre, <0 dietro
          const x = cx + Math.cos(c.angle) * rx - c.size / 2;
          const y = c.cy * h + depth * ry + Math.sin(now / 1000 + c.bobPhase) * 6;
          const s = 0.8 + 0.25 * (depth + 1) / 2;
          el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(3)})`;
          el.style.opacity = (0.55 + 0.4 * (depth + 1) / 2).toFixed(2);
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [condors]);

  return (
    <div ref={box} aria-hidden="true" className={className} style={{ pointerEvents: "none", overflow: "hidden" }}>
      {condors.map((c, i) => {
        const st = { animationDuration: `${c.flap}s`, animationDelay: `${c.delay}s` };
        return (
          <div
            key={i}
            ref={(el) => {
              birdRefs.current[i] = el;
            }}
            style={{ position: "absolute", left: 0, top: 0, willChange: "transform", transform: "translate(-100px,-100px)" }}
          >
            <svg width={c.size} height={c.size * 0.6} viewBox="0 0 20 12" style={{ display: "block", overflow: "visible" }}>
              <path className="flock-up" style={st} d={POSE_UP} fill="#1A1311" />
              <path className="flock-mid" style={st} d={POSE_MID} fill="#1A1311" />
              <path className="flock-down" style={st} d={POSE_DOWN} fill="#1A1311" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
