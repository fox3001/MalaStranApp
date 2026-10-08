import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button, Card, Loading, SectionTitle, TextInput } from "@/components/ui-kit";
import { useApiMutation, useMyPresenza, type PresenzaEvento } from "@/lib/api";
import { MONTHS } from "@/lib/format";

type Campi = Pick<PresenzaEvento, "ruolo" | "tariffa" | "diaria" | "pernotti" | "viaggi">;

/** Sezione "Foglio presenza" nella scheda evento dello user confermato. */
export function PresenzaBox({ code }: { code: string }) {
  const q = useMyPresenza(code);
  const [v, setV] = useState<Campi>({ ruolo: "", tariffa: "", diaria: "", pernotti: "", viaggi: "" });
  useEffect(() => {
    if (q.data) setV({ ruolo: q.data.ruolo, tariffa: q.data.tariffa, diaria: q.data.diaria, pernotti: q.data.pernotti, viaggi: q.data.viaggi });
  }, [q.data]);
  const save = useApiMutation<Campi>("user", (body) => ({ path: `/my/presenze/${encodeURIComponent(code)}`, method: "PUT", body }), {
    success: "Foglio presenza salvato",
    invalidate: [["presenze"], ["fogli"]],
  });

  if (q.isLoading) return <Loading />;
  if (!q.data) return null;
  const d = q.data;
  const meseNome = `${MONTHS[Number(d.mese.slice(5, 7)) - 1]} ${d.mese.slice(0, 4)}`;
  const changed = (["ruolo", "tariffa", "diaria", "pernotti", "viaggi"] as const).some((k) => v[k] !== d[k]);
  const set = (k: keyof Campi) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value.replace(/\n/g, " ") }));

  return (
    <Card className="mt-5 grid gap-3">
      <SectionTitle>Foglio presenza</SectionTitle>
      <p className="text-[15px] text-muted-foreground">
        Giorno <strong className="text-foreground">{Number(d.data.slice(8, 10))}</strong> · Tipologia <strong className="text-foreground">{d.tipologia}</strong>
        {d.location && (
          <>
            {" "}
            · <strong className="text-foreground">{d.location}</strong>
          </>
        )}
      </p>
      {d.chiuso ? (
        <p className="border-l-2 border-accent pl-2 text-[15px] italic text-muted-foreground">
          Il foglio di {meseNome} è chiuso: ruolo {d.ruolo || "—"}, tariffa {d.tariffa || "—"}. Non si può più modificare.
        </p>
      ) : (
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(v);
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <TextInput label="Ruolo" value={v.ruolo} onChange={set("ruolo")} maxLength={40} placeholder="es. Attore" />
            <TextInput label="Tariffa (€)" value={v.tariffa} onChange={set("tariffa")} maxLength={14} inputMode="decimal" placeholder="es. 80" />
          </div>
          <p className="font-display text-[10px] uppercase tracking-[0.16em] text-accent">Rimborso spese (se ci sono)</p>
          <div className="grid grid-cols-3 gap-2">
            <TextInput label="Diaria" value={v.diaria} onChange={set("diaria")} maxLength={14} inputMode="decimal" />
            <TextInput label="Pernotti" value={v.pernotti} onChange={set("pernotti")} maxLength={14} inputMode="decimal" />
            <TextInput label="Viaggi" value={v.viaggi} onChange={set("viaggi")} maxLength={14} inputMode="decimal" />
          </div>
          <Button type="submit" variant="outline" disabled={!changed || save.isPending}>
            {save.isPending ? "Salvo…" : "Salva nel foglio presenza"}
          </Button>
        </form>
      )}
      <Link to="/u/presenze" className="text-right font-display text-[10px] uppercase tracking-[0.14em] text-accent">
        Vedi il foglio di {meseNome} ›
      </Link>
    </Card>
  );
}
