import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusTag } from "@/components/ui-kit";
import { useDemo } from "@/lib/store";
import { CalendarDays, CheckCircle2, ShieldCheck, UserRound } from "lucide-react";

export const Route = createFileRoute("/u/eventi/")({
  component: EventiUtente,
});

function EventiUtente() {
  const { events, collaborators, availability } = useDemo();
  const currentUser = collaborators.find((c) => c.id === "col-elena") || collaborators[0];
  if (!currentUser) return null;

  const personalEvents = [...events]
    .filter((event) => event.status !== "annullato")
    .filter((event) => {
      const assigned = event.team?.some((member) => member.collaboratorId === currentUser.id);
      return assigned || event.status === "richiesta" || event.status === "da_definire" || event.assignment;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <AppShell area="u" title="I miei eventi" back="/u">
      <section className="px-3 pt-6">
        <p className="eyebrow text-accent">Area personale</p>
        <h2 className="mt-1 font-serif text-3xl text-primary">I miei eventi</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Disponibilità, convocazioni e informazioni operative.
        </p>
      </section>

      <section className="mt-6 px-3">
        {personalEvents.length === 0 ? (
          <p className="border-y border-border py-3 text-sm text-muted-foreground">Nessun evento assegnato.</p>
        ) : (
          <ul className="border-t border-border">
            {personalEvents.map((event) => {
              const teamMember = event.team?.find((member) => member.collaboratorId === currentUser.id);
              const response = availability[event.id];
              return (
                <li key={event.id}>
                  <Link
                    to="/u/eventi/$code"
                    params={{ code: event.code }}
                    className="flex items-center justify-between gap-3 border-b border-border py-3 active:bg-muted"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 truncate text-sm text-foreground">
                        {event.name}
                        {teamMember?.isTeamLeader && <ShieldCheck className="h-4 w-4 shrink-0 text-accent" aria-label="Team Leader" />}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {event.date} · {event.place} · {event.timeStart}–{event.timeEnd}
                      </span>
                      {teamMember?.role && <span className="mt-1 block text-xs text-accent">{teamMember.role}</span>}
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <StatusTag status={event.status} />
                      {response === "disponibile" || response === "yes" ? (
                        <span className="flex items-center gap-1 text-xs text-accent"><CheckCircle2 className="h-3.5 w-3.5" /> Disponibile</span>
                      ) : response ? (
                        <span className="text-xs text-muted-foreground">{response.replace("_", " ")}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Rispondi</span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
