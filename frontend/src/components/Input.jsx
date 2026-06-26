import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className = '', containerClass = '', ...props },
  ref
) {
  return (
    <div className={`space-y-1.5 ${containerClass}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-lg bg-white/5 border border-white/10
            px-4 py-2.5 text-slate-200 placeholder:text-slate-500
            focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30
            transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-danger/50 focus:border-danger/50 focus:ring-danger/30' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Input;
