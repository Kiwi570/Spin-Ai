import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore, useUIStore } from './stores';
import { TabBar, LevelUpModal } from './components';
import { Accueil, Parler, Jouer, Techniques, Progresser, Onboarding } from './screens';
import { audio } from './utils';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { isOnboarded } = useUserStore();
  const { currentTab, showLevelUpModal, newLevel, hideLevelUp } = useUIStore();

  useEffect(() => {
    if (!isOnboarded) setShowOnboarding(true);
    audio.init();
  }, [isOnboarded]);

  const renderScreen = () => {
    switch (currentTab) {
      case 'accueil': return <Accueil />;
      case 'parler': return <Parler />;
      case 'jouer': return <Jouer />;
      case 'techniques': return <Techniques />;
      case 'progresser': return <Progresser />;
      default: return <Accueil />;
    }
  };

  if (showOnboarding) {
    return (
      <div className="app-container">
        <div className="fixed inset-0 aurora-gradient" />
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="fixed inset-0 aurora-gradient" />
      <div className="screen-container ui-layer">
        <AnimatePresence mode="wait">
          <motion.div key={currentTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="min-h-full">
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>
      <TabBar />
      <LevelUpModal isOpen={showLevelUpModal} level={newLevel} onClose={hideLevelUp} />
    </div>
  );
}
