import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Button,
  DemoNote,
  SectionTitle,
  Tags,
  Thumb,
  VerificationTag,
} from "@/components/ui-kit";
import { useDemo } from "@/lib/store";

export const Route = createFileRoute("/u/costumi")({
  head: () => ({
    meta: [
      { title: "I miei costumi — Malastrana" },
      {
        name: "description",
        content:
          "Archivio dimostrativo dei costumi del collaboratore, con hashtag e stato di verifica.",
      },
      { property: "og:title", content: "I miei costumi — Malastrana" },
      {
        property: "og:description",
        content: "Costumi del prototipo Malastrana Eventi.",
      },
      { property: "og:url", content: "/u/costumi" },
    ],
    links: [{ rel: "canonical", href: "/u/costumi" }],
  }),
  component: CostumiPage,
});

function CostumiPage() {
  const { costumes, addCostume } = useDemo();
  const mine = costumes.filter((c) => c.owner === "col-elena");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Costume Completo");
  const [character, setCharacter] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const tagList = tags
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));
    addCostume({
      name: name.trim(),
      category,
      tags: tagList,
      ...(character.trim() ? { character: character.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
    setName("");
    setCharacter("");
    setTags("");
    setNotes("");
    setOpen(false);
  }

  return (
    <AppShell area="user" title="I miei costumi" back="/u/profilo">
      <section className="px-3 pt-6">
        <h2 className="font-serif text-2xl text-foreground">Archivio personale</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ogni costume inserito resta “da verificare” finché l’ufficio non lo conferma.
        </p>
        <div className="mt-4">
          <Button full onClick={() => setOpen((v) => !v)}>
            {open ? "Chiudi" : "Aggiungi costume"}
          </Button>
        </div>
      </section>

      {open && (
        <form onSubmit={submit} className="mt-5 border-y border-border bg-surface px-3 py-5">
          <SectionTitle>Nuovo costume</SectionTitle>
          <div className="space-y-3">
            <LabelledInput label="Nome" value={name} onChange={setName} />
            <div>
              <span className="eyebrow text-muted-foreground">Categoria</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 min-h-12 w-full border border-border-strong bg-background px-3 text-sm text-foreground"
              >
                <option>Costume Completo</option>
                <option>Base Pirata</option>
                <option>Accessori</option>
                <option>Trucco e prostetica</option>
              </select>
            </div>
            <LabelledInput
              label="Personaggio (opzionale)"
              value={character}
              onChange={setCharacter}
            />
            <LabelledInput
              label="Hashtag (separati da spazio)"
              value={tags}
              onChange={setTags}
            />
            <div>
              <span className="eyebrow text-muted-foreground">Note</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full border border-border-strong bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <Button full type="submit" variant="accent">
              Salva in locale
            </Button>
          </div>
        </form>
      )}

      <section className="mt-6 px-3">
        <SectionTitle>{mine.length} costumi</SectionTitle>
        <ul className="border-t border-border">
          {mine.map((c) => (
            <li key={c.id} className="flex gap-3 border-b border-border py-3.5">
              <Thumb label={c.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-base text-foreground">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.category}
                  {c.character ? ` · ${c.character}` : ""}
                </p>
                <div className="mt-1.5">
                  <Tags tags={c.tags} />
                </div>
                {c.notes && (
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {c.notes}
                  </p>
                )}
                <div className="mt-2">
                  <VerificationTag value={c.verification} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 px-3">
        <DemoNote />
      </div>
    </AppShell>
  );
}

function LabelledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-h-12 w-full border border-border-strong bg-background px-3 text-sm text-foreground"
      />
    </label>
  );
}
