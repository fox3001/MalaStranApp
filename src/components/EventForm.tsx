import { useState, type FormEvent } from "react";
import { Button, SectionTitle, SelectInput, TextArea, TextInput, Toggle, Card } from "@/components/ui-kit";
import type { EventStatus, MalEvent } from "@/lib/api";
import { EVENT_STATUS_LABEL } from "@/lib/format";

export type EventInput = Omit<MalEvent, "id" | "code" | "conteggi">;

export const EMPTY_EVENT: EventInput = {
  nome: "", data: "", ora_ritrovo: "", ora_inizio: "", ora_fine: "", luogo: "", tipo: "", descrizione: "", info_operative: "",
  referente_nome: "", referente_telefono: "", compenso: "", compenso_visibile: false, note_admin: "", note_finali: "", stato: "richiesta", motivo_annullamento: "",
};

/** Modulo dati evento, usato sia per creare sia per modificare. */
export function EventForm({ initial, submitLabel, busy, onSubmit }: { initial: EventInput; submitLabel: string; busy?: boolean; onSubmit: (v: EventInput) => void }) {
  const [v, setV] = useState<EventInput>(initial);
  const set = (k: keyof EventInput) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit(v);
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <Card className="grid gap-4">
        <SectionTitle>Informazioni principali</SectionTitle>
        <TextInput label="Nome evento *" value={v.nome} onChange={set("nome")} required placeholder="es. Spettacolo al castello" />
        <div className="grid grid-cols-2 gap-3">
          <TextInput label="Data *" type="date" value={v.data} onChange={set("data")} required />
          <TextInput label="Tipo" value={v.tipo} onChange={set("tipo")} placeholder="es. Cena con delitto" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <TextInput label="Ritrovo" type="time" value={v.ora_ritrovo} onChange={set("ora_ritrovo")} />
          <TextInput label="Inizio" type="time" value={v.ora_inizio} onChange={set("ora_inizio")} />
          <TextInput label="Fine" type="time" value={v.ora_fine} onChange={set("ora_fine")} />
        </div>
        <TextInput label="Luogo" value={v.luogo} onChange={set("luogo")} placeholder="Indirizzo o nome del posto" />
        <TextArea label="Descrizione (la vedono gli user invitati)" value={v.descrizione} onChange={set("descrizione")} />
        <SelectInput label="Stato evento" value={v.stato} onChange={(e) => setV((s) => ({ ...s, stato: e.target.value as EventStatus }))}>
          {(Object.keys(EVENT_STATUS_LABEL) as EventStatus[]).map((s) => (
            <option key={s} value={s}>
              {EVENT_STATUS_LABEL[s]}
            </option>
          ))}
        </SelectInput>
        {v.stato === "annullato" && <TextInput label="Motivo annullamento" value={v.motivo_annullamento} onChange={set("motivo_annullamento")} />}
      </Card>

      <Card className="grid gap-4">
        <SectionTitle>Solo per gli user confermati</SectionTitle>
        <TextArea label="Informazioni operative" value={v.info_operative} onChange={set("info_operative")} placeholder="Cosa fare, dress code, parcheggio…" />
        <div className="grid grid-cols-2 gap-3">
          <TextInput label="Referente sul posto" value={v.referente_nome} onChange={set("referente_nome")} />
          <TextInput label="Telefono referente" type="tel" value={v.referente_telefono} onChange={set("referente_telefono")} />
        </div>
        <TextInput label="Compenso" value={v.compenso} onChange={set("compenso")} placeholder="es. 80 € + rimborso" />
        <Toggle checked={v.compenso_visibile} onChange={(c) => setV((s) => ({ ...s, compenso_visibile: c }))} label="Mostra il compenso agli user confermati" />
      </Card>

      <Card>
        <TextArea label="Note interne (solo admin)" value={v.note_admin} onChange={set("note_admin")} />
      </Card>

      <Button type="submit" disabled={busy} full>
        {busy ? "Salvataggio…" : submitLabel}
      </Button>
    </form>
  );
}
