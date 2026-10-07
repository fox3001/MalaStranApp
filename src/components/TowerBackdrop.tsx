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

