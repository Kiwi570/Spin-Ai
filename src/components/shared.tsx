import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { useUIStore, type TabType } from '../stores';
import { CRYSTAL_CONFIG, type CrystalType } from '../data/techniques';
import { audio } from '../utils';
import { Button } from './ui';

// TABBAR
const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'accueil', label: 'Accueil', icon: '🏠' }, { id: 'parler', label: 'Parler', icon: '🎙' },
  { id: 'jouer', label: 'Jouer', icon: '🎭' }, { id: 'techniques', label: 'Outils', icon: '🧠' }, { id: 'progresser', label: 'Stats', icon: '📈' },
];

export function TabBar() {
  const currentTab = useUIStore((s) => s.currentTab);
  const setTab = useUIStore((s) => s.setTab);
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => (
        <button key={tab.id} className={`tab-item ${currentTab === tab.id ? 'active' : ''}`} onClick={() => { audio.playSelect(); audio.haptics.light(); setTab(tab.id); }}>
          <motion.div className="tab-icon" whileTap={{ scale: 0.9 }}>{tab.icon}</motion.div>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

// CRYSTAL
interface CrystalProps { type: CrystalType; size?: 'sm' | 'md' | 'lg'; showLabel?: boolean; animate?: boolean; }
export function Crystal({ type, size = 'md', showLabel = false, animate = true }: CrystalProps) {
  const cfg = CRYSTAL_CONFIG[type];
  const sizes = { sm: { c: 40, cr: 32 }, md: { c: 64, cr: 52 }, lg: { c: 96, cr: 76 } };
  const { c, cr } = sizes[size];
  const uid = useMemo(() => `cr-${type}-${Math.random().toString(36).slice(2, 8)}`, [type]);
  return (
    <div className="inline-flex flex-col items-center">
      <motion.div className="relative flex items-center justify-center" style={{ width: c, height: c }} initial={animate ? { scale: 0, rotate: -20 } : undefined} animate={animate ? { scale: 1, rotate: 0 } : undefined} whileHover={animate ? { scale: 1.1 } : undefined}>
        <motion.div className="absolute inset-0 rounded-full blur-xl" style={{ background: cfg.color, opacity: 0.4 }} animate={animate ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : undefined} transition={{ duration: 2, repeat: Infinity }} />
        <svg viewBox="0 0 100 100" width={cr} height={cr} className="relative z-10">
          <defs><linearGradient id={`g-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={cfg.color} stopOpacity="0.9"/><stop offset="50%" stopColor={cfg.color}/><stop offset="100%" stopColor={cfg.color} stopOpacity="0.7"/></linearGradient></defs>
          <motion.polygon points="50,5 90,35 75,95 25,95 10,35" fill={`url(#g-${uid})`} stroke={cfg.color} strokeWidth="2" animate={animate ? { y: [0, -3, 0] } : undefined} transition={{ duration: 3, repeat: Infinity }} />
          <polygon points="50,5 65,25 50,45 35,25" fill="white" opacity="0.25" />
        </svg>
      </motion.div>
      {showLabel && <div className="mt-2 text-center"><p className="text-white font-display font-semibold text-sm">{cfg.name}</p><p className="text-white/50 text-xs">{cfg.emoji}</p></div>}
    </div>
  );
}

// CONFETTI
const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#F59E0B', '#10B981'];
export function Confetti({ active, count = 50 }: { active: boolean; count?: number }) {
  const [pieces, setPieces] = useState<{ id: number; left: number; color: string; delay: number }[]>([]);
  useEffect(() => {
    if (active) {
      setPieces(Array.from({ length: count }, (_, i) => ({ id: i, left: Math.random() * 100, color: COLORS[Math.floor(Math.random() * COLORS.length)], delay: Math.random() * 0.5 })));
      const t = setTimeout(() => setPieces([]), 3500);
      return () => clearTimeout(t);
    }
  }, [active, count]);
  if (!active || !pieces.length) return null;
  return <>{pieces.map((p) => <div key={p.id} className="confetti-piece" style={{ left: `${p.left}%`, backgroundColor: p.color, animationDelay: `${p.delay}s` }} />)}</>;
}

// LEVEL UP MODAL
const TITLES: Record<number, string> = { 1: 'Débutant', 2: 'Apprenti', 3: 'Pratiquant', 4: 'Confirmé', 5: 'Avancé', 6: 'Expert', 7: 'Maître', 8: 'Légende' };
export function LevelUpModal({ isOpen, level, onClose }: { isOpen: boolean; level: number; onClose: () => void }) {
  useEffect(() => { if (isOpen) { audio.playLevelUp(); audio.haptics.success(); } }, [isOpen]);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Confetti active={isOpen} count={60} />
          <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
          <motion.div className="relative glass-gradient rounded-3xl p-8 text-center max-w-sm w-full" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">🎉</motion.div>
            <h2 className="font-display text-3xl font-bold text-white mb-2">Niveau {level} !</h2>
            <p className="text-purple-300 text-lg font-semibold mb-2">{TITLES[level] || 'Maître'}</p>
            <p className="text-white/60 text-sm mb-6">Tu progresses !</p>
            <Button variant="primary" size="lg" onClick={onClose}>Continuer</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// TECHNIQUE STEP
import { TECHNIQUE_FAMILIES, type Technique } from '../data/techniques';
import { VoiceAnalyzer } from '../utils';
import { useRef, useCallback } from 'react';
import { Timer } from './ui';

type Phase = 'show' | 'practice' | 'done';

export function TechniqueStep({ technique, onComplete, onSkip }: { technique: Technique; onComplete: () => void; onSkip: () => void }) {
  const [phase, setPhase] = useState<Phase>('show');
  const [timeLeft, setTimeLeft] = useState(technique.actionDuration);
  const analyzerRef = useRef<VoiceAnalyzer | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const familyInfo = TECHNIQUE_FAMILIES[technique.family];

  const startPractice = useCallback(async () => {
    audio.playRecordStart(); audio.haptics.medium();
    const analyzer = new VoiceAnalyzer(); analyzerRef.current = analyzer;
    const success = await analyzer.start(() => {});
    if (!success) { audio.playError(); return; }
    setPhase('practice'); setTimeLeft(technique.actionDuration);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { stopPractice(); return 0; } return prev - 1; });
    }, 1000);
  }, [technique.actionDuration]);

  const stopPractice = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (analyzerRef.current) { analyzerRef.current.stop(); analyzerRef.current = null; }
    setPhase('done'); audio.playSuccess(); audio.haptics.success();
  }, []);

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); if (analyzerRef.current) analyzerRef.current.stop(); }; }, []);

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
      <motion.div className="relative w-full max-w-md" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
        <AnimatePresence mode="wait">
          {phase === 'show' && (
            <motion.div key="show" className="glass-gradient rounded-3xl p-6 technique-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{technique.emoji}</span>
                <div><p className="text-purple-400 text-xs font-semibold uppercase">{familyInfo.emoji} {familyInfo.label}</p><h2 className="font-display text-xl font-bold text-white">{technique.name}</h2></div>
              </div>
              <div className="mb-4 p-3 rounded-xl bg-white/5"><p className="text-white/60 text-sm"><span className="text-purple-400 font-semibold">Pourquoi ?</span> {technique.why}</p></div>
              <div className="mb-6"><p className="text-purple-400 text-sm font-semibold mb-2">Comment :</p>
                <ul className="space-y-1">{technique.how.map((step, i) => (<li key={i} className="text-white/80 text-sm flex items-start gap-2"><span className="text-purple-400 font-bold">{i + 1}.</span>{step}</li>))}</ul>
              </div>
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"><p className="text-white text-sm font-medium">🎯 {technique.actionPrompt}</p></div>
              <div className="space-y-3">
                <Button variant="primary" size="lg" className="w-full" onClick={startPractice}>▶️ Essayer — {technique.actionDuration}s</Button>
                <Button variant="ghost" size="md" className="w-full" onClick={onSkip}>Passer →</Button>
              </div>
            </motion.div>
          )}
          {phase === 'practice' && (
            <motion.div key="practice" className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="mb-4 inline-block px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30"><p className="text-purple-300 text-sm">🎯 {technique.name}</p></motion.div>
              <div className="flex justify-center mb-6"><Timer seconds={timeLeft} totalSeconds={technique.actionDuration} size="lg" /></div>
              <p className="text-white/60 text-sm mb-6">{technique.actionPrompt}</p>
              <motion.div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center mb-6" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><span className="text-3xl">🎙</span></motion.div>
              <Button variant="ghost" size="md" onClick={stopPractice}>⏹ Terminer</Button>
            </motion.div>
          )}
          {phase === 'done' && (
            <motion.div key="done" className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">✨</motion.div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">Bien joué !</h2>
              <p className="text-white/60 text-sm mb-6">Tu as pratiqué "{technique.name}"</p>
              <Button variant="primary" size="lg" className="w-full" onClick={onComplete}>Continuer →</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
