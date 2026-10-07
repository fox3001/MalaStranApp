import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button, TextInput } from "@/components/ui-kit";
import type { Assenza } from "@/lib/api";
import { formatAssenza, todayIso } from "@/lib/format";

/**
 * I giorni in cui uno user non c'è: etichette "14 nov", "21–23 nov"…
 * Lo user può aggiungerne e toglierne; l'admin li vede soltanto (readOnly).
 */
export function AssenzeList({
  assenze,
  onAdd,
  onDelete,
  adding,
  readOnly,
  hideAdd,
  empty = "Nessun giorno segnato.",
}: {
  assenze: Assenza[];
  onAdd?: (a: { dal: string; al: string }) => void;
  onDelete?: (id: number) => void;
  adding?: boolean;
  readOnly?: boolean;
  hideAdd?: boolean;
  empty?: string;
}) {
  const [open, setOpen] = useState(false);
  const [dal, setDal] = useState("");
  const [al, setAl] = useState("");
  const today = todayIso();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!dal || !onAdd) return;
    onAdd({ dal, al: al && al >= dal ? al : dal });
    setDal("");
    setAl("");
    setOpen(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {assenze.length === 0 && (readOnly || hideAdd) && <p className="text-sm italic text-muted-foreground">{empty}</p>}
        {assenze.map((a) => (
          <span key={a.id ?? `${a.dal}-${a.al}`} className="inline-flex items-center gap-1 border border-primary bg-card py-0.5 pl-2.5 pr-1 text-[15px] text-primary">
            {formatAssenza(a.dal, a.al)}
            {!readOnly && a.id !== undefined && (
              <button
                type="button"
                aria-label={`Togli ${formatAssenza(a.dal, a.al)}`}
                onClick={() => onDelete?.(a.id!)}
                className="inline-flex h-7 w-7 items-center justify-center text-primary/70 active:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {(readOnly || a.id === undefined) && <span className="pr-1.5" />}
          </span>
        ))}
        {!readOnly && !hideAdd && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-block border border-dashed border-muted-foreground bg-card px-2.5 py-0.5 text-[15px] italic text-muted-foreground"
          >
            + aggiungi
          </button>
        )}
      </div>

      {!readOnly && open && (
        <form onSubmit={submit} className="mt-3 grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="Dal"
              type="date"
              required
              min={today}
              value={dal}
              onChange={(e) => {
                setDal(e.target.value);
                if (al && al < e.target.value) setAl("");
              }}
            />
            <TextInput label="Al (se più giorni)" type="date" min={dal || today} value={al} onChange={(e) => setAl(e.target.value)} />
          </div>
          <p className="text-xs italic text-muted-foreground">Per un giorno solo basta la prima data.</p>
          <div className="flex gap-2">
            <Button type="submit" disabled={!dal || adding} className="flex-1">
              Segna
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
