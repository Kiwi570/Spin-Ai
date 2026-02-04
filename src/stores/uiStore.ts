import { create } from 'zustand';
export type TabType = 'accueil' | 'parler' | 'jouer' | 'techniques' | 'progresser';

interface UIState {
  currentTab: TabType;
  setTab: (tab: TabType) => void;
  showLevelUpModal: boolean;
  newLevel: number;
  showLevelUp: (level: number) => void;
  hideLevelUp: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  currentTab: 'accueil',
  setTab: (tab) => set({ currentTab: tab }),
  showLevelUpModal: false,
  newLevel: 1,
  showLevelUp: (level) => set({ showLevelUpModal: true, newLevel: level }),
  hideLevelUp: () => set({ showLevelUpModal: false }),
}));
