import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/malamex")({ component: MalaMex });

type Message = { id: string; author: string; text: string; createdAt: number };
const KEY = "malamex-messages";
const LIFE = 96 * 60 * 60 * 1000;

function readMessages(): Message[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const messages = raw ? (JSON.parse(raw) as Message[]) : [];
    const active = messages.filter((message) => Date.now() - message.createdAt < LIFE);
    window.localStorage.setItem(KEY, JSON.stringify(active));
    return active;
  } catch { return []; }
}

function MalaMex() {
  const location = useLocation();
  const admin = location.searchStr.includes("area=admin");
  const [messages, setMessages] = useState<Message[]>(readMessages);
  const [text, setText] = useState("");
  const author = admin ? "ADMIN" : "Elena Rossi";
  const areaLink = admin ? "/admin" : "/u";
  const active = useMemo(() => messages.filter((message) => Date.now() - message.createdAt < LIFE), [messages]);

  const send = () => {
    const content = text.trim();
    if (!content) return;
    const next = [...active, { id: `${Date.now()}`, author, text: content, createdAt: Date.now() }];
    setMessages(next);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setText("");
  };

  return <div className="min-h-screen bg-background"><header className="border-b border-border bg-surface"><div className="mx-auto flex max-w-5xl items-center gap-3 px-3 py-3"><Link to={areaLink} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border">←</Link><div><p className="eyebrow text-xs text-accent">Comunicazione condivisa</p><h1 className="font-serif text-xl text-primary">MalaMex</h1></div></div></header><main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-5xl flex-col px-3 py-5"><p className="text-sm text-muted-foreground">Messaggi testuali visibili a tutti. Si eliminano automaticamente dopo 96 ore.</p><section className="mt-4 flex-1 border-y border-border">{active.length === 0 ? <p className="py-5 text-sm text-muted-foreground">Ancora nessun messaggio.</p> : active.map((message) => <article key={message.id} className="border-b border-border py-3"><p className="text-sm text-foreground"><span className="font-semibold text-accent">{message.author}</span> — {message.text}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleString("it-IT")}</p></article>)}</section><div className="mt-4 flex gap-2"><input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") send(); }} placeholder="Scrivi un messaggio…" className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm" /><button onClick={send} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white"><Send className="h-4 w-4" /> Invia</button></div></main></div>;
}
