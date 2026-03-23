/**
 * Barre de navigation principale avec design glassmorphique premium.
 * Style Apple-like avec animations fluides et micro-interactions.
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import authService from '../services/auth.service';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Détecter le scroll pour changer l'apparence de la navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  // Ne pas afficher la navbar sur les pages login/register
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const navLinks = [
    { to: '/', label: 'Accueil', icon: '🏠' },
    ...(isAuthenticated ? [
      { to: '/analysis', label: 'Analyse', icon: '🔬' },
      { to: '/history', label: 'Historique', icon: '📊' },
      { to: '/resources', label: 'Ressources', icon: '📚' },
      ...(user?.role === 'doctor' || user?.role === 'admin' ? [
        { to: '/professional', label: 'Espace Pro', icon: '👨‍⚕️' }
      ] : [])
    ] : [])
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 print:hidden ${
        scrolled 
          ? 'py-2' 
          : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div 
          className={`relative rounded-2xl transition-all duration-500 ${
            scrolled 
              ? 'backdrop-blur-2xl bg-black/40 shadow-2xl border border-white/10' 
              : 'backdrop-blur-xl bg-white/5 border border-white/5'
          }`}
          style={{
            boxShadow: scrolled 
              ? '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset' 
              : 'none'
          }}
        >
          <div className="flex justify-between items-center h-16 px-6">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  boxShadow: '0 8px 20px -6px rgba(139,92,246,0.5)',
                }}
              >
                <span className="text-xl">🧠</span>
              </div>
              <span 
                className="text-xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                }}
              >
                Stroke AI
              </span>
            </Link>

            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    location.pathname === link.to
                      ? 'text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {location.pathname === link.to && (
                    <div 
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(236,72,153,0.3) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <span className="text-base">{link.icon}</span>
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                      }}
                    >
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                    <span className="text-white/80 text-sm font-medium">
                      {user?.first_name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all duration-300"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      boxShadow: '0 8px 20px -6px rgba(139,92,246,0.4)',
                    }}
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>

            {/* Bouton Menu Mobile */}
            <button
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Menu Mobile */}
          <div 
            className={`md:hidden overflow-hidden transition-all duration-500 ${
              isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 pb-4 space-y-2 border-t border-white/10 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    location.pathname === link.to
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
              
              <div className="border-t border-white/10 pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                        }}
                      >
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user?.first_name} {user?.last_name}</p>
                        <p className="text-white/50 text-sm">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full mt-2 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300 text-left font-medium"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all duration-300 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-3 rounded-xl text-white font-semibold text-center transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
