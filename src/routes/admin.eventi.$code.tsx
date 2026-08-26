import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck, UserRound, CheckCircle2, Circle, Star, MapPin, Calendar, Clock, Phone, FileText, Search, X } from "lucide-react";
import { getEventByCode, getAvailabilityForEvent, confirmAnimator, unconfirmAnimator } from "../data/demo";
import { useDemo } from "@/lib/store";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/eventi/$code")({
  component: AdminEventDetail,
});

function AdminEventDetail() {
  const { code } = Route.useParams();
  const event = getEventByCode(code);
  const availability = getAvailabilityForEvent(code);
  const { collaborators } = useDemo();
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return collaborators.filter((c) => {
      const haystack = [
        c.name,
        c.role,
        c.bio,
        ...c.skills,
        ...c.skillsDetail.map((s) => s.name),
        ...c.proposedSkills,
        ...c.personalCostumes.flatMap((pc) => [pc.name, pc.category, ...pc.tags]),
        ...c.personalPhotos.flatMap((ph) => [ph.caption || "", ...ph.tags]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [collaborators, searchQuery]);

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">Evento non trovato.</p>
        <Link to="/admin/eventi" className="mt-4 text-sm text-primary hover:underline">
          Torna agli eventi
        </Link>
      </div>
    );
  }

  const proposed = availability.filter((a) => a.proposed);
  const confirmed = proposed.filter((a) => a.confirmed);

  function toggleConfirmed(userId: string, currentlyConfirmed: boolean) {
    if (currentlyConfirmed) {
      unconfirmAnimator(code, userId);
    } else {
      const entry = availability.find((a) => a.userId === userId);
      confirmAnimator(code, userId, entry?.isTL ?? false);
    }
  }

  function toggleTL(userId: string, currentlyTL: boolean) {
    const entry = availability.find((a) => a.userId === userId);
    if (!entry) return;
    entry.isTL = !currentlyTL;
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <Link to="/admin/eventi" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
        Torna agli eventi
      </Link>

      <header className="mb-8">
        <h1 className="font-serif text-3xl text-primary">{event.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Modifica solo da admin</p>
      </header>

      <section className="mb-10 rounded-lg border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold uppercase tracking-[0.08em]">Dettagli Evento</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Luogo:</span>
            <input type="text" defaultValue={event.place} className="flex-1 rounded-md border bg-background px-2 py-1 text-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Data:</span>
            <input type="date" defaultValue={event.date} className="flex-1 rounded-md border bg-background px-2 py-1 text-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Ritrovo:</span>
            <input type="time" defaultValue={event.meetTime} className="flex-1 rounded-md border bg-background px-2 py-1 text-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Inizio:</span>
            <input type="time" defaultValue={event.timeStart} className="flex-1 rounded-md border bg-background px-2 py-1 text-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Fine:</span>
            <input type="time" defaultValue={event.timeEnd} className="flex-1 rounded-md border bg-background px-2 py-1 text-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Contatto:</span>
            <input type="text" defaultValue={event.contactName} placeholder="Nome" className="w-1/3 rounded-md border bg-background px-2 py-1 text-foreground" />
            <a href={`tel:${event.contactPhone}`} className="flex-1 rounded-md border bg-background px-2 py-1 text-primary hover:underline">
              {event.contactPhone}
            </a>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Note:</span>
            <textarea defaultValue={event.notes} rows={3} className="flex-1 rounded-md border bg-background px-2 py-1 text-foreground" />
          </div>
        </div>
      </section>

      {/* Collaborator search */}
      <section className="mb-10 rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-accent" strokeWidth={1.5} />
          <h2 className="text-base font-semibold uppercase tracking-[0.08em]">Cerca collaboratori</h2>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Cerca tra tutti i collaboratori per nome, competenze, costumi, tag o foto. Clicca su un risultato per aggiungerlo agli animatori proposti.
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Es. #pirata, combattimento, Elena, medievale..."
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Cancella ricerca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {searchQuery.trim() && (
          <div className="mt-4">
            {searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun collaboratore trovato.</p>
            ) : (
              <ul className="space-y-2">
                {searchResults.map((c) => {
                  const alreadyProposed = availability.some((a) => a.userId === c.id);
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => {
                          if (!alreadyProposed) {
                            confirmAnimator(code, c.id, false);
                            setSearchQuery("");
                          }
                        }}
                        disabled={alreadyProposed}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                          alreadyProposed
                            ? "border-border bg-muted/50 opacity-60"
                            : "border-border bg-background hover:border-accent hover:bg-accent/5 active:scale-[0.99]",
                        )}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                          <UserRound className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{c.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{c.role}</p>
                          {c.skillsDetail.length > 0 && (
                            <p className="mt-0.5 truncate text-[11px] text-accent">
                              {c.skillsDetail.map((s) => s.name).join(" · ")}
                            </p>
                          )}
                          {c.personalCostumes.length > 0 && (
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              Costumi: {c.personalCostumes.map((pc) => pc.name).join(", ")}
                            </p>
                          )}
                        </div>
                        {alreadyProposed ? (
                          <span className="shrink-0 text-xs font-medium text-muted-foreground">Già proposto</span>
                        ) : (
                          <span className="shrink-0 text-xs font-medium text-accent">+ Aggiungi</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </section>

      <section className="mb-10 rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <UserRound className="h-5 w-5 text-accent" strokeWidth={1.5} />
          <h2 className="text-base font-semibold uppercase tracking-[0.08em]">Animatori proposti</h2>
        </div>
        {proposed.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessun animatore proposto per questo evento. Usa la ricerca sopra per aggiungerne.</p>
        ) : (
          <ul className="space-y-3">
            {proposed.map((a) => {
              const isConfirmed = !!a.confirmed;
              const isTL = !!a.isTL;
              return (
                <li key={a.userId} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <UserRound className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{a.name}</p>
                      <p className="text-xs text-muted-foreground">Disponibile per questo evento</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleConfirmed(a.userId, isConfirmed)} className="flex items-center gap-1.5 text-xs font-medium hover:underline" title={isConfirmed ? "Rimuovi conferma" : "Conferma animatore"}>
                      {isConfirmed ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span className="text-primary">Confermato</span>
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Da confermare</span>
                        </>
                      )}
                    </button>
                    <button onClick={() => toggleTL(a.userId, isTL)} className="flex items-center gap-1.5 text-xs font-medium hover:underline" title={isTL ? "Rimuovi Team Leader" : "Segna come Team Leader"}>
                      <Star className={`h-4 w-4 ${isTL ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                      <span className={isTL ? "text-yellow-400" : "text-muted-foreground"}>TL</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mb-10 rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={1.5} />
          <h2 className="text-base font-semibold uppercase tracking-[0.08em]">Animatori confermati</h2>
        </div>
        {confirmed.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessun animatore confermato per questo evento.</p>
        ) : (
          <ul className="space-y-3">
            {confirmed.map((a) => (
              <li key={a.userId} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">Confermato per questo evento</p>
                  </div>
                </div>
                {a.isTL && (
                  <div className="flex items-center gap-1.5 rounded-full bg-yellow-400/15 px-2.5 py-1 text-xs font-medium text-yellow-500">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    Team Leader
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
