import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../stores';
import { Button } from '../components';
import { audio } from '../utils';

interface OnboardingProps { onComplete: () => void; }

const STEPS = [
  { id: 'welcome', emoji: '🌀', title: 'Bienvenue sur SPIN AI', description: 'Ton coach vocal personnel pour devenir un orateur captivant.' },
  { id: 'parler', emoji: '🎙', title: 'PARLER', description: 'Entraîne ta voix librement. Gagne en clarté et en impact chaque jour.' },
  { id: 'jouer', emoji: '🎭', title: 'JOUER', description: 'Simule des situations réelles. Client difficile, question piège... Tu gères.' },
  { id: 'techniques', emoji: '🧠', title: '15 Techniques', description: 'Une boîte à outils complète. Chaque session te fait découvrir une nouvelle technique.' },
  { id: 'name', emoji: '✨', title: "Comment t'appeler ?", description: 'Pour personnaliser ton expérience.', isInput: true },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const { completeOnboarding } = useUserStore();
  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const canContinue = !step.isInput || name.trim().length >= 2;

  const handleNext = () => {
    audio.playSelect(); audio.haptics.light();
    if (isLastStep) { completeOnboarding(name.trim() || 'Coach'); onComplete(); }
    else setCurrentStep(currentStep + 1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="flex gap-2 mb-8">{STEPS.map((_, i) => (<motion.div key={i} className={`w-2 h-2 rounded-full ${i === currentStep ? 'bg-purple-500' : 'bg-white/20'}`} animate={i === currentStep ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.5 }} />))}</div>
      <AnimatePresence mode="wait">
        <motion.div key={step.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full max-w-sm text-center">
          <motion.div className="text-7xl mb-6" initial={{ scale: 0 }} animate={{ scale: 1 }}>{step.emoji}</motion.div>
          <motion.h1 className="font-display text-3xl font-bold text-white mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>{step.title}</motion.h1>
          <motion.p className="text-white/60 text-lg mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{step.description}</motion.p>
          {step.isInput && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8"><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton prénom..." className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white text-center text-lg font-display placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-all" maxLength={20} autoFocus /></motion.div>)}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-3">
            <Button variant="primary" size="lg" className="w-full" onClick={handleNext} disabled={!canContinue}>{isLastStep ? 'Commencer 🚀' : 'Continuer'}</Button>
            {currentStep < 3 && (<button onClick={() => setCurrentStep(currentStep + 1)} className="text-white/40 text-sm">Passer →</button>)}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
