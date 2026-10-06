# MalaStranApp – frontend

App web (React + Vite) per gestire eventi e user di Malastrana Eventi. Pubblicata su Cloudflare Workers (`malastranapp-web`).

- Tutti i dati arrivano dal backend `fox3001/MalaStranApp-backend` (indirizzo in `.env.production`). Non ci sono dati finti.
- Pagine in `src/routes` (l'elenco delle pagine `routeTree.gen.ts` si rigenera da solo a ogni build).
- Collegamento al backend: `src/lib/api.ts`.

Comandi: `npm run dev` (prova in locale, con il backend avviato su 127.0.0.1:8787), `npm run build`.
