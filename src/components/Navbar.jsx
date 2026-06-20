import { FiMenu, FiBell, FiSun, FiMoon, FiDownload } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onToggleSidebar }) {
  const { user, isMock, theme, toggleTheme, deferredPrompt, installApp } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-coffee-900/80 backdrop-blur-lg border-b border-white/5 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-coffee-200">
            <FiMenu size={20} />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white font-[Outfit]">
              {user?.role === 'owner' ? 'Owner Dashboard' : user?.role === 'admin' ? 'Admin Dashboard' : 'Kasir POS'}
            </h2>
            <p className="text-[11px] text-coffee-400">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isMock && (
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/20">
              Demo Mode
            </span>
          )}

          {/* PWA Install Button */}
          {deferredPrompt && (
            <button 
              onClick={installApp} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-accent cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md"
              title="Pasang Aplikasi CoffeeSync"
            >
              <FiDownload size={14} />
              <span>Pasang App</span>
            </button>
          )}
          
          {/* Theme Switcher */}
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white/10 text-coffee-300" title="Ganti Tema">
            {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>

          <button className="relative p-2 rounded-lg hover:bg-white/10 text-coffee-300">
            <FiBell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
            {user?.nama?.[0] || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}

