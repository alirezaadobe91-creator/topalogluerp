import { motion } from 'motion/react';
import { clsx } from 'clsx';

export const ProgressBar = ({ progress }: { progress: number }) => {
  const getColor = () => {
    if (progress < 40) return 'bg-blue-500';
    if (progress < 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={clsx('h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]', getColor())}
      />
    </div>
  );
};
