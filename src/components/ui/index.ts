import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

// BUTTON
interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', children, loading, className = '', disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-display font-semibold transition-all duration-300 disabled:opacity-50 rounded-2xl';
  const variants = { primary: 'btn-primary text-white', ghost: 'btn-ghost text-white' };
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg' };
  return (
    <motion.button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} whileHover={!disabled ? { scale: 1.02 } : undefined} whileTap={!disabled ? { scale: 0.98 } : undefined} disabled={disabled || loading} {...props}>
      {loading ? <motion.div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> : children}
    </motion.button>
  );
}

// CARD
interface CardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  variant?: 'default' | 'gradient' | 'blue' | 'amber' | 'emerald' | 'purple' | 'rose';
  interactive?: boolean;
}

export function Card({ children, variant = 'default', interactive = false, className = '', ...props }: CardProps) {
  const variants: Record<string, string> = {
    default: 'glass-card', gradient: 'glass-gradient', blue: 'glass-blue', amber: 'glass-amber',
    emerald: 'glass-emerald', purple: 'glass-purple', rose: 'glass-rose',
  };
  return (
    <motion.div className={`p-5 ${variants[variant]} ${interactive ? 'cursor-pointer' : ''} ${className}`} whileHover={interactive ? { y: -4, scale: 1.01 } : undefined} whileTap={interactive ? { scale: 0.98 } : undefined} {...props}>
      {children}
    </motion.div>
  );
}

// BADGE
interface BadgeProps { children: ReactNode; variant?: 'default' | 'streak' | 'level'; icon?: ReactNode; }
export function Badge({ children, variant = 'default', icon }: BadgeProps) {
  const v: Record<string, string> = { default: 'bg-white/10 text-white/80', streak: 'badge-streak', level: 'badge-level' };
  return <span className={`badge ${v[variant]}`}>{icon}{children}</span>;
}

// PROGRESS BAR
interface ProgressBarProps { value: number; size?: 'sm' | 'md' | 'lg'; }
export function ProgressBar({ value, size = 'md' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const sizes = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  return (
    <div className={`progress-bar-track ${sizes[size]}`}>
      <motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
    </div>
  );
}

// TIMER
interface TimerProps { seconds: number; totalSeconds?: number; size?: 'sm' | 'md' | 'lg'; }
export function Timer({ seconds, totalSeconds, size = 'md' }: TimerProps) {
  const mins = Math.floor(Math.max(0, seconds) / 60), secs = Math.max(0, seconds) % 60;
  const urgent = seconds <= 10 && seconds > 0;
  const total = totalSeconds || Math.max(seconds, 1), pct = (Math.max(0, seconds) / total) * 100;
  const cfg = { sm: { s: 100, r: 35, st: 4, f: 'text-2xl' }, md: { s: 140, r: 50, st: 5, f: 'text-4xl' }, lg: { s: 180, r: 70, st: 6, f: 'text-6xl' } };
  const { s, r, st, f } = cfg[size];
  const circ = 2 * Math.PI * r, offset = circ - (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: s, height: s }}>
      <svg className="absolute transform -rotate-90" width={s} height={s}>
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={st} />
        <motion.circle cx={s/2} cy={s/2} r={r} fill="none" stroke={urgent ? '#EF4444' : 'url(#tg)'} strokeWidth={st} strokeLinecap="round" strokeDasharray={circ} animate={{ strokeDashoffset: offset }} />
        <defs><linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#EC4899"/></linearGradient></defs>
      </svg>
      <motion.span className={`timer-display ${f} ${urgent ? 'timer-urgent' : ''} font-display font-light`} animate={urgent ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.5, repeat: urgent ? Infinity : 0 }}>
        {mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : secs}
      </motion.span>
    </div>
  );
}

// FEEDBACK CARD
interface FeedbackCardProps { type: 'strength' | 'improvement'; icon: string; text: string; delay?: number; }
export function FeedbackCard({ type, icon, text, delay = 0 }: FeedbackCardProps) {
  return (
    <motion.div className={`feedback-card feedback-card-${type}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}>
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <p className="text-white/80 text-sm">{text}</p>
    </motion.div>
  );
}

// SCORE DISPLAY
interface ScoreDisplayProps { label: string; value: number; color?: 'blue' | 'amber' | 'emerald' | 'purple'; }
export function ScoreDisplay({ label, value, color = 'blue' }: ScoreDisplayProps) {
  const tc = { blue: 'text-blue-400', amber: 'text-amber-400', emerald: 'text-emerald-400', purple: 'text-purple-400' };
  const bg = { blue: 'from-blue-500/20 to-blue-500/5', amber: 'from-amber-500/20 to-amber-500/5', emerald: 'from-emerald-500/20 to-emerald-500/5', purple: 'from-purple-500/20 to-purple-500/5' };
  return (
    <motion.div className={`rounded-2xl p-4 text-center bg-gradient-to-b ${bg[color]} border border-white/10`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <motion.p className={`font-display text-3xl font-bold ${tc[color]}`}>{value}%</motion.p>
      <p className="text-white/50 text-xs mt-1">{label}</p>
    </motion.div>
  );
}
