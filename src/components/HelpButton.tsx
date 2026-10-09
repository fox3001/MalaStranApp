import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { guidaPer, sezionePer, type GuidaSezione } from "@/lib/guida";
import { cn } from "@/lib/utils";

/** Il "?" in alto, accanto alla campanella: apre una finestrella con la spiegazione della pagina. */
export function HelpButton({ area, light }: { area: "admin" | "user"; light?: boolean }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const sez = sezionePer(area, pathname);
  const guida = area === "admin" ? "/admin/guida" : "/u/guida";

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Aiuto: come funziona questa pagina"
        className={cn(
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border font-display text-[19px] font-bold",
          light ? "border-gold-light text-white" : "border-gold bg-card text-primary",
        )}
      >
        ?
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/45 px-4 pt-[max(70px,env(safe-area-inset-top))]" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Aiuto" className="max-h-[75vh] w-full max-w-md overflow-y-auto border border-gold bg-background p-4 text-left text-foreground shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-display text-[10px] uppercase tracking-[0.24em] text-accent">Come funziona</p>
                <h2 className="font-display text-lg font-bold text-primary">{sez?.titolo ?? "Questa pagina"}</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Chiudi" className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-gold text-primary">
                ✕
              </button>
            </div>
            {sez ? <Punti s={sez} /> : <p className="font-serif text-[15px]">Per questa pagina non c'è una spiegazione: guarda la guida completa.</p>}
            <Link to={guida} onClick={() => setOpen(false)} className="mt-4 block border-t border-gold pt-3 text-center font-display text-[11px] uppercase tracking-[0.16em] text-accent underline underline-offset-4">
              Leggi la guida completa
            </Link>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

export function Punti({ s }: { s: GuidaSezione }) {
  return (
    <ul className="grid gap-2 font-serif text-[15px] leading-snug">
      {s.punti.map((p, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" aria-hidden="true" />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

/** Pagina "Come funziona": tutta la guida, con il tasto per scaricarla in Word. */
export function GuidaPage({ area }: { area: "admin" | "user" }) {
  const sezioni = guidaPer(area);
  const [busy, setBusy] = useState(false);
  const scarica = async () => {
    setBusy(true);
    try {
      const { guidaDocx } = await import("@/lib/guidaDocx");
      await guidaDocx(area, sezioni);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="pt-4">
      <button type="button" onClick={() => void scarica()} disabled={busy} className="mb-4 min-h-11 w-full bg-accent px-3 font-display text-[11px] uppercase tracking-[0.16em] text-white disabled:opacity-50">
        {busy ? "Preparo il file…" : "Scarica la guida (Word)"}
      </button>
      <nav className="mb-4 flex flex-wrap gap-1.5">
        {sezioni.map((s) => (
          <a key={s.id} href={`#g-${s.id}`} className="border border-gold px-2 py-1 font-display text-[10px] uppercase tracking-[0.12em] text-primary">
            {s.titolo}
          </a>
        ))}
      </nav>
      <div className="grid gap-3">
        {sezioni.map((s) => (
          <section key={s.id} id={`g-${s.id}`} className="scroll-mt-24 border border-gold bg-card p-3.5">
            <h2 className="mb-2 font-display text-[15px] font-bold uppercase tracking-[0.08em] text-primary">{s.titolo}</h2>
            <Punti s={s} />
          </section>
        ))}
      </div>
    </div>
  );
}
