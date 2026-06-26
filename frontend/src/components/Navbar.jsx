import { FiMenu, FiBell } from 'react-icons/fi';
import ProfileMenu from './ProfileMenu';

export default function Navbar({ onMenuClick, title }) {
  return (
    <header className="sticky top-0 z-20 glass border-b border-white/5">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          {title && (
            <h2 className="text-lg font-semibold text-white hidden sm:block">{title}</h2>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
          </button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
