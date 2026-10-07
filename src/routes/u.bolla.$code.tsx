import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { LedgerHead, RoundCheck } from "@/components/BollaRound";
import { Empty, ErrorBox, Loading } from "@/components/ui-kit";
import { groupRows, useApiMutation, useMyEvent, type LoadRow } from "@/lib/api";
import { dayNumber, monthShort } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/u/bolla/$code")({ component: BollaUser });

function BollaUser() {
  const { code } = Route.useParams();
  const q = useMyEvent(code);
  const rows = q.data?.load_rows ?? [];
  const ev = q.data?.event;

  return (
    <AppShell
      area="user"
      eyebrow={ev ? `Bolla di carico · ${dayNumber(ev.data)} ${monthShort(ev.data)}` : "Bolla di carico"}
      title={ev?.nome ?? "Bolla di carico"}
      back={`/u/eventi/${code}`}
    >
      {q.isLoading ? (
        <Loading />
      ) : q.isError || !q.data || !ev ? (
        <div className="mt-6">
          <ErrorBox error={q.error} />
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-3 py-2.5">
            <span className="italic text-muted-foreground">{q.data.partecipazione.is_tl ? "Sei team leader" : "Bolla dell'evento"}</span>
            {rows.length > 0 && (
              <span className="font-display text-[12px] uppercase tracking-[0.1em] text-accent">
                Entrata {rows.filter((r) => r.present).length}/{rows.length} · Uscita {rows.filter((r) => r.returned).length}/{rows.length}
              </span>
            )}
          </div>
          <p className="mb-3 text-[15px] italic text-muted-foreground">
            Entrata: quando arrivi e hai l'oggetto. Uscita: a fine serata, quando lo rimetti a posto. Se è rovinato tocca Danni e scrivi cosa è successo.
          </p>
          {ev.stato === "chiuso" && <p className="mb-3 border border-primary bg-danger-soft px-3 py-2 text-primary">Evento chiuso: la bolla ora si può solo guardare.</p>}
          <section className="grid gap-3">
            {!q.data.partecipazione.is_tl ? (
              <Empty>La bolla di questo evento la compila il team leader.</Empty>
            ) : rows.length === 0 ? (
              <Empty>La bolla di questo evento è ancora vuota.</Empty>
            ) : (
              groupRows(rows).map(([cat, list]) => (
                <div key={cat} className="border border-gold bg-card">
                  <LedgerHead title={cat} count={list.length} columns={["Entrata", "Uscita", "Danni"]} />
                  {list.map((r) => (
                    <Row key={r.id} row={r} locked={ev.stato === "chiuso"} />
                  ))}
                </div>
              ))
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}

function Row({ row, locked }: { row: LoadRow; locked: boolean }) {
  const [comment, setComment] = useState(row.comment);
  useEffect(() => setComment(row.comment), [row.comment]);
  const save = useApiMutation<Partial<Pick<LoadRow, "present" | "returned" | "damaged" | "comment">>>("user", (body) => ({ path: `/my/load-rows/${row.id}`, method: "PATCH", body }), {
    invalidate: [["events"]],
  });
  const busy = locked || save.isPending;
  const showBox = row.damaged || !!row.comment;

  return (
    <>
      <div className={cn("grid min-h-[50px] items-center border-b border-line px-3.5 py-1", row.damaged && "bg-danger-soft")} style={{ gridTemplateColumns: "minmax(0,1fr) repeat(3, 52px)" }}>
        <span className="pr-1.5 text-[17px] leading-tight">
          {row.quantita > 1 && `${row.quantita}× `}
          {row.item}
          {row.note && <span className="block text-[13px] italic text-muted-foreground">{row.note}</span>}
        </span>
        <RoundCheck label="Entrata" on={row.present} disabled={busy} onClick={() => save.mutate({ present: !row.present })} />
        <RoundCheck label="Uscita" on={row.returned} disabled={busy} onClick={() => save.mutate({ returned: !row.returned })} />
        <RoundCheck label="Danni" danger on={row.damaged} disabled={busy} onClick={() => save.mutate({ damaged: !row.damaged })} />
      </div>
      {showBox && (
        <div className="border-b border-line bg-danger-soft px-3.5 pb-3 pt-2">
          <label className="font-display text-[9px] uppercase tracking-[0.16em] text-primary" htmlFor={`c${row.id}`}>
            Cosa è successo?
          </label>
          <textarea
            id={`c${row.id}`}
            rows={2}
            value={comment}
            disabled={locked}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Es. pizzo strappato sulla manica"
            className="mt-1 w-full border border-primary bg-card px-2.5 py-2 text-base outline-none"
          />
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-[13px] italic text-muted-foreground">Lo vede anche l'admin</span>
            <button
              type="button"
              disabled={busy || comment === row.comment}
              onClick={() => save.mutate({ comment })}
              className="min-h-9 border border-primary px-3 font-display text-[10px] uppercase tracking-[0.14em] text-primary disabled:opacity-40"
            >
              Salva
            </button>
          </div>
        </div>
      )}
    </>
  );
}
