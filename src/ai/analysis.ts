import type { CrystalType } from '../data/techniques';

export interface FeedbackItem { type: 'strength' | 'improvement'; icon: string; text: string; }
export interface AnalysisResult { scores: { clarity: number; impact: number }; feedback: FeedbackItem[]; crystalType: CrystalType; }

export function analyzeSession(pace: number, pauseCount: number, avgVolume: number, volumeVariance: number, duration: number): AnalysisResult {
  let clarity = 50, impact = 50;
  if (pace >= 120 && pace <= 160) clarity += 25; else if (pace >= 100 && pace <= 180) clarity += 15;
  if (pauseCount >= 2 && pauseCount <= 8) clarity += 15;
  if (avgVolume >= 0.15 && avgVolume <= 0.6) impact += 20;
  if (volumeVariance >= 0.05 && volumeVariance <= 0.3) impact += 20;
  if (duration >= 30) impact += 5; if (duration >= 60) clarity += 5;
  clarity = Math.max(20, Math.min(100, clarity + Math.random() * 10 - 5));
  impact = Math.max(20, Math.min(100, impact + Math.random() * 10 - 5));
  
  const feedback: FeedbackItem[] = [];
  if (clarity >= 70) feedback.push({ type: 'strength', icon: '✨', text: 'Ton rythme est clair et facile à suivre.' });
  else if (pauseCount >= 2) feedback.push({ type: 'strength', icon: '⏸️', text: 'Bien joué pour les pauses.' });
  if (impact >= 70) feedback.push({ type: 'strength', icon: '🎯', text: "Ta voix projette de l'assurance !" });
  else if (volumeVariance >= 0.1) feedback.push({ type: 'strength', icon: '📈', text: 'Belle modulation vocale.' });
  if (pace > 170) feedback.push({ type: 'improvement', icon: '🐢', text: "Essaie de ralentir de 20%." });
  else if (avgVolume < 0.1) feedback.push({ type: 'improvement', icon: '📢', text: 'Projette davantage ta voix.' });
  else if (pauseCount < 2) feedback.push({ type: 'improvement', icon: '💨', text: 'Ose les silences.' });
  
  const crystalType: CrystalType = clarity > impact ? 'clarte' : impact > clarity ? 'impact' : Math.random() > 0.5 ? 'clarte' : 'impact';
  return { scores: { clarity: Math.round(clarity), impact: Math.round(impact) }, feedback: feedback.slice(0, 3), crystalType };
}

export function calculateSessionXP(scores: { clarity: number; impact: number }, duration: number, streakDays = 0): number {
  const avg = (scores.clarity + scores.impact) / 2;
  let xp = Math.round(avg / 4);
  if (duration >= 60) xp += 5; if (duration >= 90) xp += 5;
  if (streakDays >= 7) xp += 15; else if (streakDays >= 3) xp += 10; else if (streakDays >= 1) xp += 5;
  if (avg >= 85) xp = Math.round(xp * 1.5); else if (avg >= 70) xp = Math.round(xp * 1.25);
  return Math.max(10, xp);
}

export function getMotivationalMessage(streakDays: number, totalSessions: number): string {
  if (totalSessions === 0) return 'Prêt pour ta première session ?';
  if (streakDays >= 7) return `🔥 ${streakDays} jours d'affilée !`;
  if (streakDays >= 3) return 'La régularité paie, continue !';
  if (totalSessions >= 10) return 'Tu progresses bien !';
  return 'Chaque session compte 💪';
}
