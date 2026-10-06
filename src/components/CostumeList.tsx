import { Plus, Shirt, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Costume } from "@/lib/api";

/** Elenco dei costumi personali con aggiunta e rimozione. */
export function CostumeList({
  costumes,
  onAdd,
  onDelete,
  adding,
}: {
  costumes: Costume[];
  onAdd: (c: { nome: string; categoria: string; note: string }) => void;
  onDelete: (id: number) => void;
  adding?: boolean;
}) {
  const [open, setOpen] = useState(false);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nome = String(f.get("nome") || "").trim();
    if (!nome) return;
    onAdd({ nome, categoria: String(f.get("categoria") || "").trim(), note: String(f.get("note") || "").trim() });
    e.currentTarget.reset();
    setOpen(false);
  }

  const input = "min-h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm outline-none focus:border-accent";

  return (
    <div>
      {costumes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nessun costume inserito.</p>
      ) : (
        <ul>
          {costumes.map((c) => (
            <li key={c.id} className="flex items-start gap-3 border-b border-border py-2.5 last:border-b-0">
              <Shirt className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-foreground">{c.nome}</span>
                {(c.categoria || c.note) && <span className="block text-xs text-muted-foreground">{[c.categoria, c.note].filter(Boolean).join(" · ")}</span>}
              </span>
              <button
                type="button"
                aria-label={`Rimuovi ${c.nome}`}
                onClick={() => window.confirm(`Rimuovere il costume "${c.nome}"?`) && onDelete(c.id)}
                className="rounded-md p-1.5 text-muted-foreground active:bg-muted"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {open ? (
        <form onSubmit={submit} className="mt-3 grid gap-2">
          <input name="nome" required placeholder="Nome del costume *" className={input} />
          <input name="categoria" placeholder="Categoria (es. medievale, pirata…)" className={input} />
          <input name="note" placeholder="Note (taglia, stato…)" className={input} />
          <div className="flex gap-2">
            <button type="submit" disabled={adding} className="min-h-11 flex-1 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-foreground disabled:opacity-50">
              Salva costume
            </button>
            <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-lg border border-border px-3 text-sm">
              Annulla
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="mt-3 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-accent">
          <Plus className="h-4 w-4" /> Aggiungi costume
        </button>
      )}
    </div>
  );
}
