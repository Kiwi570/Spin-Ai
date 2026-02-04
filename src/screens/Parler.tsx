import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore, useSessionStore, useUIStore } from '../stores';
import { analyzeSession, calculateSessionXP } from '../ai';
import { getTechniqueForMode, CRYSTAL_CONFIG, type Technique } from '../data/techniques';
import { VoiceAnalyzer, audio } from '../utils';
import { Button, Card, Timer, ScoreDisplay, FeedbackCard, Crystal, Confetti, TechniqueStep } from '../components';

type Phase = 'ready' | 'countdown' | 'recording' | 'analyzing' | 'feedback' | 'technique' | 'reward';
const DURATIONS = [{ id: 30, label: '30s' }, { id: 60, label: '1 min' }, { id: 90, label: '1:30' }];

export default function Parler() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [elapsed, setElapsed] = useState(0);
  const [countdownValue, setCountdownValue] = useState(3);
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof analyzeSession> | null>(null);
  const [sessionTechnique, setSessionTechnique] = useState<Technique | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const analyzerRef = useRef<VoiceAnalyzer | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const { progress, addXP, updateStreak, incrementSession } = useUserStore();
  const { addSession, addCrystal, markTechniqueUsed } = useSessionStore();
  const { showLevelUp } = useUIStore();

  useEffect(() => { setSessionTechnique(getTechniqueForMode('parler')); }, []);

  const handleStart = useCallback(async () => {
    audio.init();
    try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); stream.getTracks().forEach(t => t.stop()); setPhase('countdown'); setCountdownValue(3); }
    catch { audio.playError(); }
  }, []);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdownValue === 0) { startRecording(); return; }
    audio.playCountdown(countdownValue); audio.haptics.countdown();
    const t = setTimeout(() => setCountdownValue(p => p - 1), 800);
    return () => clearTimeout(t);
  }, [phase, countdownValue]);

  const startRecording = useCallback(async () => {
    audio.playRecordStart(); audio.haptics.medium();
    const analyzer = new VoiceAnalyzer(); analyzerRef.current = analyzer;
    const success = await analyzer.start(() => {});
    if (!success) { audio.playError(); setPhase('ready'); return; }
    setPhase('recording'); startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const e = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(e);
      if (e >= selectedDuration) handleStop();
    }, 200);
  }, [selectedDuration]);

  const handleStop = useCallback(() => {
    if (!analyzerRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const { metrics } = analyzerRef.current.stop(); analyzerRef.current = null;
    audio.playRecordStop(); setPhase('analyzing');
    setTimeout(() => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const result = analyzeSession(metrics.estimatedPace, metrics.pauseCount, metrics.averageSpeechVolume, metrics.volumeVariance, duration);
      setAnalysisResult(result);
      addSession({ type: 'parler', durationSeconds: duration, scores: result.scores, crystalEarned: result.crystalType });
      const earned = calculateSessionXP(result.scores, duration, progress.streakDays);
      setXpEarned(earned);
      const { leveledUp, newLevel } = addXP(earned);
      if (leveledUp) setTimeout(() => showLevelUp(newLevel), 1500);
      updateStreak(); incrementSession(Math.round(duration / 60));
      addCrystal(result.crystalType, '');
      audio.playReveal(); setPhase('feedback');
    }, 1500);
  }, [addSession, addCrystal, updateStreak, incrementSession, addXP, showLevelUp, progress.streakDays]);

  const handleShowTechnique = useCallback(() => { audio.playTransition(); setPhase('technique'); }, []);
  const handleTechniqueComplete = useCallback(() => { if (sessionTechnique) markTechniqueUsed(sessionTechnique.id); audio.playCrystal(); setShowConfetti(true); setPhase('reward'); }, [sessionTechnique, markTechniqueUsed]);
  const handleRestart = useCallback(() => { setPhase('ready'); setElapsed(0); setAnalysisResult(null); setShowConfetti(false); setSessionTechnique(getTechniqueForMode('parler')); }, []);

  const crystalInfo = analysisResult ? CRYSTAL_CONFIG[analysisResult.crystalType] : null;

  return (
    <motion.div className="min-h-full px-5 py-6 pb-8 safe-top" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Confetti active={showConfetti} />
      <AnimatePresence mode="wait">
        {phase === 'ready' && (
          <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
            <div className="text-center mb-8 mt-8"><h1 className="font-display text-3xl font-bold text-white mb-2">🎙 Parler</h1><p className="text-white/50">Entraîne ta voix librement</p></div>
            <div className="w-full max-w-sm mb-8">
              <p className="text-white/60 text-sm mb-3 text-center">Durée</p>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map((d) => (<button key={d.id} onClick={() => setSelectedDuration(d.id)} className={`p-3 rounded-xl text-center transition-all ${selectedDuration === d.id ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-500/50 text-white' : 'glass-card text-white/70'}`}>{d.label}</button>))}
              </div>
            </div>
            {sessionTechnique && (<Card variant="purple" className="w-full max-w-sm mb-8"><div className="flex items-center gap-3"><span className="text-2xl">{sessionTechnique.emoji}</span><div><p className="text-purple-400 text-xs font-semibold">Technique du jour</p><p className="text-white font-semibold">{sessionTechnique.name}</p></div></div></Card>)}
            <Button variant="primary" size="lg" className="w-full max-w-sm" onClick={handleStart}>🎙 Commencer</Button>
          </motion.div>
        )}
        {phase === 'countdown' && (<motion.div key="countdown" className="fixed inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div key={countdownValue} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl"><span className="font-display text-5xl font-bold text-white">{countdownValue === 0 ? 'GO' : countdownValue}</span></motion.div></motion.div>)}
        {phase === 'recording' && (<motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">{sessionTechnique && (<motion.div className="mb-6 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30"><p className="text-purple-300 text-sm">🎯 {sessionTechnique.name}</p></motion.div>)}<Timer seconds={selectedDuration - elapsed} totalSeconds={selectedDuration} size="lg" /><p className="text-white/50 text-sm mt-8 mb-8">Parle librement...</p><Button variant="ghost" size="lg" onClick={handleStop}>⏹️ Terminer</Button></motion.div>)}
        {phase === 'analyzing' && (<motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center"><motion.div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center mb-6" animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }} transition={{ duration: 2, repeat: Infinity }}><span className="text-4xl">💎</span></motion.div><h2 className="font-display text-xl font-bold text-white">Analyse...</h2></motion.div>)}
        {phase === 'feedback' && analysisResult && (<motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-8"><div className="text-center mb-6"><h2 className="font-display text-2xl font-bold text-white mb-1">Bien joué ! 🎉</h2><p className="text-white/50 text-sm">{elapsed}s</p></div><div className="grid grid-cols-2 gap-3 mb-6"><ScoreDisplay label="Clarté" value={analysisResult.scores.clarity} color="blue" /><ScoreDisplay label="Impact" value={analysisResult.scores.impact} color="amber" /></div><div className="space-y-3 mb-6">{analysisResult.feedback.map((fb, i) => (<FeedbackCard key={i} type={fb.type} icon={fb.icon} text={fb.text} delay={i * 0.1} />))}</div><Button variant="primary" size="lg" className="w-full" onClick={handleShowTechnique}>Continuer →</Button></motion.div>)}
        {phase === 'technique' && sessionTechnique && (<TechniqueStep technique={sessionTechnique} onComplete={handleTechniqueComplete} onSkip={handleTechniqueComplete} />)}
        {phase === 'reward' && analysisResult && crystalInfo && (<motion.div key="reward" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Crystal type={analysisResult.crystalType} size="lg" showLabel /></motion.div><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6"><p className="text-white/50 text-sm mb-1">+{xpEarned} XP</p><h2 className="font-display text-xl font-bold text-white">{crystalInfo.emoji} +1 {crystalInfo.name}</h2></motion.div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 w-full max-w-sm"><Button variant="primary" className="w-full" onClick={handleRestart}>▶️ Nouvelle session</Button></motion.div></motion.div>)}
      </AnimatePresence>
    </motion.div>
  );
}
