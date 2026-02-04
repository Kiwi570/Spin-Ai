export type CrystalType = 'clarte' | 'impact' | 'calme' | 'repartie';
export type TechniqueFamily = 'voix' | 'structure' | 'impact' | 'pression' | 'situation';

export interface Technique {
  id: string; name: string; family: TechniqueFamily; emoji: string;
  when: string; why: string; how: string[];
  actionPrompt: string; actionDuration: number; crystalType: CrystalType;
}

export const CRYSTAL_CONFIG: Record<CrystalType, { name: string; emoji: string; color: string }> = {
  clarte: { name: 'Clarté', emoji: '💙', color: '#3B82F6' },
  impact: { name: 'Impact', emoji: '🧡', color: '#F59E0B' },
  calme: { name: 'Calme', emoji: '💚', color: '#10B981' },
  repartie: { name: 'Répartie', emoji: '💜', color: '#8B5CF6' },
};

export const TECHNIQUE_FAMILIES: Record<TechniqueFamily, { label: string; emoji: string }> = {
  voix: { label: 'Voix & Rythme', emoji: '🎵' },
  structure: { label: 'Structure', emoji: '📐' },
  impact: { label: 'Impact', emoji: '👑' },
  pression: { label: 'Pression', emoji: '🧘' },
  situation: { label: 'Situations', emoji: '🎭' },
};

export const TECHNIQUES: Technique[] = [
  { id: 'silence', name: 'Le silence stratégique', family: 'voix', emoji: '🤫', when: 'En début de prise de parole', why: 'Crée attention et suspense', how: ['Marque 1s de silence', 'Pose ton regard', 'Phrase courte'], actionPrompt: 'Commence par 2s de silence puis une phrase.', actionDuration: 30, crystalType: 'clarte' },
  { id: 'escalier', name: 'Le rythme en escalier', family: 'voix', emoji: '📶', when: 'Discours monotone', why: 'Varier captive', how: ['Commence lentement', 'Accélère', 'Appuie les mots clés'], actionPrompt: 'Varie ton rythme: lent → normal → appuyé.', actionDuration: 30, crystalType: 'clarte' },
  { id: 'ancree', name: 'La phrase ancrée', family: 'voix', emoji: '⚓', when: 'Message important', why: 'Une phrase = une intention', how: ['Ralentis', 'Pose sur le mot clé', 'Micro-pause après'], actionPrompt: 'Dis une phrase en posant ta voix sur UN mot.', actionDuration: 30, crystalType: 'clarte' },
  { id: 'message', name: 'Le message clé', family: 'structure', emoji: '🎯', when: 'Risque de confusion', why: 'Une idée suffit', how: ['Identifie le message', 'Une phrase', 'Commence et termine par lui'], actionPrompt: 'Résume en UNE phrase de moins de 15 mots.', actionDuration: 30, crystalType: 'clarte' },
  { id: 'trois', name: 'La règle des 3', family: 'structure', emoji: '3️⃣', when: 'Argumentation', why: 'Le cerveau retient 3', how: ['3 points max', 'Annonce-les', 'Rappelle en conclusion'], actionPrompt: 'Présente un sujet en exactement 3 points.', actionDuration: 45, crystalType: 'clarte' },
  { id: 'pivot', name: 'La phrase pivot', family: 'structure', emoji: '🔄', when: 'Digression', why: 'Recentrer avec assurance', how: ['Identifie la dérive', 'Phrase de transition', "Reviens à l'essentiel"], actionPrompt: 'Parle 15s puis recentre avec "Ce qui compte..."', actionDuration: 30, crystalType: 'clarte' },
  { id: 'intention', name: "L'intention avant les mots", family: 'impact', emoji: '💡', when: "Manque d'impact", why: "L'intention colore le discours", how: ['Formule mentalement', 'Ressens-la', 'Laisse-la guider'], actionPrompt: 'Choisis une intention puis parle.', actionDuration: 30, crystalType: 'impact' },
  { id: 'regard', name: 'Le regard qui décide', family: 'impact', emoji: '👁️', when: 'Prise de position', why: "Le regard porte l'autorité", how: ['Choisis un point', 'Maintiens le regard', 'Finis en regardant'], actionPrompt: 'Dis une affirmation en maintenant ton regard.', actionDuration: 30, crystalType: 'impact' },
  { id: 'conclusion', name: 'La conclusion forte', family: 'impact', emoji: '🎬', when: "Fin d'intervention", why: 'La fin reste en mémoire', how: ['Phrase courte', 'Pas de justification', 'Silence final'], actionPrompt: 'Termine par une phrase courte puis STOP.', actionDuration: 30, crystalType: 'impact' },
  { id: 'respiration', name: "La respiration d'ancrage", family: 'pression', emoji: '🌬️', when: 'Stress', why: 'Le corps rassure la voix', how: ['Inspire 4s', 'Expire 6s', 'Recommence'], actionPrompt: 'Fais 2 respirations puis parle calmement.', actionDuration: 30, crystalType: 'calme' },
  { id: 'pause', name: 'La pause réflexe', family: 'pression', emoji: '⏸️', when: 'Question piège', why: 'Évite la réaction à chaud', how: ['Ne réponds pas tout de suite', '2-3 secondes', 'Puis réponds'], actionPrompt: 'Attends 3 secondes avant de répondre.', actionDuration: 30, crystalType: 'calme' },
  { id: 'ralenti', name: 'Le débit ralenti', family: 'pression', emoji: '🐢', when: 'Enjeu fort', why: 'Ralentir = crédibilité', how: ['Identifie ton stress', 'Réduis de 20%', 'Articule'], actionPrompt: 'Explique en parlant TRÈS lentement.', actionDuration: 30, crystalType: 'calme' },
  { id: 'miroir', name: 'La reformulation miroir', family: 'situation', emoji: '🪞', when: 'Objection', why: 'Comprendre désarme', how: ['Écoute', '"Si je comprends bien..."', 'Puis réponds'], actionPrompt: 'Reformule avant de répondre.', actionDuration: 45, crystalType: 'repartie' },
  { id: 'deuxtemps', name: 'La réponse en deux temps', family: 'situation', emoji: '1️⃣', when: 'Question complexe', why: 'Structurer = maîtrise', how: ['Identifie les parties', 'Annonce', 'Point par point'], actionPrompt: 'Réponds avec "D\'abord... Ensuite..."', actionDuration: 45, crystalType: 'repartie' },
  { id: 'reprise', name: 'La question de reprise', family: 'situation', emoji: '❓', when: 'Perte de contrôle', why: 'Poser une question reprend le lead', how: ['Identifie le flottement', 'Question simple', 'Reprends'], actionPrompt: 'Après 15s, reprends avec une question.', actionDuration: 30, crystalType: 'repartie' },
];

export function getTechniqueForMode(mode: 'parler' | 'jouer'): Technique {
  const families: TechniqueFamily[] = mode === 'parler' ? ['voix', 'structure', 'impact'] : ['pression', 'situation'];
  const filtered = TECHNIQUES.filter(t => families.includes(t.family));
  return filtered[Math.floor(Math.random() * filtered.length)];
}
