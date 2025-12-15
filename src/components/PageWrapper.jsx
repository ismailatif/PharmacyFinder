import React from 'react';
import { motion } from 'framer-motion';

const PageWrapper = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(6px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(6px)' }}
      transition={{ 
        duration: 0.4, 
        ease: "easeOut" 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
