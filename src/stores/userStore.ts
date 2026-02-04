import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProgress { level: number; xp: number; streakDays: number; bestStreak: number; lastSessionDate: string | null; totalSessions: number; totalMinutes: number; }

const LEVELS = [
  { level: 1, title: 'Débutant', xpRequired: 0 },
  { level: 2, title: 'Apprenti', xpRequired: 100 },
  { level: 3, title: 'Pratiquant', xpRequired: 250 },
  { level: 4, title: 'Confirmé', xpRequired: 500 },
  { level: 5, title: 'Avancé', xpRequired: 800 },
  { level: 6, title: 'Expert', xpRequired: 1200 },
  { level: 7, title: 'Maître', xpRequired: 1800 },
  { level: 8, title: 'Légende', xpRequired: 2500 },
];

export function getLevelInfo(xp: number) {
  let currentLevel = LEVELS[0], nextLevel = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) { currentLevel = LEVELS[i]; nextLevel = LEVELS[i + 1] || LEVELS[i]; break; }
  }
  const xpInLevel = xp - currentLevel.xpRequired;
  const xpForLevel = nextLevel.xpRequired - currentLevel.xpRequired;
  return { level: currentLevel.level, title: currentLevel.title, xpInLevel, xpForLevel, progress: xpForLevel > 0 ? xpInLevel / xpForLevel : 1, nextTitle: nextLevel.title };
}

const getToday = () => new Date().toISOString().split('T')[0];
const getYesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; };

interface UserState {
  profile: { name: string }; progress: UserProgress; isOnboarded: boolean;
  completeOnboarding: (name: string) => void;
  addXP: (amount: number) => { leveledUp: boolean; newLevel: number };
  updateStreak: () => void;
  incrementSession: (minutes: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: { name: '' },
      progress: { level: 1, xp: 0, streakDays: 0, bestStreak: 0, lastSessionDate: null, totalSessions: 0, totalMinutes: 0 },
      isOnboarded: false,
      completeOnboarding: (name) => set({ isOnboarded: true, profile: { name } }),
      addXP: (amount) => {
        const { progress } = get();
        const oldLevel = getLevelInfo(progress.xp).level;
        const newXP = progress.xp + amount;
        const newLevelInfo = getLevelInfo(newXP);
        set((s) => ({ progress: { ...s.progress, xp: newXP, level: newLevelInfo.level } }));
        return { leveledUp: newLevelInfo.level > oldLevel, newLevel: newLevelInfo.level };
      },
      updateStreak: () => {
        const { progress } = get();
        const today = getToday(), yesterday = getYesterday();
        if (progress.lastSessionDate === today) return;
        const newStreak = progress.lastSessionDate === yesterday ? progress.streakDays + 1 : 1;
        set((s) => ({ progress: { ...s.progress, streakDays: newStreak, bestStreak: Math.max(s.progress.bestStreak, newStreak), lastSessionDate: today } }));
      },
      incrementSession: (minutes) => set((s) => ({ progress: { ...s.progress, totalSessions: s.progress.totalSessions + 1, totalMinutes: s.progress.totalMinutes + minutes } })),
    }),
    { name: 'spin-user' }
  )
);

export function isStreakAtRisk(lastSessionDate: string | null, streakDays: number): boolean {
  if (!lastSessionDate || streakDays === 0) return false;
  return lastSessionDate !== getToday();
}
