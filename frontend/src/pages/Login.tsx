/**
 * Page de connexion avec design premium Apple-like.
 * Animations 3D, glassmorphisme et micro-interactions.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.login({ username: email, password });
      navigate('/analysis');
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.response?.data) {
        const data = err.response.data;
        if (data.detail) {
          setError(data.detail);
        } else if (data.non_field_errors) {
          setError(data.non_field_errors[0]);
        } else if (typeof data === 'object') {
          const messages = Object.values(data).flat().join(' | ');
          setError(messages || 'Identifiants invalides');
        } else {
          setError('Erreur lors de la connexion');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Identifiants invalides');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-900 to-black" />
        
        {/* Animated orbs */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.8) 0%, transparent 70%)',
            top: '-200px',
            right: '-100px',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.8) 0%, transparent 70%)',
            bottom: '-150px',
            left: '-100px',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 6s ease-in-out infinite',
          }}
        />

        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Main card with 3D effect */}
      <div 
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{
          perspective: '1000px',
        }}
      >
        <div 
          className="relative group"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Glow effect behind card */}
          <div 
            className="absolute -inset-1 rounded-[2.5rem] opacity-75 blur-2xl transition-all duration-500 group-hover:opacity-100"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(236,72,153,0.4), rgba(59,130,246,0.4))',
            }}
          />

          {/* Glass card */}
          <div 
            className="relative backdrop-blur-2xl rounded-[2rem] border border-white/10 p-10 shadow-2xl transition-all duration-500 group-hover:border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.1) inset,
                0 25px 50px -12px rgba(0,0,0,0.5),
                0 0 100px rgba(139,92,246,0.1)
              `,
            }}
          >
            {/* Logo with 3D rotation */}
            <div className="text-center mb-10">
              <div 
                className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 transition-transform duration-500 hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #3B82F6 100%)',
                  boxShadow: '0 20px 40px -10px rgba(139,92,246,0.5)',
                  animation: 'glow 3s ease-in-out infinite alternate',
                }}
              >
                <span className="text-5xl filter drop-shadow-lg">🧠</span>
              </div>
              <h1 
                className="text-4xl font-bold bg-clip-text text-transparent mb-3"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                }}
              >
                Stroke AI
              </h1>
              <p className="text-white/50 text-lg font-light tracking-wide">
                Bienvenue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div 
                  className="px-5 py-4 rounded-2xl text-sm font-medium animate-shake"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#FCA5A5',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span>⚠️</span>
                    {error}
                  </span>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <label className="block text-white/70 text-sm font-medium ml-1">
                  Email
                </label>
                <div 
                  className={`relative rounded-2xl transition-all duration-300 ${
                    focusedField === 'email' ? 'ring-2 ring-violet-500/50' : ''
                  }`}
                  style={{
                    background: focusedField === 'email' 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full px-5 py-4 bg-transparent border-0 rounded-2xl text-white placeholder-white/30 focus:outline-none text-lg"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label className="block text-white/70 text-sm font-medium ml-1">
                  Mot de passe
                </label>
                <div 
                  className={`relative rounded-2xl transition-all duration-300 ${
                    focusedField === 'password' ? 'ring-2 ring-violet-500/50' : ''
                  }`}
                  style={{
                    background: focusedField === 'password' 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full px-5 py-4 bg-transparent border-0 rounded-2xl text-white placeholder-white/30 focus:outline-none text-lg"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center text-white/50 cursor-pointer hover:text-white/70 transition-colors">
                  <div className="relative mr-3">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-5 h-5 rounded-md border border-white/20 peer-checked:bg-violet-500 peer-checked:border-violet-500 transition-all" />
                    <svg className="absolute top-1 left-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  Se souvenir de moi
                </label>
                <a href="#" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-4 px-6 rounded-2xl text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-8"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  boxShadow: '0 10px 40px -10px rgba(139,92,246,0.5)',
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Connexion...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-white/30 text-sm" style={{ background: 'rgba(15,15,20,0.5)' }}>
                  ou
                </span>
              </div>
            </div>

            {/* Register link */}
            <p className="text-center text-white/50">
              Pas encore de compte ?{' '}
              <Link 
                to="/register" 
                className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-sm mt-10 font-light">
          © 2025 Stroke AI. Détection d'AVC par Intelligence Artificielle.
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.25; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.35; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes glow {
          0% { box-shadow: 0 20px 40px -10px rgba(139,92,246,0.5); }
          100% { box-shadow: 0 20px 60px -10px rgba(236,72,153,0.6); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
