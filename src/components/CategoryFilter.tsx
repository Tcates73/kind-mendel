import { motion } from 'framer-motion';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  reducedMotion: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  reducedMotion,
}) => {
  const allCategories = ['All', ...categories];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0.1 : 0.5 }}
      style={{
        position: 'fixed',
        top: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        gap: '12px',
        padding: '16px 24px',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {allCategories.map((category) => {
        const isActive = category === 'All' ? activeCategory === null : activeCategory === category;

        return (
          <motion.button
            key={category}
            onClick={() => onCategoryChange(category === 'All' ? null : category)}
            whileHover={reducedMotion ? {} : { scale: 1.05 }}
            whileTap={reducedMotion ? {} : { scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: isActive ? '#000' : '#fff',
              background: isActive ? '#fff' : 'transparent',
              border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '25px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {category}
          </motion.button>
        );
      })}
    </motion.div>
  );
};
