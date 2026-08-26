// Dataset demo Malastrana: compatibile con le route Lovable e senza tariffe.

export type EventStatus = "richiesta" | "confermato" | "da_definire" | "annullato" | "chiuso";
export type Availability = "disponibile" | "non_disponibile" | "da_definire" | null;

export interface LoadRow {
  id: string;
  name: string;
  category: "costume" | "attrezzo" | "scenografia";
  present: boolean;
  damaged: boolean;
  lost: boolean;
  returned: boolean;
  notes: string;
  comment: string;
  code: string;
  qty: string;
}

export interface MalEvent {
  id: string;
  code: string;
  name: string;
  date: string;
  place: string;
  timeStart: string;
  timeEnd: string;
  meetTime?: string;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
  status: EventStatus;
  theme: string;
  type: string;
  duration: string;
  publicInfo: string;
  cancelReason?: string;
  bolla?: LoadRow[];
  assignment?: {
    role: string;
    callTime: string;
    referent: string;
    instructions: string;
    dressCode: string;
    costumeId: string;
    fee: string;
  };
}

export interface Costume {
  id: string;
  name: string;
  category: string;
  character?: string;
  tags: string[];
  verification: "verificato" | "in_verifica" | "inserito";
  owner: string;
  notes?: string;
}

export interface GearItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  verification: "verificato" | "in_verifica" | "inserito";
  owner: string;
}

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  bio: string;
  skills: string[];
  state: string;
  password?: string;
}

export interface EventAvailability {
  eventId: string;
  userId: string;
  name: string;
  proposed: boolean;
  confirmed: boolean;
  isTL?: boolean;
}

export interface DemoNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  eventId?: string;
  read: boolean;
  createdAt: string;
}

export const CURRENT_USER: Collaborator = {
  id: "col-elena",
  name: "Elena Rossi",
  role: "Attrice e performer",
  bio: "Attrice, performer e animatrice. Esperienza in eventi immersivi, spettacoli itineranti e gestione del pubblico.",
  skills: ["#attrice", "#fuoco", "#combattimento", "#medievale", "#pirata", "#gestionePubblico"],
  state: "Attiva",
  password: "Ele01",
};

export const COLLABORATORS: Collaborator[] = [
  CURRENT_USER,
  { id: "col-marco", name: "Marco Bianchi", role: "Attore / Combattente scenico", bio: "Attore con formazione in scherma scenica e spettacoli itineranti.", skills: ["#combattimento", "#medievale", "#stunt"], state: "Attivo" },
  { id: "col-giulia", name: "Giulia Ferrari", role: "Performer / Trucco scenico", bio: "Performer e truccatrice, specializzata in horror e prostetica leggera.", skills: ["#trucco", "#horror", "#performer"], state: "Da confermare" },
  { id: "col-davide", name: "Davide Conti", role: "Tecnico di scena", bio: "Tecnico luci e allestimenti per eventi immersivi.", skills: ["#tecnico", "#luci", "#allestimenti"], state: "Attivo" },
];

