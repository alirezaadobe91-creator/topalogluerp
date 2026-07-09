import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { Theme } from '../types';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90"
      aria-label="Toggle Theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      >
        {theme === 'dark' ? (
          <Moon className="w-5 h-5 text-gold" />
        ) : (
          <Sun className="w-5 h-5 text-gold" />
        )}
      </motion.div>
    </button>
  );
};
