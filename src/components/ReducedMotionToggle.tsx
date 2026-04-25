import { motion } from 'framer-motion';

interface ReducedMotionToggleProps {
  reducedMotion: boolean;
  onToggle: () => void;
}

export const ReducedMotionToggle: React.FC<ReducedMotionToggleProps> = ({
  reducedMotion,
  onToggle,
}) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      onClick={onToggle}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1000,
        padding: '12px 20px',
        fontSize: '13px',
        fontWeight: '500',
        color: '#fff',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '25px',
        cursor: 'pointer',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span style={{ fontSize: '16px' }}>{reducedMotion ? '🐢' : '⚡'}</span>
      {reducedMotion ? 'Reduced Motion' : 'Full Motion'}
    </motion.button>
  );
};