export const EVENTS: MalEvent[] = [
  {
    id: "evt-1",
    code: "MAL-261031-03",
    name: "Halloween Experience",
    date: "2026-10-31",
    place: "Castello di …",
    meetTime: "17:15",
    timeStart: "18:00",
    timeEnd: "00:30",
    contactName: "Direzione di scena Malastrana",
    contactPhone: "+39 333 1234567",
    notes: "Briefing obbligatorio al ritrovo. Portare costume nero di base.",
    status: "richiesta",
    theme: "Horror immersivo",
    type: "Spettacolo immersivo itinerante",
    duration: "6h 30m",
    publicInfo: "Percorso a gruppi con attori in scena lungo il camminamento e le sale interne. Ingresso pubblico scaglionato.",
    bolla: [
      { id: "row-1", name: "Mantello Nero", category: "costume", present: false, damaged: false, lost: false, returned: false, notes: "", comment: "", code: "MAT-001", qty: "1" },
      { id: "row-2", name: "Spada Lunga", category: "attrezzo", present: false, damaged: false, lost: false, returned: false, notes: "", comment: "", code: "MAT-002", qty: "1" },
      { id: "row-3", name: "Lanterna", category: "attrezzo", present: false, damaged: false, lost: false, returned: false, notes: "", comment: "", code: "MAT-003", qty: "2" },
    ],
  },
  {
    id: "evt-2",
    code: "MAL-261115-01",
    name: "Omicidio al Castello",
    date: "2026-11-15",
    place: "…",
    meetTime: "16:00",
    timeStart: "17:00",
    timeEnd: "23:30",
    contactName: "Direzione di scena Malastrana",
    contactPhone: "+39 345 9876543",
    notes: "Trucco e prove alle 16:00. Cena con delitto in sale interne.",
    status: "confermato",
    theme: "Mistero storico",
    type: "Cena con delitto",
    duration: "6h 30m",
    publicInfo: "Cena con delitto in sale interne, interazione continua con i tavoli e finale in salone.",
    assignment: {
      role: "Dama di corte / sospettata",
      callTime: "16:00 — trucco e prove · 16:45 — allineamento cast",
      referent: "Direzione di scena Malastrana (demo)",
      instructions: "Ingresso in sala dopo il secondo servizio. Mantenere il personaggio anche nelle pause. Non anticipare la rivelazione finale prima del segnale della regia.",
      dressCode: "Abito storico scuro, nessun accessorio moderno visibile.",
      costumeId: "cos-3",
      fee: "€ 180,00 (dato dimostrativo)",
    },
    bolla: [
      { id: "row-4", name: "Abito storico scuro", category: "costume", present: false, damaged: false, lost: false, returned: false, notes: "", comment: "", code: "MAT-004", qty: "1" },
      { id: "row-5", name: "Candelabro", category: "scenografia", present: false, damaged: false, lost: false, returned: false, notes: "", comment: "", code: "MAT-005", qty: "1" },
    ],
  },
  {
    id: "evt-3",
    code: "MAL-261122-02",
    name: "Vino e Misteri",
    date: "2026-11-22",
    place: "…",
    meetTime: "18:00",
    timeStart: "18:30",
    timeEnd: "23:00",
    contactName: "Ufficio Malastrana",
    contactPhone: "+39 333 1234567",
    notes: "Evento in definizione: verificare il materiale assegnato prima della partenza.",
    status: "da_definire",
    theme: "Investigazione e degustazione",
    type: "Format investigativo con degustazione",
    duration: "4h 30m",
    publicInfo: "Percorso investigativo abbinato a degustazione guidata. Struttura in via di definizione.",
    bolla: [
      { id: "row-6", name: "Calici da degustazione", category: "attrezzo", present: false, damaged: false, lost: false, returned: false, notes: "", comment: "", code: "MAT-006", qty: "6" },
    ],
  },
  {
    id: "evt-4",
    code: "MAL-261130-01",
    name: "Evento Annullato Demo",
    date: "2026-11-30",
    place: "…",
    meetTime: "18:30",
    timeStart: "19:00",
    timeEnd: "23:00",
    contactName: "Ufficio Malastrana",
    contactPhone: "+39 333 1234567",
    notes: "Evento annullato.",
    status: "annullato",
    theme: "Evento dimostrativo",
    type: "Evento dimostrativo",
    duration: "4h",
    publicInfo: "Evento dimostrativo utilizzato per mostrare lo stato annullato.",
    cancelReason: "Condizioni meteo non compatibili con lo svolgimento dell'evento.",
    bolla: [],
  },
];

export const COSTUMES: Costume[] = [
  { id: "cos-1", name: "Base Pirata", category: "Base Pirata", tags: ["#pirata", "#spada", "#combattimento"], verification: "verificato", owner: "col-elena", notes: "Camicia, corpetto, fascia, stivali. Adatta a scene di combattimento." },
  { id: "cos-2", name: "Cavaliere Nero", category: "Costume Completo", character: "Cavaliere Nero", tags: ["#medievale", "#armatura", "#combattimento"], verification: "in_verifica", owner: "col-elena", notes: "Armatura leggera in cuoio, mantello nero, elmo." },
  { id: "cos-3", name: "Professoressa di Magia", category: "Costume Completo", character: "Professoressa di Magia", tags: ["#potter", "#magia", "#professore"], verification: "inserito", owner: "col-elena", notes: "Tunica lunga, mantello, occhiali di scena." },
  { id: "cos-4", name: "Capitano Corsaro", category: "Costume Completo", character: "Jack Sparrow", tags: ["#pirata", "#combattimento", "#mare"], verification: "verificato", owner: "col-marco" },
  { id: "cos-5", name: "Armatura da Torneo", category: "Costume Completo", character: "Cavaliere Nero", tags: ["#medievale", "#armatura", "#combattimento"], verification: "in_verifica", owner: "col-marco" },
  { id: "cos-6", name: "Dama di Corte", category: "Costume Completo", tags: ["#medievale", "#nobilta"], verification: "verificato", owner: "col-giulia" },
];

