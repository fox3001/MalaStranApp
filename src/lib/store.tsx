import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  EVENTS,
  COLLABORATORS,
  COSTUMES,
  GEAR,
  LOAD_ROWS,
  NOTIFICATIONS,
  type Collaborator,
  type Costume,
  type GearItem,
  type LoadRow,
  type MalEvent,
} from "@/data/demo";

export type AvailabilityResponse = "yes" | "no" | "disponibile" | "non_disponibile" | "da_definire";
export type BollaItemStatus = "presente" | "danneggiato" | "mancante";
export type EventStatus = "richiesta" | "da_definire" | "confermato" | "annullato" | "chiuso";
export type SkillVerification = "verificata" | "in_verifica" | "proposta";

export interface CollaboratorSkill {
  name: string;
  status: SkillVerification;
  verifiedAt?: string;
}

export interface PersonalPhoto {
  id: string;
  url: string;
  tags: string[];
  caption?: string;
  uploadedAt: string;
}

export interface PersonalCostume {
  id: string;
  name: string;
  category: string;
  tags: string[];
  notes?: string;
}

export interface CollaboratorExtended extends Collaborator {
  phone?: string;
  email?: string;
  skillsDetail: CollaboratorSkill[];
  proposedSkills: string[];
  flaggedSkills: string[];
  personalCostumes: PersonalCostume[];
  personalPhotos: PersonalPhoto[];
}

export interface EventTeamMember {
  collaboratorId: string;
  role: string;
  isTeamLeader: boolean;
}

export interface BollaItem {
  id: string;
  code: string;
  name: string;
  type: "costume" | "oggetto" | "scenografia";
  size: string;
  qty: number;
  notes?: string;
}

export interface Bolla {
  id: string;
  code: string;
  date: string;
  eventCode: string;
  items: BollaItem[];
  closed: boolean;
  teamLeaderId?: string;
}

export interface MalEventExtended extends MalEvent {
  contactName?: string;
  contactPhone?: string;
  adminNotes?: string;
  tlComments?: string;
  tlClosedAt?: string;
  adminApprovedAt?: string;
  team?: EventTeamMember[];
}

export interface TimelineEntry {
  id: string;
  text: string;
  at: string;
}

interface DemoState {
  events: MalEventExtended[];
  collaborators: CollaboratorExtended[];
  costumes: Costume[];
  gear: GearItem[];
  load: LoadRow[];
  timeline: TimelineEntry[];
  availability: Record<string, AvailabilityResponse | undefined>;
  bolle: Bolla[];
  bollaItemsState: Record<string, BollaItemStatus | undefined>;
  setAvailability: (eventId: string, response: AvailabilityResponse) => void;
  setAvailabilityResponse: (eventId: string, response: AvailabilityResponse) => void;
  clearAvailabilityResponse: (eventId: string) => void;
  addCostume: (costume: Omit<Costume, "id" | "verification" | "owner">) => void;
  updateLoadRow: (id: string, patch: Partial<LoadRow>, note?: string) => void;
  addBolla: (bolla: Bolla) => void;
  closeBolla: (bollaCode: string) => void;
  reopenBolla: (bollaCode: string) => void;
  setBollaTeamLeader: (bollaCode: string, collaboratorId: string) => void;
  setBollaItemStatus: (itemId: string, status: BollaItemStatus) => void;
  updateEvent: (code: string, updates: Partial<MalEventExtended>) => void;
  closeEventByTL: (code: string, comments?: string) => void;
  approveEventClosure: (code: string) => void;
  addSkillToCollaborator: (collaboratorId: string, skill: string) => void;
  verifyCollaboratorSkill: (collaboratorId: string, skill: string) => void;
  proposeSkill: (collaboratorId: string, skill: string) => void;
  updateCollaborator: (collaboratorId: string, updates: Partial<Pick<CollaboratorExtended, "phone" | "email" | "bio" | "role" | "state">>) => void;
  setEventTeamMember: (eventCode: string, member: EventTeamMember) => void;
  removeEventTeamMember: (eventCode: string, collaboratorId: string) => void;
  addPersonalCostume: (collaboratorId: string, costume: { name: string; category: string; tags: string[]; notes?: string }) => void;
  addPersonalPhoto: (collaboratorId: string, photo: { url: string; tags: string[]; caption?: string }) => void;
  flagSkill: (collaboratorId: string, skill: string) => void;
}

const STORAGE_KEY = "malastrana-demo-v3";
const DemoContext = createContext<DemoState | null>(null);

const toCollaboratorExtended = (collaborator: Collaborator): CollaboratorExtended => ({
  ...collaborator,
  phone: "",
  email: "",
  skillsDetail: collaborator.skills.map((name) => ({ name, status: "in_verifica" })),
  proposedSkills: [],
  flaggedSkills: [],
  personalCostumes: [],
  personalPhotos: [],
});

