import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle } from "@/components/ui-kit";
import { useDemo } from "@/lib/store";
import { CheckCircle2, CircleAlert, Flag, Mail, Phone, Plus, Shirt, Camera, UserRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/u/profilo")({
  component: ProfiloUtente,
});

function ProfiloUtente() {
  const {
    collaborators,
    updateCollaborator,
    addSkillToCollaborator,
    proposeSkill,
    flagSkill,
    addPersonalCostume,
    addPersonalPhoto,
  } = useDemo();
  const currentUser = collaborators.find((c) => c.id === "col-elena") || collaborators[0];
  const [newSkill, setNewSkill] = useState("");
  const [proposedSkill, setProposedSkill] = useState("");
  const [newCostumeName, setNewCostumeName] = useState("");
  const [newCostumeCategory, setNewCostumeCategory] = useState("");
  const [newCostumeTags, setNewCostumeTags] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoTags, setPhotoTags] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");

  const availableSkills = useMemo(() => {
    const skills = new Set<string>();
    collaborators.forEach((collaborator) => collaborator.skillsDetail.forEach((skill) => skills.add(skill.name)));
    return [...skills].sort();
  }, [collaborators]);

  if (!currentUser) return null;

  const addExistingSkill = () => {
    if (!newSkill) return;
    addSkillToCollaborator(currentUser.id, newSkill);
    setNewSkill("");
  };

  const addProposedSkill = () => {
    if (!proposedSkill.trim()) return;
    proposeSkill(currentUser.id, proposedSkill);
    setProposedSkill("");
  };

  const handleAddCostume = () => {
    if (!newCostumeName.trim()) return;
    const tags = newCostumeTags
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));
    addPersonalCostume(currentUser.id, {
      name: newCostumeName.trim(),
      category: newCostumeCategory.trim() || "Personale",
      tags,
    });
    setNewCostumeName("");
    setNewCostumeCategory("");
    setNewCostumeTags("");
  };

  const handleAddPhoto = () => {
    if (!photoUrl.trim()) return;
    const tags = photoTags
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));
    addPersonalPhoto(currentUser.id, {
      url: photoUrl.trim(),
      tags,
      caption: photoCaption.trim() || undefined,
    });
    setPhotoUrl("");
    setPhotoTags("");
    setPhotoCaption("");
  };

  return (
    <AppShell area="u" title="" back="/u">
      <section className="pt-6">
        <p className="eyebrow text-accent">Scheda personale</p>
        <h2 className="mt-1 font-serif text-2xl text-primary">Il mio profilo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          I tuoi dati, competenze, costumi e foto. L'ufficio usa queste informazioni per selezionarti per gli eventi.
        </p>
      </section>

      <section className="mt-6">
        <SectionTitle>Dati personali</SectionTitle>
        <Card>
          <div className="grid gap-4">
            <ProfileField icon={UserRound} label="Nome e cognome">
              <input
                value={currentUser.name}
                disabled
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
              />
            </ProfileField>
            <ProfileField icon={UserRound} label="Ruolo">
              <input
                value={currentUser.role}
                onChange={(e) => updateCollaborator(currentUser.id, { role: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </ProfileField>
            <ProfileField icon={Phone} label="Telefono">
              <input
                value={currentUser.phone || ""}
                onChange={(e) => updateCollaborator(currentUser.id, { phone: e.target.value })}
                placeholder="Inserisci il numero di telefono"
                inputMode="tel"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </ProfileField>
            <ProfileField icon={Mail} label="Email">
              <input
                value={currentUser.email || ""}
                onChange={(e) => updateCollaborator(currentUser.id, { email: e.target.value })}
                placeholder="Inserisci l'email"
                inputMode="email"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </ProfileField>
            <ProfileField icon={UserRound} label="Presentazione">
              <textarea
                value={currentUser.bio}
                onChange={(e) => updateCollaborator(currentUser.id, { bio: e.target.value })}
                className="min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </ProfileField>
          </div>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle>Le mie competenze</SectionTitle>
        <Card>
          <p className="mb-3 text-sm text-muted-foreground">
            Le competenze diventano utilizzabili per le assegnazioni dopo la verifica dell'ufficio. Tocca una competenza per segnalarla come prioritaria.
          </p>
          <div className="flex flex-wrap gap-2">
            {currentUser.skillsDetail.map((skill) => {
              const isFlagged = currentUser.flaggedSkills.includes(skill.name);
              return (
                <button
                  key={skill.name}
                  onClick={() => flagSkill(currentUser.id, skill.name)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all active:scale-[0.97]",
                    skill.status === "verificata"
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-border-strong bg-muted text-muted-foreground",
                    isFlagged && "ring-2 ring-accent ring-offset-1",
                  )}
                >
                  {skill.status === "verificata" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <CircleAlert className="h-4 w-4" />
                  )}
                  {skill.name}
                  <Flag
                    className={cn("h-3.5 w-3.5", isFlagged ? "text-accent fill-accent/30" : "text-muted-foreground/50")}
                  />
                </button>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle>Aggiungi una competenza</SectionTitle>
        <Card>
          <div className="flex gap-2">
            <select
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Scegli dall'elenco...</option>
              {availableSkills
                .filter((skill) => !currentUser.skillsDetail.some((item) => item.name === skill))
                .map((skill) => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
            </select>
            <button
              onClick={addExistingSkill}
              className="inline-flex items-center gap-1 rounded-lg border border-accent bg-accent px-4 text-sm font-semibold text-accent-foreground active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" /> Aggiungi
            </button>
          </div>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle>Proponi una nuova competenza</SectionTitle>
        <Card>
          <p className="mb-3 text-sm text-muted-foreground">
            L'ufficio la valutera prima di aggiungerla al tuo profilo.
          </p>
          <div className="flex gap-2">
            <input
              value={proposedSkill}
              onChange={(e) => setProposedSkill(e.target.value)}
              placeholder="Es. #danzaStorica"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={addProposedSkill}
              className="rounded-lg border border-border-strong bg-surface px-4 text-sm font-semibold text-foreground active:scale-[0.98]"
            >
              Proponi
            </button>
          </div>
          {currentUser.proposedSkills.length > 0 && (
            <div className="mt-3 rounded-lg border border-border bg-muted p-3">
              <p className="eyebrow text-muted-foreground">In attesa di valutazione</p>
              <p className="mt-2 text-sm text-foreground">{currentUser.proposedSkills.join(" · ")}</p>
            </div>
          )}
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle>I miei costumi</SectionTitle>
        <Card>
          <p className="mb-3 text-sm text-muted-foreground">
            Segna i costumi che possiedi. Gli admin possono cercare collaboratori in base ai costumi e alle competenze.
          </p>
          {currentUser.personalCostumes.length > 0 && (
            <div className="mb-4 space-y-2">
              {currentUser.personalCostumes.map((c) => (
                <div key={c.id} className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <Shirt className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.5} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="eyebrow text-xs text-muted-foreground">{c.category}</p>
                    {c.tags.length > 0 && (
                      <p className="mt-1 text-xs text-accent">{c.tags.join(" ")}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <input
              value={newCostumeName}
              onChange={(e) => setNewCostumeName(e.target.value)}
              placeholder="Nome costume (es. Abito rinascimentale)"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              value={newCostumeCategory}
              onChange={(e) => setNewCostumeCategory(e.target.value)}
              placeholder="Categoria (es. Storico, Fantasy...)"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              value={newCostumeTags}
              onChange={(e) => setNewCostumeTags(e.target.value)}
              placeholder="Tag separati da spazio (es. #medievale #nobilta)"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={handleAddCostume}
              className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-accent bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" /> Aggiungi costume
            </button>
          </div>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle>Le mie foto</SectionTitle>
        <Card>
          <p className="mb-3 text-sm text-muted-foreground">
            Carica foto dei tuoi costumi o performance con degli hashtag. Gli admin possono cercarti in base ai tag.
          </p>
          {currentUser.personalPhotos.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {currentUser.personalPhotos.map((p) => (
                <div key={p.id} className="overflow-hidden rounded-lg border border-border">
                  <img src={p.url} alt={p.caption || "Foto"} className="h-32 w-full object-cover" />
                  <div className="p-2">
                    {p.caption && <p className="truncate text-xs text-foreground">{p.caption}</p>}
                    {p.tags.length > 0 && (
                      <p className="mt-0.5 truncate text-[10px] text-accent">{p.tags.join(" ")}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="URL della foto"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
              placeholder="Didascalia (opzionale)"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              value={photoTags}
              onChange={(e) => setPhotoTags(e.target.value)}
              placeholder="Tag separati da spazio (es. #pirata #combattimento)"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={handleAddPhoto}
              className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-accent bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground active:scale-[0.98]"
            >
              <Camera className="h-4 w-4" /> Carica foto
            </button>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}

function ProfileField({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof UserRound;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
        <p className="eyebrow text-xs text-muted-foreground">{label}</p>
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
