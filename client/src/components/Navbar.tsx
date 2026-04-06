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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gold-700/20 bg-dark-300/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <Sparkles className="w-6 h-6 text-gold-400 group-hover:text-gold-300 transition-colors" />
              <span className="font-cinzel text-xl gold-text font-bold tracking-wider">
                AURUM
              </span>
              <span className="text-gold-600/70 text-sm font-light tracking-widest hidden sm:block">NÚMEROS</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-md text-sm font-medium tracking-wide transition-all
                    ${isActive(link.to)
                      ? 'text-gold-400 bg-gold-900/30 border border-gold-700/30'
                      : 'text-gold-200/70 hover:text-gold-400 hover:bg-gold-900/20'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  {user.isAdmin && (
                    <Link to="/admin" className="flex items-center gap-1 text-gold-400/80 hover:text-gold-300 text-sm">
                      <Shield className="w-4 h-4" />
                    </Link>
                  )}
                  <div className="flex items-center gap-2 text-gold-200/70 text-sm">
                    <User className="w-4 h-4 text-gold-500" />
                    <span>{user.name || user.username}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 text-gold-600 hover:text-gold-400 text-sm transition-colors"
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

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gold-400 p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-gold-700/20 py-3 space-y-1">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2 rounded-md text-sm font-medium
                    ${isActive(link.to) ? 'text-gold-400 bg-gold-900/30' : 'text-gold-200/70'}`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <div className="pt-2 border-t border-gold-700/20 mt-2 px-4 flex items-center justify-between">
                  <span className="text-gold-200/70 text-sm">{user.name || user.username}</span>
                  <button onClick={logout} className="text-gold-600 hover:text-gold-400 text-sm">
                    Salir
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-gold-700/20 mt-2 px-4">
                  <button onClick={() => { setAuthOpen(true); setMenuOpen(false); }} className="btn-gold w-full text-sm">
                    Ingresar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
