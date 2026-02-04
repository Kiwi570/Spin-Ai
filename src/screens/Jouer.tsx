import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore, useSessionStore, useUIStore, type Scene } from '../stores';
import { analyzeSession, calculateSessionXP } from '../ai';
import { getTechniqueForMode, CRYSTAL_CONFIG, type Technique } from '../data/techniques';
import { VoiceAnalyzer, audio } from '../utils';
import { Button, Card, Timer, ScoreDisplay, FeedbackCard, Crystal, Confetti, TechniqueStep } from '../components';

type Phase = 'selection' | 'context' | 'countdown' | 'simulation' | 'analyzing' | 'feedback' | 'technique' | 'reward';

export default function Jouer() {
  const [phase, setPhase] = useState<Phase>('selection');
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [countdownValue, setCountdownValue] = useState(3);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof analyzeSession> | null>(null);
  const [sessionTechnique, setSessionTechnique] = useState<Technique | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const analyzerRef = useRef<VoiceAnalyzer | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const promptTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const { progress, addXP, updateStreak, incrementSession } = useUserStore();
  const { scenes, addSession, addCrystal, updateSceneScore, markTechniqueUsed } = useSessionStore();
  const { showLevelUp } = useUIStore();

  useEffect(() => { setSessionTechnique(getTechniqueForMode('jouer')); }, []);

  const handleSelectScene = (scene: Scene) => { audio.playSelect(); setSelectedScene(scene); setPhase('context'); };

  const handleStartSimulation = useCallback(async () => {
    if (!selectedScene) return;
    audio.init();
    try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); stream.getTracks().forEach(t => t.stop()); setPhase('countdown'); setCountdownValue(3); }
    catch { audio.playError(); }
  }, [selectedScene]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdownValue === 0) { startSimulation(); return; }
    audio.playCountdown(countdownValue);
    const t = setTimeout(() => setCountdownValue(p => p - 1), 800);
    return () => clearTimeout(t);
  }, [phase, countdownValue]);

  const startSimulation = useCallback(async () => {
    if (!selectedScene) return;
    audio.playRecordStart();
    const analyzer = new VoiceAnalyzer(); analyzerRef.current = analyzer;
    const success = await analyzer.start(() => {});
    if (!success) { setPhase('selection'); return; }
    setPhase('simulation'); setCurrentPromptIndex(0); startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const e = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(e);
      if (e >= selectedScene.duration) handleStopSimulation();
    }, 200);
    const promptInterval = Math.floor(selectedScene.duration / selectedScene.prompts.length) * 1000;
    promptTimerRef.current = setInterval(() => {
      setCurrentPromptIndex(p => p < selectedScene.prompts.length - 1 ? p + 1 : p);
    }, promptInterval);
  }, [selectedScene]);

  const handleStopSimulation = useCallback(() => {
    if (!analyzerRef.current || !selectedScene) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (promptTimerRef.current) clearInterval(promptTimerRef.current);
    const { metrics } = analyzerRef.current.stop(); analyzerRef.current = null;
    audio.playRecordStop(); setPhase('analyzing');
    setTimeout(() => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const result = analyzeSession(metrics.estimatedPace, metrics.pauseCount, metrics.averageSpeechVolume, metrics.volumeVariance, duration);
      setAnalysisResult(result);
      const avgScore = (result.scores.clarity + result.scores.impact) / 2;
      updateSceneScore(selectedScene.id, avgScore);
      addSession({ type: 'jouer', durationSeconds: duration, scores: result.scores, crystalEarned: result.crystalType });
      const earned = calculateSessionXP(result.scores, duration, progress.streakDays);
      setXpEarned(earned);
      const { leveledUp, newLevel } = addXP(earned);
      if (leveledUp) setTimeout(() => showLevelUp(newLevel), 1500);
      updateStreak(); incrementSession(Math.round(duration / 60));
      addCrystal(result.crystalType, '');
      audio.playReveal(); setPhase('feedback');
    }, 1500);
  }, [selectedScene, addSession, addCrystal, updateSceneScore, updateStreak, incrementSession, addXP, showLevelUp, progress.streakDays]);

  const handleShowTechnique = useCallback(() => { setPhase('technique'); }, []);
  const handleTechniqueComplete = useCallback(() => { if (sessionTechnique) markTechniqueUsed(sessionTechnique.id); audio.playCrystal(); setShowConfetti(true); setPhase('reward'); }, [sessionTechnique, markTechniqueUsed]);
  const handleRestart = useCallback(() => { setPhase('selection'); setSelectedScene(null); setElapsed(0); setCurrentPromptIndex(0); setAnalysisResult(null); setShowConfetti(false); setSessionTechnique(getTechniqueForMode('jouer')); }, []);

  const crystalInfo = analysisResult ? CRYSTAL_CONFIG[analysisResult.crystalType] : null;

  return (
    <motion.div className="min-h-full px-5 py-6 pb-8 safe-top" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Confetti active={showConfetti} />
      <AnimatePresence mode="wait">
        {phase === 'selection' && (
          <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center mb-8 mt-4"><h1 className="font-display text-3xl font-bold text-white mb-2">🎭 Jouer</h1><p className="text-white/50">Simule une situation réaliste</p></div>
            <div className="space-y-4">
              {scenes.map((scene) => (
                <Card key={scene.id} variant="rose" interactive onClick={() => handleSelectScene(scene)}>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{scene.emoji}</div>
                    <div className="flex-1"><h3 className="font-display font-bold text-white text-lg">{scene.title}</h3><p className="text-white/60 text-sm mt-1">{scene.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-white/40"><span>⏱️ {Math.round(scene.duration / 60)} min</span>{scene.timesPlayed > 0 && <span>🏆 Best: {scene.bestScore}%</span>}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
        {phase === 'context' && selectedScene && (
          <motion.div key="context" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
            <div className="text-center mb-6 mt-8"><span className="text-5xl mb-4 block">{selectedScene.emoji}</span><h2 className="font-display text-2xl font-bold text-white mb-2">{selectedScene.title}</h2></div>
            <Card variant="default" className="w-full max-w-sm mb-6"><p className="text-white/60 text-sm mb-3">📋 Contexte</p><p className="text-white">{selectedScene.context}</p></Card>
            <Card variant="rose" className="w-full max-w-sm mb-8"><p className="text-rose-400 text-sm font-semibold mb-2">Tu vas entendre :</p><ul className="space-y-2">{selectedScene.prompts.map((p, i) => <li key={i} className="text-white/70 text-sm">{p}</li>)}</ul></Card>
            <Button variant="primary" size="lg" className="w-full max-w-sm" onClick={handleStartSimulation}>🎙 Lancer la scène</Button>
            <button onClick={() => setPhase('selection')} className="mt-4 text-white/40 text-sm">← Changer</button>
          </motion.div>
        )}
        {phase === 'countdown' && (<motion.div key="countdown" className="fixed inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div key={countdownValue} initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="w-28 h-28 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center"><span className="font-display text-5xl font-bold text-white">{countdownValue === 0 ? 'GO' : countdownValue}</span></motion.div></motion.div>)}
        {phase === 'simulation' && selectedScene && (
          <motion.div key="simulation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Timer seconds={selectedScene.duration - elapsed} totalSeconds={selectedScene.duration} size="lg" />
            <motion.div key={currentPromptIndex} className="mt-8 p-6 glass-rose rounded-2xl max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><p className="text-white text-lg font-medium italic">{selectedScene.prompts[currentPromptIndex]}</p></motion.div>
            <Button variant="ghost" size="lg" className="mt-8" onClick={handleStopSimulation}>⏹️ Terminer</Button>
          </motion.div>
        )}
        {phase === 'analyzing' && (<motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center"><motion.div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500/30 to-pink-500/30 flex items-center justify-center mb-6" animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }} transition={{ duration: 2, repeat: Infinity }}><span className="text-4xl">💎</span></motion.div><h2 className="font-display text-xl font-bold text-white">Analyse...</h2></motion.div>)}
        {phase === 'feedback' && analysisResult && (<motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-8"><div className="text-center mb-6"><h2 className="font-display text-2xl font-bold text-white mb-1">Scène terminée ! 🎭</h2><p className="text-white/50 text-sm">{elapsed}s</p></div><div className="grid grid-cols-2 gap-3 mb-6"><ScoreDisplay label="Clarté" value={analysisResult.scores.clarity} color="blue" /><ScoreDisplay label="Impact" value={analysisResult.scores.impact} color="amber" /></div><div className="space-y-3 mb-6">{analysisResult.feedback.map((fb, i) => <FeedbackCard key={i} type={fb.type} icon={fb.icon} text={fb.text} delay={i * 0.1} />)}</div><Button variant="primary" size="lg" className="w-full" onClick={handleShowTechnique}>Continuer →</Button></motion.div>)}
        {phase === 'technique' && sessionTechnique && (<TechniqueStep technique={sessionTechnique} onComplete={handleTechniqueComplete} onSkip={handleTechniqueComplete} />)}
        {phase === 'reward' && analysisResult && crystalInfo && (<motion.div key="reward" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Crystal type={analysisResult.crystalType} size="lg" showLabel /></motion.div><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6"><p className="text-white/50 text-sm mb-1">+{xpEarned} XP</p><h2 className="font-display text-xl font-bold text-white">{crystalInfo.emoji} +1 {crystalInfo.name}</h2></motion.div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 w-full max-w-sm"><Button variant="primary" className="w-full" onClick={handleRestart}>🎭 Nouvelle scène</Button></motion.div></motion.div>)}
      </AnimatePresence>
    </motion.div>
  );
}
