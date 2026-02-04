import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore, getLevelInfo, useSessionStore } from '../stores';
import { CRYSTAL_CONFIG, TECHNIQUES, type CrystalType } from '../data/techniques';
import { Card, ProgressBar, Crystal } from '../components';

type Tab = 'stats' | 'crystals';

export default function Progresser() {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const { profile, progress } = useUserStore();
  const { sessions, crystals, techniquesUsed, getAverageScores, getCrystalCount } = useSessionStore();
  const levelInfo = getLevelInfo(progress.xp);
  const averageScores = getAverageScores();
  const crystalCount = getCrystalCount();
  const parlerCount = sessions.filter(s => s.type === 'parler').length;
  const jouerCount = sessions.filter(s => s.type === 'jouer').length;

  const handleExport = () => {
    const summary = `SPIN AI — Résumé\nUtilisateur: ${profile.name || 'Coach'}\nNiveau: ${levelInfo.level} (${levelInfo.title})\nXP: ${progress.xp}\nSessions: ${progress.totalSessions}\nMinutes: ${progress.totalMinutes}\nMeilleure série: ${progress.bestStreak}j\nScores moyens: Clarté ${averageScores.clarity}%, Impact ${averageScores.impact}%\nCristaux: ${crystals.length}\nTechniques: ${techniquesUsed.length}/${TECHNIQUES.length}`;
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `spin-ai-resume.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div className="min-h-full px-5 py-6 pb-8 safe-top" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="text-center mb-6 mt-4"><h1 className="font-display text-3xl font-bold text-white mb-2">📈 Progression</h1><p className="text-white/50">Tes stats et récompenses</p></div>
      <Card variant="gradient" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-white/60 text-sm">Niveau {levelInfo.level}</p><h2 className="font-display text-2xl font-bold text-white">{levelInfo.title}</h2></div>
          <div className="text-right"><p className="font-display text-3xl font-bold text-white">{progress.xp}</p><p className="text-white/50 text-xs">XP total</p></div>
        </div>
        <ProgressBar value={levelInfo.progress * 100} size="md" />
        <p className="text-white/40 text-xs mt-2 text-right">{levelInfo.xpInLevel}/{levelInfo.xpForLevel} XP → {levelInfo.nextTitle}</p>
      </Card>
      <div className="flex gap-2 mb-6">
        {[{ id: 'stats' as Tab, label: 'Stats', emoji: '📊' }, { id: 'crystals' as Tab, label: 'Cristaux', emoji: '💎' }].map((t) => (<button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === t.id ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-500/40' : 'glass-card text-white/50'}`}>{t.emoji} {t.label}</button>))}
      </div>
      <AnimatePresence mode="wait">
        {activeTab === 'stats' && (
          <motion.div key="stats" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card variant="blue" className="text-center"><p className="font-display text-3xl font-bold text-blue-400">{progress.totalSessions}</p><p className="text-white/50 text-xs">Sessions</p></Card>
              <Card variant="amber" className="text-center"><p className="font-display text-3xl font-bold text-amber-400">{progress.totalMinutes}</p><p className="text-white/50 text-xs">Minutes</p></Card>
              <Card variant="emerald" className="text-center"><p className="font-display text-3xl font-bold text-emerald-400">{progress.bestStreak}</p><p className="text-white/50 text-xs">Meilleure série</p></Card>
              <Card variant="purple" className="text-center"><p className="font-display text-3xl font-bold text-purple-400">{techniquesUsed.length}</p><p className="text-white/50 text-xs">Techniques</p></Card>
            </div>
            <Card variant="default" className="mb-6">
              <h3 className="font-display font-semibold text-white mb-4">📊 Scores moyens</h3>
              <div className="space-y-3">
                <div><div className="flex justify-between text-sm mb-1"><span className="text-white/60">Clarté</span><span className="text-blue-400 font-semibold">{averageScores.clarity}%</span></div><div className="h-2 bg-white/10 rounded-full overflow-hidden"><motion.div className="h-full bg-blue-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${averageScores.clarity}%` }} /></div></div>
                <div><div className="flex justify-between text-sm mb-1"><span className="text-white/60">Impact</span><span className="text-amber-400 font-semibold">{averageScores.impact}%</span></div><div className="h-2 bg-white/10 rounded-full overflow-hidden"><motion.div className="h-full bg-amber-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${averageScores.impact}%` }} /></div></div>
              </div>
            </Card>
            <Card variant="default" className="mb-6">
              <h3 className="font-display font-semibold text-white mb-4">🎯 Répartition</h3>
              <div className="flex justify-around">
                <div className="text-center"><p className="text-2xl mb-1">🎙</p><p className="font-display font-bold text-white">{parlerCount}</p><p className="text-white/40 text-xs">PARLER</p></div>
                <div className="w-px bg-white/10" />
                <div className="text-center"><p className="text-2xl mb-1">🎭</p><p className="font-display font-bold text-white">{jouerCount}</p><p className="text-white/40 text-xs">JOUER</p></div>
              </div>
            </Card>
            <button onClick={handleExport} className="w-full p-4 glass-card rounded-xl text-center"><span className="text-white/80">📄 Exporter mon résumé</span></button>
          </motion.div>
        )}
        {activeTab === 'crystals' && (
          <motion.div key="crystals" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card variant="gradient" className="text-center mb-6"><p className="text-white/60 text-sm mb-1">Collection totale</p><p className="font-display text-5xl font-bold text-white">{crystals.length}</p><p className="text-white/40 text-sm">cristaux</p></Card>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(Object.keys(CRYSTAL_CONFIG) as CrystalType[]).map((type) => {
                const cfg = CRYSTAL_CONFIG[type];
                return (<Card key={type} variant="default" className="flex items-center gap-3"><Crystal type={type} size="sm" animate={false} /><div><p className="font-display font-bold text-white">{crystalCount[type]}</p><p className="text-white/50 text-xs">{cfg.name}</p></div></Card>);
              })}
            </div>
            {crystals.length > 0 && (
              <Card variant="default"><h3 className="font-display font-semibold text-white mb-4">✨ Récents</h3><div className="flex flex-wrap gap-3">{crystals.slice(-10).reverse().map((c) => (<motion.div key={c.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center"><Crystal type={c.type} size="sm" /><p className="text-white/30 text-[10px] mt-1">{new Date(c.earnedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p></motion.div>))}</div></Card>
            )}
            {crystals.length === 0 && (<div className="text-center py-12"><p className="text-4xl mb-4">💎</p><p className="text-white/50">Tes cristaux apparaîtront ici</p></div>)}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
