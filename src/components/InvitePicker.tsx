import { useAdminUsers } from "@/lib/api";
import { formatDate, isAway } from "@/lib/format";

/**
 * Elenco degli user da invitare a un evento.
 * Chi ha segnato che nel giorno dell'evento non c'è NON viene proposto.
 */
export function InvitePicker({
  date,
  excludeIds,
  selected,
  setSelected,
  tlIds,
  setTlIds,
  search,
  setSearch,
}: {
  date: string;
  excludeIds?: Set<number>;
  selected: number[];
  setSelected: (fn: (s: number[]) => number[]) => void;
  tlIds: number[];
  setTlIds: (fn: (s: number[]) => number[]) => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  const users = useAdminUsers();
  const all = (users.data?.users ?? []).filter((u) => u.attivo && !excludeIds?.has(u.id));
  const away = date ? all.filter((u) => isAway(date, u.assenze)) : [];
  const available = all.filter((u) => !away.includes(u));
  const candidates = available.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [u.nome, u.cognome, u.username, u.qualifica, ...u.competenze, ...(u.costumi ?? [])].join(" ").toLowerCase().includes(q);
  });

  return (
    <div className="grid gap-3">
      {!date && <p className="text-sm italic text-muted-foreground">Scegli prima la data: chi quel giorno non c'è verrà tolto dall'elenco.</p>}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filtra per nome, competenza, costume…"
        className="min-h-11 border border-border border-b-[1.5px] border-b-gold bg-card px-3 text-base outline-none focus:border-accent"
      />
      {candidates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {(users.data?.users.length ?? 0) === 0 ? "Non ci sono user: creali prima dalla rubrica." : "Nessun altro user da invitare."}
        </p>
      ) : (
        <ul className="max-h-72 overflow-auto">
          {candidates.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-2 border-b border-border py-2 last:border-b-0">
              <label className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={selected.includes(u.id)}
                  onChange={(e) => setSelected((s) => (e.target.checked ? [...s, u.id] : s.filter((x) => x !== u.id)))}
                />
                <span className="min-w-0">
                  <span className="block">
                    {u.nome} {u.cognome}
                  </span>
                  {u.competenze.length > 0 && <span className="block truncate text-xs text-muted-foreground">{u.competenze.join(", ")}</span>}
                </span>
              </label>
              {selected.includes(u.id) && (
                <label className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  <input type="checkbox" checked={tlIds.includes(u.id)} onChange={(e) => setTlIds((s) => (e.target.checked ? [...s, u.id] : s.filter((x) => x !== u.id)))} />
                  Team leader
                </label>
              )}
            </li>
          ))}
        </ul>
      )}
      {away.length > 0 && (
        <p className="border-l-2 border-primary pl-2 text-[15px] italic text-muted-foreground">
          Non proposti perché il {formatDate(date)} non ci sono: {away.map((u) => `${u.nome} ${u.cognome}`).join(", ")}.
        </p>
      )}
    </div>
  );
}
