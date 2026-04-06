import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Sparkles, LogOut, User, Shield } from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/sorteos', label: 'Sorteos' },
    { to: '/suenos', label: 'Sueños' },
    { to: '/chat', label: 'Aurum IA' },
    { to: '/suscripcion', label: 'Premium' },
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gold-400/30 bg-[#0d0d0d]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <Sparkles className="w-6 h-6 text-gold-400 group-hover:text-gold-300 transition-colors" />
              <span className="font-cinzel text-xl gold-text font-bold tracking-wider">AURUM</span>
              <span className="text-gold-400 text-sm font-light tracking-widest hidden sm:block opacity-75">NÚMEROS</span>
            </Link>

            {/* Links — solo desktop */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-md text-sm font-medium tracking-wide transition-all
                    ${isActive(link.to)
                      ? 'text-gold-300 bg-gold-800/40 border border-gold-400/35'
                      : 'text-gold-200 hover:text-gold-300 hover:bg-gold-800/25'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth — desktop */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  {user.isAdmin && (
                    <Link to="/admin" className="flex items-center gap-1 text-gold-400 hover:text-gold-300 text-sm">
                      <Shield className="w-4 h-4" />
                    </Link>
                  )}
                  <div className="flex items-center gap-2 text-gold-200 text-sm">
                    <User className="w-4 h-4 text-gold-400" />
                    <span>{user.name || user.username}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 text-gold-400 hover:text-gold-300 text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setAuthOpen(true)} className="btn-gold text-sm py-2 px-4">
                  Ingresar
                </button>
              )}
            </div>

            {/* Hamburger — solo móvil */}
            <button
              className="md:hidden text-gold-400 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Menú móvil desplegable */}
          {menuOpen && (
            <div className="md:hidden border-t border-gold-400/30 py-2">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center px-4 py-3.5 text-base font-medium transition-all min-h-[52px]
                    ${isActive(link.to)
                      ? 'text-gold-300 bg-gold-800/35 border-l-2 border-gold-400'
                      : 'text-gold-200 hover:text-gold-300 hover:bg-gold-800/20 border-l-2 border-transparent'
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="px-4 pt-3 pb-2 border-t border-gold-400/25 mt-1">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gold-200">
                      <User className="w-4 h-4 text-gold-400" />
                      <span className="text-sm">{user.name || user.username}</span>
                      {user.isAdmin && (
                        <Link to="/admin" onClick={() => setMenuOpen(false)}>
                          <Shield className="w-4 h-4 text-gold-400" />
                        </Link>
                      )}
                    </div>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="flex items-center gap-1.5 text-gold-400 hover:text-gold-300 text-sm py-2 px-3 min-h-[44px]"
                    >
                      <LogOut className="w-4 h-4" />Salir
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAuthOpen(true); setMenuOpen(false); }}
                    className="btn-gold w-full text-base"
                  >
                    Ingresar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
