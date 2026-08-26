import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck, Star, MapPin, Calendar, Clock, Phone, FileText } from "lucide-react";
import { Card, StatusTag } from "@/components/ui-kit";
import { getEventByCode, getAvailabilityForEvent } from "../data/demo";

export const Route = createFileRoute("/u/eventi/$code")({
  component: UserEventDetail,
});

function UserEventDetail() {
  const { code } = Route.useParams();
  const event = getEventByCode(code);
  const availability = getAvailabilityForEvent(code);

  const currentUserId = "c1";
  const myEntry = availability.find((a) => a.userId === currentUserId);

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">Evento non trovato.</p>
        <Link to="/u/eventi" className="mt-4 text-sm text-primary hover:underline">
          Torna agli eventi
        </Link>
      </div>
    );
  }

  const isConfirmed = !!myEntry?.confirmed;
  const isTL = !!myEntry?.isTL;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6">
      <Link
        to="/u/eventi"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Torna agli eventi
      </Link>

      <header className="mb-6">
        <h1 className="font-serif text-2xl text-primary sm:text-3xl">{event.name}</h1>
        <div className="mt-2 flex items-center gap-3">
          <StatusTag status={event.status} />
          <p className="text-xs text-muted-foreground">Visualizza solo (modificabile solo da admin)</p>
        </div>
      </header>

      {/* Detail grid */}
      <section className="mb-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <InfoCard icon={MapPin} label="Luogo" value={event.place} />
          <InfoCard icon={Calendar} label="Data" value={event.date} />
          <InfoCard icon={Clock} label="Ritrovo" value={event.meetTime || "—"} />
          <InfoCard icon={Clock} label="Inizio" value={event.timeStart} />
          <InfoCard icon={Clock} label="Fine" value={event.timeEnd} />
          <InfoCard icon={Phone} label="Contatto" value={`${event.contactName || "—"} ${event.contactPhone || ""}`} />
        </div>
      </section>

      {event.notes && (
        <Card className="mb-6">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <p className="eyebrow mb-1 text-muted-foreground">Note</p>
              <p className="whitespace-pre-wrap text-sm text-foreground">{event.notes}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Status */}
      <Card className={isConfirmed ? "border-success/30" : "border-border"}>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              isConfirmed ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
            }`}
          >
            <ShieldCheck className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {isConfirmed ? "Sei confermato come animatore" : "Non sei ancora confermato"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isConfirmed
                ? "L'ufficio ti ha inserito tra gli animatori per questo evento."
                : "Hai segnalato disponibilita, ma l'ufficio non ti ha ancora confermato."}
            </p>
          </div>
          {isTL && (
            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-foreground">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              Team Leader
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <p className="eyebrow text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
