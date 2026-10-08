import { useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api, downloadText } from "@/lib/api";
import { MONTHS, todayIso } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Crea il report del mese, lo scarica subito e lo lascia in Archivio per 3 mesi. */
export function useFaiReport() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  async function run(mese: string) {
    setBusy(true);
    try {
      const d = await api<{ testo: string }>("admin", "/admin/report-mensile", { method: "POST", body: { mese } });
      downloadText(`report-malastrana-${mese}.txt`, d.testo);
      toast.success("Report pronto: scaricato e salvato in Archivio per 3 mesi");
      void qc.invalidateQueries({ queryKey: ["admin", "report-mensili"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Errore");
    } finally {
      setBusy(false);
    }
  }
  return { run, busy };
}

export const meseLabel = (mese: string) => `${MONTHS[Number(mese.slice(5, 7)) - 1] ?? ""} ${mese.slice(0, 4)}`;

/** Il grande tasto della Regia: report del mese in corso. */
export function FaiReportButton({ className }: { className?: string }) {
  const { run, busy } = useFaiReport();
  const mese = todayIso().slice(0, 7);
  return (
    <button
      type="button"
      onClick={() => void run(mese)}
      disabled={busy}
      className={cn(
        "relative flex min-h-[56px] w-full items-center justify-center gap-2.5 bg-accent px-4 font-display text-[12px] uppercase tracking-[0.16em] text-white disabled:opacity-60",
        "[box-shadow:inset_0_0_0_4px_var(--color-accent),inset_0_0_0_5px_var(--color-gold)]",
        className,
      )}
    >
      <FileText className="h-5 w-5 text-gold-light" strokeWidth={1.4} />
      <span className="flex flex-col items-start leading-tight">
        <span>{busy ? "Preparo il report…" : "Fai report del mese"}</span>
        <span className="font-serif text-[14px] normal-case italic tracking-normal text-gold-light">{meseLabel(mese)} · resta in Archivio 3 mesi</span>
      </span>
    </button>
  );
}
