import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TECHNIQUES, TECHNIQUE_FAMILIES, type TechniqueFamily, type Technique } from '../data/techniques';
import { useSessionStore } from '../stores';
import { Card, Button } from '../components';
import { audio } from '../utils';

type Filter = 'all' | TechniqueFamily;
const FILTERS: { id: Filter; label: string; emoji: string }[] = [
  { id: 'all', label: 'Toutes', emoji: '✨' }, { id: 'voix', label: 'Voix', emoji: '🎵' },
  { id: 'structure', label: 'Structure', emoji: '📐' }, { id: 'impact', label: 'Impact', emoji: '👑' },
  { id: 'pression', label: 'Pression', emoji: '🧘' }, { id: 'situation', label: 'Situation', emoji: '🎭' },
];

export default function Techniques() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const { techniquesUsed } = useSessionStore();
  const filteredTechniques = activeFilter === 'all' ? TECHNIQUES : TECHNIQUES.filter(t => t.family === activeFilter);

  return (
    <motion.div className="min-h-full px-5 py-6 pb-8 safe-top" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="text-center mb-6 mt-4"><h1 className="font-display text-3xl font-bold text-white mb-2">🧠 Boîte à outils</h1><p className="text-white/50">15 techniques pour progresser</p></div>
      <div className="flex justify-center gap-4 mb-6">
        <div className="glass-card rounded-xl px-4 py-2 text-center"><p className="font-display text-xl font-bold text-purple-400">{techniquesUsed.length}</p><p className="text-white/40 text-xs">pratiquées</p></div>
        <div className="glass-card rounded-xl px-4 py-2 text-center"><p className="font-display text-xl font-bold text-white">{TECHNIQUES.length}</p><p className="text-white/40 text-xs">disponibles</p></div>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6 -mx-5 px-5">
        {FILTERS.map((f) => (<button key={f.id} onClick={() => { audio.playSelect(); setActiveFilter(f.id); }} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === f.id ? 'bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-white border border-purple-500/50' : 'glass-card text-white/60'}`}>{f.emoji} {f.label}</button>))}
      </div>
      <div className="space-y-3">
        {filteredTechniques.map((t, i) => {
          const fam = TECHNIQUE_FAMILIES[t.family];
          const isUsed = techniquesUsed.includes(t.id);
          return (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card variant="default" interactive onClick={() => { audio.playSelect(); setSelectedTechnique(t); }} className={`relative ${isUsed ? 'border-l-4 border-l-purple-500' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.emoji}</span>
                  <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h3 className="font-display font-semibold text-white truncate">{t.name}</h3>{isUsed && <span className="text-purple-400 text-xs">✓</span>}</div><p className="text-white/40 text-xs truncate">{fam.label}</p></div>
                  <span className="text-white/30 text-lg">→</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      <AnimatePresence>
        {selectedTechnique && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTechnique(null)} />
            <motion.div className="relative w-full max-w-lg bg-[#0f0a1f] rounded-t-3xl p-6 pb-8 max-h-[85vh] overflow-y-auto" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}>
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">{selectedTechnique.emoji}</span>
                <div><p className="text-purple-400 text-xs font-semibold uppercase">{TECHNIQUE_FAMILIES[selectedTechnique.family].emoji} {TECHNIQUE_FAMILIES[selectedTechnique.family].label}</p><h2 className="font-display text-2xl font-bold text-white">{selectedTechnique.name}</h2></div>
              </div>
              <div className="mb-5 p-4 rounded-xl bg-white/5"><p className="text-purple-400 text-sm font-semibold mb-1">⏰ Quand</p><p className="text-white/80">{selectedTechnique.when}</p></div>
              <div className="mb-5 p-4 rounded-xl bg-white/5"><p className="text-purple-400 text-sm font-semibold mb-1">💡 Pourquoi</p><p className="text-white/80">{selectedTechnique.why}</p></div>
              <div className="mb-6"><p className="text-purple-400 text-sm font-semibold mb-3">📋 Comment</p><ol className="space-y-2">{selectedTechnique.how.map((step, i) => (<li key={i} className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold flex-shrink-0">{i + 1}</span><span className="text-white/80">{step}</span></li>))}</ol></div>
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6"><p className="text-white font-medium text-sm">🎯 {selectedTechnique.actionPrompt}</p></div>
              <Button variant="ghost" className="w-full" onClick={() => setSelectedTechnique(null)}>Fermer</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
