import { useEffect, useRef, useState } from "react";

/*
 * Stormo di uccelli dietro a tutto: ogni tanto parte un gruppo (numero casuale),
 * sbatte le ali e attraversa lo sfondo seguendo una delle rotte predefinite, scelta a caso.
 */

type Pt = [number, number]; // posizione in % della zona (x, y)
const ROUTES: Pt[][] = [
  [[108, 22], [70, 12], [35, 20], [-12, 8]],
  [[-10, 30], [30, 18], [65, 26], [110, 14]],
  [[105, 48], [75, 36], [45, 30], [20, 14], [-10, 4]],
  [[-12, 12], [25, 6], [55, 18], [80, 40], [112, 52]],
];

const rand = (a: number, b: number) => a + Math.random() * (b - a);

interface Flight {
  id: number;
  route: Pt[];
  birds: { dx: number; dy: number; size: number; flap: number; delay: number }[];
  duration: number;
}

function Bird({ size, flap, delay }: { size: number; flap: number; delay: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 20 12" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      <g className="flock-wing" style={{ animationDuration: `${flap}s`, animationDelay: `${delay}s` }}>
        <path d="M0,4 Q5,0 10,6 Q15,0 20,4 Q15,3 10,9 Q5,3 0,4Z" fill="#1A1311" />
      </g>
    </svg>
  );
}

export function Flock({ className }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  // sceglie a caso quando partire, quanti uccelli e quale rotta
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let t: ReturnType<typeof setTimeout>;
    let n = 0;
    const launch = () => {
      const count = Math.round(rand(4, 9));
      const route = ROUTES[Math.floor(Math.random() * ROUTES.length)]!;
      const duration = rand(13, 22);
      setFlight({
        id: ++n,
        route,
        duration,
        birds: Array.from({ length: count }, (_, i) => ({
          dx: (i === 0 ? 0 : rand(-46, 46)) + (i % 2 ? 8 : -8) * Math.ceil(i / 2),
          dy: i === 0 ? 0 : rand(-26, 26),
          size: rand(12, 20),
          flap: rand(0.32, 0.55),
          delay: -rand(0, 0.6),
        })),
      });
      t = setTimeout(launch, (duration + rand(3, 10)) * 1000);
    };
    t = setTimeout(launch, rand(800, 3000));
    return () => clearTimeout(t);
  }, []);

  // fa volare il gruppo lungo la rotta, con un leggero ondeggiare
  useEffect(() => {
    const el = groupRef.current;
    const area = box.current;
    if (!flight || !el || !area) return;
    const w = area.clientWidth;
    const h = area.clientHeight;
    const frames = flight.route.map(([x, y], i) => ({
      transform: `translate(${(x / 100) * w}px, ${(y / 100) * h + (i % 2 ? 10 : -6)}px)`,
    }));
    const anim = el.animate(frames, { duration: flight.duration * 1000, easing: "ease-in-out", fill: "forwards" });
    return () => anim.cancel();
  }, [flight]);

  return (
    <div ref={box} aria-hidden="true" className={className} style={{ pointerEvents: "none", overflow: "hidden" }}>
      {flight && (
        <div key={flight.id} ref={groupRef} style={{ position: "absolute", left: 0, top: 0, willChange: "transform", transform: "translate(-200px,-200px)" }}>
          {flight.birds.map((b, i) => (
            <div key={i} className="flock-bob" style={{ position: "absolute", left: b.dx, top: b.dy, animationDuration: `${rand(1.6, 2.6)}s` }}>
              <Bird size={b.size} flap={b.flap} delay={b.delay} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
