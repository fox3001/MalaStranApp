import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { DemoNote, SectionTitle, Tags, Thumb, VerificationTag } from "@/components/ui-kit";
import { useDemo } from "@/lib/store";

export const Route = createFileRoute("/u/materiale")({
  head: () => ({
    meta: [
      { title: "Materiale personale — Malastrana" },
      {
        name: "description",
        content:
          "Elenco dimostrativo di armi sceniche, oggetti e accessori del collaboratore.",
      },
      { property: "og:title", content: "Materiale personale — Malastrana" },
      {
        property: "og:description",
        content: "Materiale personale nel prototipo Malastrana.",
      },
      { property: "og:url", content: "/u/materiale" },
    ],
    links: [{ rel: "canonical", href: "/u/materiale" }],
  }),
  component: MaterialePage,
});

function MaterialePage() {
  const { gear } = useDemo();
  const mine = gear.filter((g) => g.owner === "col-elena");

  return (
    <AppShell area="user" title="Materiale personale" back="/u/profilo">
      <section className="px-3 pt-6">
        <h2 className="font-serif text-2xl text-foreground">Oggetti e accessori</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Materiale di proprietà del collaboratore, utilizzabile in scena.
        </p>
      </section>

      <section className="mt-6 px-3">
        <SectionTitle>{mine.length} elementi</SectionTitle>
        <ul className="border-t border-border">
          {mine.map((g) => (
            <li key={g.id} className="flex gap-3 border-b border-border py-3.5">
              <Thumb label={g.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-base text-foreground">{g.name}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {g.description}
                </p>
                <div className="mt-1.5">
                  <Tags tags={g.tags} />
                </div>
                <div className="mt-2">
                  <VerificationTag value={g.verification} />
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
