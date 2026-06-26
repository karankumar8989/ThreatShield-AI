import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25',
  secondary: 'bg-secondary hover:bg-secondary/90 text-white shadow-lg shadow-secondary/25',
  danger: 'bg-danger hover:bg-danger/90 text-white shadow-lg shadow-danger/25',
  ghost: 'bg-transparent hover:bg-white/5 text-slate-300 border border-white/10',
  outline: 'bg-transparent border border-primary/50 text-primary hover:bg-primary/10',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </motion.button>
  );
}