interface Persisted {
  availability: Record<string, AvailabilityResponse | undefined>;
  costumes: Costume[];
  load: LoadRow[];
  timeline: TimelineEntry[];
  bolle: Bolla[];
  bollaItemsState: Record<string, BollaItemStatus | undefined>;
  events: MalEventExtended[];
  collaborators: CollaboratorExtended[];
}

const initial: Persisted = {
  availability: {},
  costumes: COSTUMES,
  load: LOAD_ROWS,
  timeline: [],
  bolle: [],
  bollaItemsState: {},
  collaborators: COLLABORATORS.map(toCollaboratorExtended),
  events: EVENTS.map((e) => ({
    ...e,
    contactName: "",
    contactPhone: "",
    adminNotes: "",
    tlComments: "",
    team: [],
  })),
};

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initial, ...(JSON.parse(raw) as Partial<Persisted>) });
    } catch {
      /* prototipo: ignora storage non disponibile */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state]);

  const setAvailability = useCallback((eventId: string, response: AvailabilityResponse) => {
    setState((s) => ({ ...s, availability: { ...s.availability, [eventId]: response } }));
  }, []);

  const clearAvailabilityResponse = useCallback((eventId: string) => {
    setState((s) => {
      const availability = { ...s.availability };
      delete availability[eventId];
      return { ...s, availability };
    });
  }, []);

  const addCostume = useCallback((costume: Omit<Costume, "id" | "verification" | "owner">) => {
    setState((s) => ({
      ...s,
      costumes: [{ ...costume, id: `cos-${Date.now()}`, verification: "inserito", owner: "Elena Rossi" }, ...s.costumes],
    }));
  }, []);

  const updateLoadRow = useCallback((id: string, patch: Partial<LoadRow>, note?: string) => {
    setState((s) => ({
      ...s,
      load: s.load.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      timeline: note ? [{ id: `tl-${Date.now()}`, text: note, at: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) }, ...s.timeline] : s.timeline,
    }));
  }, []);

  const addBolla = useCallback((bolla: Bolla) => setState((s) => ({ ...s, bolle: [...s.bolle, bolla] })), []);
  const closeBolla = useCallback((bollaCode: string) => setState((s) => ({ ...s, bolle: s.bolle.map((b) => b.code === bollaCode ? { ...b, closed: true } : b) })), []);
  const reopenBolla = useCallback((bollaCode: string) => setState((s) => ({ ...s, bolle: s.bolle.map((b) => b.code === bollaCode ? { ...b, closed: false } : b) })), []);
  const setBollaTeamLeader = useCallback((bollaCode: string, collaboratorId: string) => setState((s) => ({ ...s, bolle: s.bolle.map((b) => b.code === bollaCode ? { ...b, teamLeaderId: collaboratorId } : b) })), []);
  const setBollaItemStatus = useCallback((itemId: string, status: BollaItemStatus) => setState((s) => ({ ...s, bollaItemsState: { ...s.bollaItemsState, [itemId]: status } })), []);

  const updateEvent = useCallback((code: string, updates: Partial<MalEventExtended>) => {
    setState((s) => ({ ...s, events: s.events.map((e) => e.code === code ? { ...e, ...updates } : e) }));
  }, []);

  const closeEventByTL = useCallback((code: string, comments?: string) => {
    setState((s) => ({
      ...s,
      events: s.events.map((e) => e.code === code ? { ...e, status: "chiuso" as EventStatus, tlComments: comments || "", tlClosedAt: new Date().toISOString() } : e),
    }));
  }, []);

  const approveEventClosure = useCallback((code: string) => {
    setState((s) => ({ ...s, events: s.events.map((e) => e.code === code ? { ...e, adminApprovedAt: new Date().toISOString() } : e) }));
  }, []);

  const addSkillToCollaborator = useCallback((collaboratorId: string, skill: string) => {
    const normalized = skill.trim().startsWith("#") ? skill.trim() : `#${skill.trim().replace(/\s+/g, "")}`;
    if (!normalized || normalized === "#") return;
    setState((s) => ({
      ...s,
      collaborators: s.collaborators.map((c) => c.id !== collaboratorId || c.skillsDetail.some((item) => item.name.toLowerCase() === normalized.toLowerCase())
        ? c
        : { ...c, skills: [...c.skills, normalized], skillsDetail: [...c.skillsDetail, { name: normalized, status: "in_verifica" }] }),
    }));
  }, []);

  const verifyCollaboratorSkill = useCallback((collaboratorId: string, skill: string) => {
    setState((s) => ({
      ...s,
      collaborators: s.collaborators.map((c) => c.id !== collaboratorId ? c : {
        ...c,
        skillsDetail: c.skillsDetail.map((item) => item.name === skill ? { ...item, status: "verificata", verifiedAt: new Date().toISOString() } : item),
        proposedSkills: c.proposedSkills.filter((item) => item !== skill),
      }),
    }));
  }, []);

  const proposeSkill = useCallback((collaboratorId: string, skill: string) => {
    const normalized = skill.trim().startsWith("#") ? skill.trim() : `#${skill.trim().replace(/\s+/g, "")}`;
    if (!normalized || normalized === "#") return;
    setState((s) => ({
      ...s,
      collaborators: s.collaborators.map((c) => c.id !== collaboratorId || c.proposedSkills.includes(normalized)
        ? c
        : { ...c, proposedSkills: [...c.proposedSkills, normalized] }),
    }));
  }, []);

  const updateCollaborator = useCallback((collaboratorId: string, updates: Partial<Pick<CollaboratorExtended, "phone" | "email" | "bio" | "role" | "state">>) => {
    setState((s) => ({ ...s, collaborators: s.collaborators.map((c) => c.id === collaboratorId ? { ...c, ...updates } : c) }));
  }, []);

  const setEventTeamMember = useCallback((eventCode: string, member: EventTeamMember) => {
    setState((s) => ({
      ...s,
      events: s.events.map((event) => {
        if (event.code !== eventCode) return event;
        const team = event.team || [];
        const withoutMember = team.filter((item) => item.collaboratorId !== member.collaboratorId);
        const withoutOtherTl = member.isTeamLeader ? withoutMember.map((item) => ({ ...item, isTeamLeader: false })) : withoutMember;
        return { ...event, team: [...withoutOtherTl, member] };
      }),
    }));
  }, []);

  const removeEventTeamMember = useCallback((eventCode: string, collaboratorId: string) => {
    setState((s) => ({ ...s, events: s.events.map((event) => event.code === eventCode ? { ...event, team: (event.team || []).filter((item) => item.collaboratorId !== collaboratorId) } : event) }));
  }, []);

  const addPersonalCostume = useCallback((collaboratorId: string, costume: { name: string; category: string; tags: string[]; notes?: string }) => {
    setState((s) => ({
      ...s,
      collaborators: s.collaborators.map((c) => c.id !== collaboratorId ? c : {
        ...c,
        personalCostumes: [...c.personalCostumes, { id: `pc-${Date.now()}`, ...costume }],
      }),
    }));
  }, []);

  const addPersonalPhoto = useCallback((collaboratorId: string, photo: { url: string; tags: string[]; caption?: string }) => {
    setState((s) => ({
      ...s,
      collaborators: s.collaborators.map((c) => c.id !== collaboratorId ? c : {
        ...c,
        personalPhotos: [...c.personalPhotos, { id: `ph-${Date.now()}`, ...photo, uploadedAt: new Date().toISOString() }],
      }),
    }));
  }, []);

  const flagSkill = useCallback((collaboratorId: string, skill: string) => {
    setState((s) => ({
      ...s,
      collaborators: s.collaborators.map((c) => {
        if (c.id !== collaboratorId) return c;
        const isFlagged = c.flaggedSkills.includes(skill);
        return {
          ...c,
          flaggedSkills: isFlagged ? c.flaggedSkills.filter((s2) => s2 !== skill) : [...c.flaggedSkills, skill],
        };
      }),
    }));
  }, []);

  const value = useMemo<DemoState>(() => ({
    events: state.events,
    collaborators: state.collaborators,
    gear: GEAR,
    costumes: state.costumes,
    load: state.load,
    timeline: state.timeline,
    availability: state.availability,
    bolle: state.bolle,
    bollaItemsState: state.bollaItemsState,
    setAvailability,
    setAvailabilityResponse: setAvailability,
    clearAvailabilityResponse,
    addCostume,
    updateLoadRow,
    addBolla,
    closeBolla,
    reopenBolla,
    setBollaTeamLeader,
    setBollaItemStatus,
    updateEvent,
    closeEventByTL,
    approveEventClosure,
    addSkillToCollaborator,
    verifyCollaboratorSkill,
    proposeSkill,
    updateCollaborator,
    setEventTeamMember,
    removeEventTeamMember,
    addPersonalCostume,
    addPersonalPhoto,
    flagSkill,
  }), [state, setAvailability, clearAvailabilityResponse, addCostume, updateLoadRow, addBolla, closeBolla, reopenBolla, setBollaTeamLeader, setBollaItemStatus, updateEvent, closeEventByTL, approveEventClosure, addSkillToCollaborator, verifyCollaboratorSkill, proposeSkill, updateCollaborator, setEventTeamMember, removeEventTeamMember, addPersonalCostume, addPersonalPhoto, flagSkill]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo deve essere usato dentro DemoProvider");
  return ctx;
}

export { COLLABORATORS, NOTIFICATIONS };
