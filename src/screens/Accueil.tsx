import { motion } from 'framer-motion';
import { useUserStore, getLevelInfo, isStreakAtRisk, useSessionStore, useUIStore } from '../stores';
import { getMotivationalMessage } from '../ai';
import { getTechniqueForMode, CRYSTAL_CONFIG } from '../data/techniques';
import { Card, Badge, ProgressBar, Button } from '../components';
import { audio } from '../utils';

export default function Accueil() {
  const { profile, progress } = useUserStore();
  const { crystals } = useSessionStore();
  const setTab = useUIStore((s) => s.setTab);
  const levelInfo = getLevelInfo(progress.xp);
  const streakAtRisk = isStreakAtRisk(progress.lastSessionDate, progress.streakDays);
  const motivMessage = getMotivationalMessage(progress.streakDays, progress.totalSessions);
  const todayTechnique = getTechniqueForMode('parler');
  const crystalInfo = CRYSTAL_CONFIG[todayTechnique.crystalType];

  const handleStart = (tab: 'parler' | 'jouer') => { audio.playTransition(); audio.haptics.medium(); setTab(tab); };

  return (
    <motion.div className="px-5 py-6 pb-8 safe-top" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="flex items-center justify-between mb-5" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div><h1 className="font-display text-2xl font-bold text-white">Salut {profile.name || 'Coach'} 👋</h1><p className="text-white/50 text-sm mt-0.5">{motivMessage}</p></div>
        <div className="flex items-center gap-2">
          {progress.streakDays > 0 && <Badge variant="streak" icon={<span>🔥</span>}>{progress.streakDays}j</Badge>}
          <Badge variant="level">Niv. {levelInfo.level}</Badge>
        </div>
      </motion.div>

      {streakAtRisk && progress.streakDays > 0 && (
        <motion.div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <p className="text-amber-300 text-sm font-medium">⚠️ Ta série de {progress.streakDays} jours expire ce soir !</p>
        </motion.div>
      )}

      <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex justify-between items-center mb-2"><span className="text-white/60 text-xs">{levelInfo.title}</span><span className="text-white/40 text-xs">{levelInfo.xpInLevel}/{levelInfo.xpForLevel} XP</span></div>
        <ProgressBar value={levelInfo.progress * 100} size="sm" />
      </motion.div>

      <motion.div className="mb-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="font-display text-sm font-semibold text-white/60 mb-3">🎯 Mission du jour</h2>
        <Card variant="gradient" className="relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="text-3xl">{todayTechnique.emoji}</div>
            <div className="flex-1"><h3 className="font-display font-bold text-white text-lg">{todayTechnique.name}</h3><p className="text-white/60 text-sm mt-1">{todayTechnique.when}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-white/50"><span>⏱️ 1 min</span><span>{crystalInfo.emoji} +1 {crystalInfo.name}</span><span>⭐ +25 XP</span></div>
            </div>
          </div>
          <Button variant="primary" size="lg" className="w-full mt-5" onClick={() => handleStart('parler')}>▶️ Commencer</Button>
        </Card>
      </motion.div>

      <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card variant="amber" interactive onClick={() => handleStart('parler')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg"><span className="text-2xl">🔥</span></div>
            <div className="flex-1"><h3 className="font-display font-bold text-white">Série rapide</h3><p className="text-white/50 text-xs">1 min parler · 1 technique · 1 cristal</p></div>
            <div className="text-right"><p className="text-amber-400 font-bold">3 min</p><p className="text-white/40 text-xs">+50 XP</p></div>
          </div>
        </Card>
      </motion.div>

      <motion.div className="grid grid-cols-3 gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="glass-card rounded-xl p-4 text-center"><p className="font-display text-2xl font-bold text-white">{progress.totalSessions}</p><p className="text-white/40 text-xs">sessions</p></div>
        <div className="glass-card rounded-xl p-4 text-center"><p className="font-display text-2xl font-bold text-white">{progress.totalMinutes}</p><p className="text-white/40 text-xs">minutes</p></div>
        <div className="glass-card rounded-xl p-4 text-center"><p className="font-display text-2xl font-bold text-white">{crystals.length}</p><p className="text-white/40 text-xs">cristaux</p></div>
      </motion.div>
    </motion.div>
  );
}