export const GEAR: GearItem[] = [
  { id: "gear-1", name: "Spada lunga", description: "Replica scenica non affilata, lama in acciaio dolce.", tags: ["#combattimento", "#medievale"], verification: "verificato", owner: "col-elena" },
  { id: "gear-2", name: "Lanterna", description: "Lanterna a candela LED, luce calda.", tags: ["#notturno", "#scena"], verification: "verificato", owner: "col-elena" },
  { id: "gear-3", name: "Bacchetta", description: "Bacchetta in legno intagliato, custodia inclusa.", tags: ["#magia", "#potter"], verification: "in_verifica", owner: "col-elena" },
  { id: "gear-4", name: "Accessori in cuoio", description: "Cinture, bracciali e borsello in cuoio naturale.", tags: ["#medievale", "#pirata"], verification: "inserito", owner: "col-elena" },
];

export const STATUS_LABEL: Record<EventStatus, string> = {
  richiesta: "Disponibilita richiesta",
  confermato: "Confermato",
  da_definire: "Da definire",
  annullato: "Annullato",
  chiuso: "Chiuso",
};

export const VERIFICATION_LABEL: Record<Costume["verification"], string> = {
  verificato: "Verificato dall'ufficio",
  in_verifica: "In verifica",
  inserito: "Inserito dal collaboratore",
};

export const MONTHS = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

export function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function dayNumber(iso: string) {
  return new Date(iso + "T00:00:00").getDate().toString().padStart(2, "0");
}

export function monthShort(iso: string) {
  return MONTHS[new Date(iso + "T00:00:00").getMonth()].slice(0, 3).toUpperCase();
}

export const DEMO_USER_IDS: Record<string, string> = {
  "col-elena": "Elena Rossi",
  "col-marco": "Marco Bianchi",
  "col-giulia": "Giulia Ferrari",
};

export const eventAvailability: EventAvailability[] = EVENTS.flatMap((event, index) =>
  Object.entries(DEMO_USER_IDS)
    .filter((_, i) => (i + index) % 3 !== 2)
    .map(([userId, name]) => ({ eventId: event.code, userId, name, proposed: true, confirmed: false, isTL: false })),
);

export const demoNotifications: DemoNotification[] = [];

export const NOTIFICATIONS = [
  { id: "n1", text: "Confermato per Omicidio al Castello", when: "2h fa" },
  { id: "n2", text: "Nuova richiesta di disponibilita per Halloween Experience", when: "1g fa" },
  { id: "n3", text: "Bolla di carico aggiornata per MAL-261115-01", when: "3g fa" },
];

export const LOAD_ROWS: LoadRow[] = EVENTS.flatMap((e) => e.bolla || []);

export function getEventByCode(code: string) {
  return EVENTS.find((event) => event.code === code);
}

export function getAvailabilityForEvent(eventId: string) {
  return eventAvailability.filter((availability) => availability.eventId === eventId);
}

export function confirmAnimator(eventId: string, userId: string, isTL: boolean) {
  const entry = eventAvailability.find((availability) => availability.eventId === eventId && availability.userId === userId);
  if (!entry) return;
  entry.confirmed = true;
  entry.isTL = isTL;
}

export function unconfirmAnimator(eventId: string, userId: string) {
  const entry = eventAvailability.find((availability) => availability.eventId === eventId && availability.userId === userId);
  if (!entry) return;
  entry.confirmed = false;
  entry.isTL = false;
}

export function getNotificationsForUser(userId: string) {
  return demoNotifications.filter((notification) => notification.userId === userId);
}

export function markNotificationRead(notificationId: string) {
  const notification = demoNotifications.find((item) => item.id === notificationId);
  if (notification) notification.read = true;
}
