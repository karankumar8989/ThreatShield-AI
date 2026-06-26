import { motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-bg cyber-grid flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary to-secondary mb-4">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">ThreatShield AI</h1>
          <p className="text-sm text-slate-400 mt-2">Enterprise Cyber Security Platform</p>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8 shadow-2xl">
          {title && <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>}
          {subtitle && <p className="text-sm text-slate-400 mb-6">{subtitle}</p>}
          {children}
        </div>
      </motion.div>
    </div>
  );
}
