import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, ErrorBox, Loading, PageTitle } from "@/components/ui-kit";
import { groupRows, useApiMutation, useMyEvent, type LoadRow } from "@/lib/api";
import { formatDateLong } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/u/bolla/$code")({ component: BollaUser });

function BollaUser() {
  const { code } = Route.useParams();
  const q = useMyEvent(code);
  const rows = q.data?.load_rows ?? [];

  return (
    <AppShell area="user" title="Bolla di carico" back={`/u/eventi/${code}`}>
      {q.isLoading ? (
        <Loading />
      ) : q.isError || !q.data ? (
        <div className="mt-6">
          <ErrorBox error={q.error} />
        </div>
      ) : (
        <>
          <PageTitle eyebrow={q.data.event.code} title={q.data.event.nome} subtitle={formatDateLong(q.data.event.data)} />
          <p className="mt-3 text-sm text-muted-foreground">
            <strong>Entrata</strong>: quando arrivi e hai l'oggetto. <strong>Uscita</strong>: a fine evento, quando lo rimetti a posto. Se è rovinato tocca <strong>Danni</strong> e scrivi cosa è successo.
          </p>
          {rows.length > 0 && (
            <p className="mt-3 text-sm font-semibold text-foreground">
              Entrata {rows.filter((r) => r.present).length}/{rows.length} · Uscita {rows.filter((r) => r.returned).length}/{rows.length}
            </p>
          )}
          <section className="mt-5 grid gap-6">
            {!q.data.partecipazione.is_tl ? (
              <Empty>La bolla di questo evento la compila il team leader.</Empty>
            ) : rows.length === 0 ? (
              <Empty>La bolla di questo evento è ancora vuota.</Empty>
            ) : (
              groupRows(rows).map(([cat, list]) => (
                <div key={cat}>
                  <h3 className="eyebrow mb-2 border-b border-border pb-1 text-primary">{cat}</h3>
                  <div className="grid gap-3">
                    {list.map((r) => (
                      <Row key={r.id} row={r} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}

function Row({ row }: { row: LoadRow }) {
  const [comment, setComment] = useState(row.comment);
  useEffect(() => setComment(row.comment), [row.comment]);
  const save = useApiMutation<Partial<Pick<LoadRow, "present" | "returned" | "damaged" | "comment">>>("user", (body) => ({ path: `/my/load-rows/${row.id}`, method: "PATCH", body }), {
    invalidate: [["events"]],
  });

  return (
    <Card className={cn("p-4", row.damaged && "border-destructive/40 bg-destructive/5")}>
      <p className="font-serif text-lg leading-snug text-foreground">
        {row.quantita > 1 && `${row.quantita}× `}
        {row.item}
      </p>
      {row.note && <p className="text-xs text-muted-foreground">{row.note}</p>}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Check3 label="Entrata" on={row.present} disabled={save.isPending} onClick={() => save.mutate({ present: !row.present })} />
        <Check3 label="Uscita" on={row.returned} disabled={save.isPending} onClick={() => save.mutate({ returned: !row.returned })} />
        <Check3 label="Danni" danger on={row.damaged} disabled={save.isPending} onClick={() => save.mutate({ damaged: !row.damaged })} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Commento (es. manico scheggiato)"
          className="min-h-11 flex-1 rounded-lg border border-border-strong bg-surface px-3 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          disabled={save.isPending || comment === row.comment}
          onClick={() => save.mutate({ comment })}
          className="min-h-11 rounded-lg border border-accent px-3 text-sm font-semibold text-accent disabled:opacity-40"
        >
          Salva
        </button>
      </div>
    </Card>
  );
}

function Check3({ label, on, onClick, danger, disabled }: { label: string; on: boolean; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={cn(
        "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg border text-xs font-semibold",
        on ? (danger ? "border-destructive bg-destructive text-white" : "border-success bg-success text-white") : "border-border-strong bg-surface text-muted-foreground",
      )}
    >
      <span className={cn("flex h-5 w-5 items-center justify-center rounded border", on ? "border-white" : "border-border-strong")}>{on && <Check className="h-4 w-4" />}</span>
      {label}
    </button>
  );
}
