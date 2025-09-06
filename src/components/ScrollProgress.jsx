import React from 'react';
import { motion } from 'framer-motion';
import { useScrollProgress } from '../utils/scrollAnimations';

const ScrollProgress = () => {
  const progress = useScrollProgress();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-surface/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: progress > 5 ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-accent to-accent/80 shadow-lg"
        style={{ width: `${progress}%` }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
      />
    </motion.div>
  );
};

export default ScrollProgress;
