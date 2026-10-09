/*
 * Guida di MalaStranApp: un solo testo, usato sia dai "?" in ogni pagina sia dalla pagina "Come funziona"
 * (che si può anche scaricare in Word). Per cambiare una spiegazione basta cambiarla qui.
 */

export interface GuidaSezione {
  id: string;
  titolo: string;
  /** la pagina a cui si riferisce (per il "?"); null = solo nella guida completa */
  percorso: RegExp | null;
  punti: string[];
}

export const GUIDA_USER: GuidaSezione[] = [
  {
    id: "home",
    titolo: "Home",
    percorso: /^\/u\/?$/,
    punti: [
      "In alto trovi il tuo prossimo evento. Se c'è scritto «Ti attende una risposta», toccalo e rispondi all'ufficio.",
      "«I miei eventi»: tutti gli eventi a cui ti hanno chiamato. «La mia scheda»: i tuoi dati, le competenze e i costumi.",
      "«Fogli presenza»: il foglio del mese con ruoli, tariffe e rimborsi.",
      "«Shout dall'admin»: l'ultimo messaggio dell'ufficio. Il pallino dice quanti non hai ancora letto.",
      "In alto: la campanella sono le notifiche, il «?» apre la spiegazione della pagina in cui sei.",
    ],
  },
  {
    id: "eventi",
    titolo: "I miei eventi",
    percorso: /^\/u\/eventi\/?$/,
    punti: [
      "Qui ci sono gli eventi a cui l'ufficio ti ha chiamato: rosso = devi rispondere, verde = sei confermato.",
      "Tocca un evento per aprire la sua scheda.",
    ],
  },
  {
    id: "evento",
    titolo: "Scheda evento",
    percorso: /^\/u\/eventi\/[^/]+$/,
    punti: [
      "Se ti hanno chiamato rispondi con «Sono disponibile» o «Non posso». Puoi aggiungere una nota per l'ufficio.",
      "Se tocchi «Ci sono» sei subito confermato. Da confermato vedi le info operative, il referente, il compenso (se l'ufficio lo mostra) e la squadra.",
      "Il riquadro «Ruolo», con la maschera e la chiave, ti dice il tuo personaggio o il tuo compito (es. Logistica).",
      "«Foglio presenza»: scrivi ruolo, tariffa ed eventuali rimborsi di questo evento e premi Salva.",
      "Se sei team leader: scrivi i ruoli della squadra, compili la bolla di carico e a fine serata premi «Evento chiuso».",
    ],
  },
  {
    id: "bolla",
    titolo: "Bolla di carico (team leader)",
    percorso: /^\/u\/bolla\//,
    punti: [
      "Ogni voce ha 4 pallini: Entrata = quando arrivi e hai l'oggetto; Uscita = quando a fine serata lo rimetti a posto; Danni = è rovinato; Perso = non si trova più.",
      "Con Danni o Perso si apre «Cosa è successo?»: scrivilo e premi Salva. L'ufficio riceve subito un avviso.",
      "Quando l'evento è chiuso la bolla si blocca: da lì in poi la modifica solo l'ufficio.",
    ],
  },
  {
    id: "calendario",
    titolo: "Calendario",
    percorso: /^\/u\/calendario/,
    punti: [
      "Rosso = devi rispondere, verde = sei confermato, grigio = altri eventi dell'agenzia (di questi vedi solo il tema).",
      "Per segnare che un giorno non ci sei: tocca il giorno e premi «Non ci sono il…». Per tanti giorni di fila usa «Segna più giorni insieme».",
      "Nei giorni segnati l'ufficio non ti chiamerà. Sotto il calendario c'è l'elenco: la × toglie un giorno.",
    ],
  },
  {
    id: "taverna",
    titolo: "Taverna",
    percorso: /^\/u\/taverna/,
    punti: [
      "Un'unica chat per tutti, admin compreso. I messaggi spariscono dopo 24 ore.",
      "Per rivolgerti a qualcuno scrivi @ e scegli il nome dal menù (lo indovina anche se lo scrivi male). Il nome diventa un blocchetto colorato e quella persona riceve una notifica.",
      "Toccando il nome di chi ha scritto, gli rispondi direttamente.",
      "I condor intorno alla torre sono quanti hanno scritto nelle ultime 12 ore. Il tasto con gli uccellini in alto li porta a 20 (toccalo di nuovo per tornare).",
    ],
  },
  {
    id: "shout",
    titolo: "Shout",
    percorso: /^\/u\/shout/,
    punti: ["Sono i messaggi scritti dall'ufficio a te o a tutti. Aprendo questa pagina diventano «letti»."],
  },
  {
    id: "presenze",
    titolo: "Fogli presenza",
    percorso: /^\/u\/presenze/,
    punti: [
      "C'è un foglio per ogni mese, con gli eventi in cui sei confermato. Ruolo, tariffa e rimborsi si scrivono nella scheda di ogni evento.",
      "«Scarica in Word com'è adesso» per vederlo. Se in un giorno hai fatto due eventi, il secondo aggiungilo a mano nel file.",
      "Dall'ultimo giorno del mese premi «Chiudi il foglio»: dopo non si può più modificare.",
      "I fogli chiusi restano nel tuo archivio per 3 mesi: da lì li scarichi in Word.",
    ],
  },
  {
    id: "profilo",
    titolo: "La mia scheda",
    percorso: /^\/u\/profilo/,
    punti: [
      "Contatti, presentazione, competenze (la bandierina indica le principali) e costumi personali: premi «Salva profilo».",
      "Da qui apri anche i fogli presenza e il calendario dei giorni in cui non ci sei.",
      "In fondo: cambia password ed Esci.",
    ],
  },
  {
    id: "notifiche",
    titolo: "Notifiche",
    percorso: /^\/u\/notifiche/,
    punti: ["Inviti agli eventi, conferme, tag in Taverna e shout. Tocca una notifica per aprire la pagina giusta; «Segna tutte come lette» le spunta tutte."],
  },
  {
    id: "installa",
    titolo: "Mettere l'app sul telefono",
    percorso: null,
    punti: [
      "Android: apri il link con Chrome, tre puntini in alto a destra, «Installa app» (o «Installa»), poi di nuovo «Installa». Non scegliere «Crea scorciatoia».",
      "iPhone: apri il link con Safari, tasto Condividi (il quadrato con la freccia), «Aggiungi alla schermata Home».",
      "Comparirà l'icona MalaStranApp: l'app si apre a schermo intero, come una vera app.",
    ],
  },
];

