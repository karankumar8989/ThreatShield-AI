import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, boxShadow: '0 8px 30px rgba(59, 130, 246, 0.12)' } : {}}
      className={`glass rounded-xl p-5 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
