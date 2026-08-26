import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionTitle } from "@/components/ui-kit";
import { useDemo } from "@/lib/store";
import { CheckCircle2, CircleAlert, Mail, Phone, UserRound } from "lucide-react";

export const Route = createFileRoute("/admin/collaboratori/$id")({
  component: CollaboratoreDettaglio,
});

function CollaboratoreDettaglio() {
  const { id } = Route.useParams();
  const { collaborators, verifyCollaboratorSkill } = useDemo();
  const collaborator = collaborators.find((c) => c.id === id);

  if (!collaborator) {
    return (
      <AppShell area="admin" title="Collaboratore" back="/admin/collaboratori">
        <section className="px-3 pt-6"><p className="text-sm text-muted-foreground">Collaboratore non trovato.</p></section>
      </AppShell>
    );
  }

  return (
    <AppShell area="admin" title="Collaboratore" back="/admin/collaboratori">
      <section className="px-3 pt-6">
        <p className="eyebrow text-accent">Scheda collaboratore</p>
        <h2 className="mt-1 font-serif text-3xl text-primary">{collaborator.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{collaborator.role}</p>
      </section>

      <section className="mt-6 px-3">
        <SectionTitle>Contatti</SectionTitle>
        <div className="grid gap-2 border-t border-border py-3 text-sm">
          <p className="flex items-center gap-2 text-foreground"><Phone className="h-4 w-4 text-accent" /> {collaborator.phone || "Telefono non inserito"}</p>
          <p className="flex items-center gap-2 text-foreground"><Mail className="h-4 w-4 text-accent" /> {collaborator.email || "Email non inserita"}</p>
        </div>
      </section>

      <section className="mt-6 px-3">
        <SectionTitle>Competenze</SectionTitle>
        <ul className="border-t border-border">
          {collaborator.skillsDetail.map((skill) => (
            <li key={skill.name} className="flex items-center justify-between gap-3 border-b border-border py-3">
              <span className="text-sm text-foreground">{skill.name}</span>
              {skill.status === "verificata" ? (
                <span className="flex items-center gap-1 text-xs font-medium text-accent"><CheckCircle2 className="h-4 w-4" /> Verificata</span>
              ) : (
                <button
                  onClick={() => verifyCollaboratorSkill(collaborator.id, skill.name)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-1 text-xs text-foreground"
                >
                  <CircleAlert className="h-3.5 w-3.5" /> Verifica
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {collaborator.proposedSkills.length > 0 && (
        <section className="mt-6 px-3">
          <SectionTitle>Competenze proposte</SectionTitle>
          <ul className="border-t border-border">
            {collaborator.proposedSkills.map((skill) => (
              <li key={skill} className="flex items-center justify-between gap-3 border-b border-border py-3">
                <span className="text-sm text-foreground">{skill}</span>
                <button onClick={() => verifyCollaboratorSkill(collaborator.id, skill)} className="rounded-full border border-primary bg-primary px-3 py-1 text-xs font-semibold text-white">
                  Approva
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 px-3">
        <SectionTitle
          action={<Link to="/admin/collaboratori/$id/disponibilita" params={{ id }} className="eyebrow text-accent">Apri</Link>}
        >
          Disponibilità
        </SectionTitle>
        <div className="border border-border bg-surface p-4">
          <p className="text-sm text-foreground">Consulta e gestisci le disponibilità di {collaborator.name} per gli eventi.</p>
        </div>
      </section>
    </AppShell>
  );
}