export const GUIDA_ADMIN: GuidaSezione[] = [
  {
    id: "regia",
    titolo: "Torre di regia",
    percorso: /^\/admin\/?$/,
    punti: [
      "In alto: eventi in programma, persone che devono ancora rispondere, danni e oggetti persi.",
      "«Prossimi eventi» (con «+ Nuovo»), «Dal campo» con le ultime notifiche, e le altre stanze: Shout, Report, Archivio, Notifiche.",
      "«Fai report del mese»: scarica il report del mese in corso più la copia di sicurezza dell'app.",
      "I condor intorno alla torre sono quanti user hai. Il tasto con l'omino e gli uccellini li porta a 20 (toccalo di nuovo per tornare).",
    ],
  },
  {
    id: "eventi",
    titolo: "Eventi",
    percorso: /^\/admin\/eventi\/?$/,
    punti: ["Tutti gli eventi, prossimi e passati. Tocca un evento per aprirlo; «+ Nuovo» per crearne uno."],
  },
  {
    id: "nuovo",
    titolo: "Nuovo evento",
    percorso: /^\/admin\/eventi\/nuovo/,
    punti: [
      "Nome e data sono obbligatori. La «Sigla» (es. OaC6) va nel foglio presenze; la «Tematica» è quello che gli user vedono nel calendario.",
      "Le info del riquadro «Solo per gli user confermati» (info operative, referente, compenso) le vede solo chi è confermato.",
      "«Invita user»: chi quel giorno ha segnato che non c'è non viene proposto. Le richieste partono quando crei l'evento.",
      "«Bolla di carico»: carica il PDF o l'Excel della bolla, viene letta e divisa nei suoi gruppi.",
    ],
  },
  {
    id: "evento",
    titolo: "Scheda evento",
    percorso: /^\/admin\/eventi\/(?!nuovo)[^/]+$/,
    punti: [
      "Persone: «Invita user». Chi risponde «Ci sono» è subito confermato (ti arriva la notifica): non devi approvare niente. Per cambiare una persona: premi «Togli» su chi non serve più, poi «Invita user» e scegli quella nuova. «Riapri risposta» fa rispondere di nuovo l'user; «Rendi team leader» gli dà la bolla.",
      "Ruolo: per ogni confermato c'è il riquadro con maschera e chiave. Scegli tra i personaggi dei costumi della bolla e «Logistica», oppure scrivi da zero, poi Salva.",
      "Bolla: Prep = preparato in magazzino (lo spunti tu); Entrata e Uscita = spunte del team leader; Danni e Perso. Puoi aggiungere voci a mano o da file.",
      "Resoconto: riepilogo, cose da sistemare e note finali; si scarica in .txt. Dettagli: modifichi i dati dell'evento.",
      "«Chiudi evento» a fine serata: la bolla si blocca e puoi solo annotare. Un mese dopo la data l'evento va in Archivio (gli eventi DEMO no).",
    ],
  },
  {
    id: "user",
    titolo: "User",
    percorso: /^\/admin\/collaboratori\/?$/,
    punti: ["L'elenco degli user. «+ Nuovo user»: nome, cognome e password (il nome utente si crea da solo). Tocca un nome per la sua scheda."],
  },
  {
    id: "scheda-user",
    titolo: "Scheda user",
    percorso: /^\/admin\/collaboratori\/[^/]+$/,
    punti: [
      "Dati, competenze, costumi, eventi a cui ha partecipato e giorni in cui non c'è.",
      "Accesso: nome utente e password (visibile se è stata impostata dopo l'aggiornamento). «Nuova password» per cambiarla.",
      "«Disattiva account» lo blocca senza cancellarlo; «Elimina» lo toglie del tutto.",
    ],
  },
  {
    id: "calendario",
    titolo: "Calendario",
    percorso: /^\/admin\/calendario/,
    punti: [
      "Tutti gli eventi con tutte le info: rosso = aperto, verde = confermato, grigio = chiuso o annullato.",
      "Gli user vedono gli eventi confermati in grigio, con solo la tematica; i dettagli solo se sono confermati in quell'evento.",
    ],
  },
  {
    id: "taverna",
    titolo: "Taverna",
    percorso: /^\/admin\/taverna/,
    punti: [
      "La chat comune: tu scrivi come «Admin» nel riquadro verde. I messaggi spariscono dopo 24 ore, ma restano salvati per il report del mese.",
      "Scrivi @ per taggare qualcuno: scegli il nome dal menù e quella persona riceve una notifica.",
    ],
  },
  {
    id: "shout",
    titolo: "Shout",
    percorso: /^\/admin\/shout/,
    punti: [
      "Scegli a chi (uno, più user, oppure «Manda a tutti»), scrivi e invia. Gli user ricevono una notifica e lo vedono nella loro home.",
      "Sotto c'è lo storico, con chi l'ha letto. Ogni shout finisce anche nel report del mese.",
    ],
  },
  {
    id: "report",
    titolo: "Report",
    percorso: /^\/admin\/report/,
    punti: ["Tutte le voci delle bolle, anche filtrate per evento o solo quelle con problemi (danni, persi, commenti). Si scarica per Excel."],
  },
  {
    id: "archivio",
    titolo: "Archivio",
    percorso: /^\/admin\/archivio/,
    punti: [
      "Report del mese: scegli il mese e premi «Fai report». Esce un .txt con tutto: eventi, persone, bolle, danni e persi, assenze, fogli presenze, shout, Taverna e storico. Resta qui 3 mesi.",
      "Insieme si scarica la copia di sicurezza (.json): tienila sul computer, serve a rimettere tutto com'era se qualcosa va storto.",
      "Sotto: i resoconti degli eventi archiviati, da scaricare in .txt.",
    ],
  },
  {
    id: "notifiche",
    titolo: "Notifiche",
    percorso: /^\/admin\/notifiche/,
    punti: ["Risposte degli user, danni e persi segnalati, tag in Taverna. Tocca una notifica per aprire l'evento."],
  },
];

export const guidaPer = (area: "admin" | "user") => (area === "admin" ? GUIDA_ADMIN : GUIDA_USER);
export const sezionePer = (area: "admin" | "user", path: string) => guidaPer(area).find((s) => s.percorso?.test(path.replace(/\/$/, "") || "/"));
