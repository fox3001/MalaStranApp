import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import type { GuidaSezione } from "@/lib/guida";

/** La guida in Word (.docx), con gli stessi testi dei "?". */
export async function guidaDocx(area: "admin" | "user", sezioni: GuidaSezione[]) {
  const titolo = area === "admin" ? "MalaStranApp — Guida per l'admin" : "MalaStranApp — Guida per gli user";
  const children: Paragraph[] = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: titolo, color: "31859B" })] }),
    new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: "Come funziona l'app, pagina per pagina.", italics: true })] }),
  ];
  for (const s of sezioni) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 }, children: [new TextRun({ text: s.titolo, color: "953734" })] }));
    for (const p of s.punti) children.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: p, size: 22 })] }));
  }
  const doc = new Document({ creator: "MalaStranApp", title: titolo, styles: { default: { document: { run: { font: "Calibri" } } } }, sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = area === "admin" ? "Guida_MalaStranApp_admin.docx" : "Guida_MalaStranApp.docx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
