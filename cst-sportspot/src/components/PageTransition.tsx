import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  isPresent?: boolean;
  key?: string;
}

export default function PageTransition({ children, isPresent = true, key = 'page' }: PageTransitionProps) {
  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      rotateY: -10,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      rotateY: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      rotateY: 10,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isPresent && (
        <motion.div
          key={key}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          style={{ 
            perspective: "1200px", 
            transformStyle: "preserve-3d",
            width: "100%",
            height: "100%"
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
