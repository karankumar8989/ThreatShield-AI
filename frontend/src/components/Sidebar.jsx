import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiShield, FiMail, FiLink, FiBarChart2, FiFileText,
  FiSettings, FiLogOut, FiX, FiShield as FiLogo,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { SIDEBAR_LINKS } from '../utils/constants';

const iconMap = {
  FiGrid, FiShield, FiMail, FiLink, FiBarChart2, FiFileText, FiSettings,
};

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navContent = (
    <>
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/5">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
          <FiLogo className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold gradient-text">ThreatShield</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">AI Security</p>
        </div>
        <button onClick={onClose} className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-white/10 cursor-pointer">
          <FiX className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {SIDEBAR_LINKS.map(({ path, label, icon }) => {
          const Icon = iconMap[icon];
          return (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}`
              }
            >
              {Icon && <Icon className="w-5 h-5 shrink-0" />}
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-colors cursor-pointer"
        >
          <FiLogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 glass border-r border-white/5 z-30">
        {navContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 flex flex-col glass border-r border-white/5 z-50 lg:hidden"
            >
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
