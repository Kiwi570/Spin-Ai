import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CrystalType } from '../data/techniques';

export interface Session { id: string; type: 'parler' | 'jouer'; createdAt: string; durationSeconds: number; scores: { clarity: number; impact: number }; crystalEarned: CrystalType; }
export interface Crystal { id: string; type: CrystalType; earnedAt: string; }
export interface Scene { id: string; title: string; emoji: string; description: string; context: string; prompts: string[]; duration: number; timesPlayed: number; bestScore: number; }

const SCENES: Scene[] = [
  { id: 'client', title: 'Client sceptique', emoji: '🤨', description: 'Un prospect remet en question ta proposition', context: 'Tu présentes ton offre à un client potentiel qui semble dubitatif.', prompts: ['"Vos concurrents font moins cher..."', '"Je ne suis pas convaincu."', '"Quel ROI puis-je espérer ?"'], duration: 90, timesPlayed: 0, bestScore: 0 },
  { id: 'question', title: 'Question difficile', emoji: '😰', description: 'On te met sur la sellette', context: "En réunion, quelqu'un te pose une question déstabilisante.", prompts: ['"Comment expliquez-vous cet échec ?"', '"Vous êtes sûr de tenir ces délais ?"', '"Quels risques ne mentionnez-vous pas ?"'], duration: 60, timesPlayed: 0, bestScore: 0 },
];

interface SessionState {
  sessions: Session[]; crystals: Crystal[]; scenes: Scene[]; techniquesUsed: string[];
  addSession: (session: Omit<Session, 'id' | 'createdAt'>) => string;
  addCrystal: (type: CrystalType, sessionId: string) => void;
  markTechniqueUsed: (id: string) => void;
  updateSceneScore: (sceneId: string, score: number) => void;
  getAverageScores: () => { clarity: number; impact: number };
  getCrystalCount: () => Record<CrystalType, number>;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [], crystals: [], scenes: SCENES, techniquesUsed: [],
      addSession: (data) => { const id = `s-${Date.now()}`; set((s) => ({ sessions: [...s.sessions, { ...data, id, createdAt: new Date().toISOString() }] })); return id; },
      addCrystal: (type) => set((s) => ({ crystals: [...s.crystals, { id: `c-${Date.now()}`, type, earnedAt: new Date().toISOString() }] })),
      markTechniqueUsed: (id) => set((s) => ({ techniquesUsed: s.techniquesUsed.includes(id) ? s.techniquesUsed : [...s.techniquesUsed, id] })),
      updateSceneScore: (sceneId, score) => set((s) => ({ scenes: s.scenes.map((sc) => sc.id === sceneId ? { ...sc, timesPlayed: sc.timesPlayed + 1, bestScore: Math.max(sc.bestScore, score) } : sc) })),
      getAverageScores: () => { const { sessions } = get(); if (!sessions.length) return { clarity: 0, impact: 0 }; const t = sessions.reduce((a, s) => ({ clarity: a.clarity + s.scores.clarity, impact: a.impact + s.scores.impact }), { clarity: 0, impact: 0 }); return { clarity: Math.round(t.clarity / sessions.length), impact: Math.round(t.impact / sessions.length) }; },
      getCrystalCount: () => get().crystals.reduce((a, c) => { a[c.type] = (a[c.type] || 0) + 1; return a; }, { clarte: 0, impact: 0, calme: 0, repartie: 0 } as Record<CrystalType, number>),
    }),
    { name: 'spin-sessions' }
  )
);
