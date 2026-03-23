/**
 * Page d'inscription avec design premium Apple-like.
 * Animations 3D, glassmorphisme et micro-interactions.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'patient' as 'patient' | 'doctor',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      await authService.register({
        username: formData.email,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
      });
      navigate('/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.response?.data) {
        const data = err.response.data;
        // Gérer les erreurs de validation DRF
        if (typeof data === 'string') {
          setError(data);
        } else if (data.detail) {
          setError(data.detail);
        } else if (typeof data === 'object') {
          // Concaténer les erreurs de validation
          const errorParts = Object.entries(data)
            .map(([key, value]) => {
              const fieldName = key === 'username' ? 'Utilisateur' : 
                               key === 'email' ? 'Email' : 
                               key === 'password' ? 'Mot de passe' : 
                               key === 'password_confirm' ? 'Confirmation' : key;
              const val = Array.isArray(value) ? value[0] : JSON.stringify(value);
              return `${fieldName}: ${val}`;
            });
          
          if (errorParts.length > 0) {
            setError(errorParts.join(' | '));
          } else {
            setError('Données invalides : ' + JSON.stringify(data));
          }
        } else {
          setError('Erreur lors de l\'inscription : ' + JSON.stringify(data));
        }
      } else {
        setError(err instanceof Error ? err.message : 'Erreur réseau lors de l\'inscription');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && formData.firstName && formData.lastName && formData.email) {
      setStep(2);
    }
  };

  const prevStep = () => {
    if (step === 2) setStep(1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black py-12">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-violet-950/50 to-black" />
        
        {/* Animated orbs */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)',
            top: '-200px',
            left: '-100px',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.6) 0%, transparent 70%)',
            bottom: '-150px',
            right: '-100px',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(167,139,250,0.6) 0%, transparent 70%)',
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
        className={`relative z-10 w-full max-w-lg mx-4 transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ perspective: '1000px' }}
      >
        <div className="relative group" style={{ transformStyle: 'preserve-3d' }}>
          {/* Glow effect behind card */}
          <div 
            className="absolute -inset-1 rounded-[2.5rem] opacity-75 blur-2xl transition-all duration-500 group-hover:opacity-100"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(236,72,153,0.4))',
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
            <div className="text-center mb-8">
              <div 
                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 transition-transform duration-500 hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  boxShadow: '0 20px 40px -10px rgba(139,92,246,0.5)',
                  animation: 'glow 3s ease-in-out infinite alternate',
                }}
              >
                <span className="text-4xl filter drop-shadow-lg">🧠</span>
              </div>
              <h1 
                className="text-3xl font-bold bg-clip-text text-transparent mb-2"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                }}
              >
                Créer un compte
              </h1>
              <p className="text-white/50 text-base font-light">
                Rejoignez Stroke AI
              </p>

              {/* Progress indicator */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-violet-500 scale-110' : 'bg-white/20'}`} />
                <div className={`w-12 h-0.5 transition-all duration-300 ${step >= 2 ? 'bg-violet-500' : 'bg-white/20'}`} />
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-violet-500 scale-110' : 'bg-white/20'}`} />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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

              {/* Step 1: Personal Info */}
              <div className={`space-y-5 transition-all duration-500 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full absolute'}`}>
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-white/70 text-sm font-medium ml-1">Prénom</label>
                    <div 
                      className={`rounded-2xl transition-all duration-300 ${focusedField === 'firstName' ? 'ring-2 ring-violet-500/50' : ''}`}
                      style={{ background: focusedField === 'firstName' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}
                    >
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('firstName')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full px-4 py-3.5 bg-transparent border-0 rounded-2xl text-white placeholder-white/30 focus:outline-none"
                        placeholder="Jean"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-white/70 text-sm font-medium ml-1">Nom</label>
                    <div 
                      className={`rounded-2xl transition-all duration-300 ${focusedField === 'lastName' ? 'ring-2 ring-violet-500/50' : ''}`}
                      style={{ background: focusedField === 'lastName' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}
                    >
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full px-4 py-3.5 bg-transparent border-0 rounded-2xl text-white placeholder-white/30 focus:outline-none"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-white/70 text-sm font-medium ml-1">Email</label>
                  <div 
                    className={`rounded-2xl transition-all duration-300 ${focusedField === 'email' ? 'ring-2 ring-violet-500/50' : ''}`}
                    style={{ background: focusedField === 'email' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}
                  >
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full px-5 py-3.5 bg-transparent border-0 rounded-2xl text-white placeholder-white/30 focus:outline-none"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                {/* Role selection */}
                <div className="space-y-3">
                  <label className="block text-white/70 text-sm font-medium ml-1">Je suis</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'patient' })}
                      className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-300 ${
                        formData.role === 'patient' 
                          ? 'border-violet-500 bg-violet-500/20 scale-[1.02]' 
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-3xl">👤</span>
                      <span className="text-white font-medium">Patient</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'doctor' })}
                      className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-300 ${
                        formData.role === 'doctor' 
                          ? 'border-violet-500 bg-violet-500/20 scale-[1.02]' 
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-3xl">👨‍⚕️</span>
                      <span className="text-white font-medium">Médecin</span>
                    </button>
                  </div>
                </div>

                {/* Next button */}
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.firstName || !formData.lastName || !formData.email}
                  className="w-full py-4 px-6 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    boxShadow: '0 10px 40px -10px rgba(139,92,246,0.5)',
                  }}
                >
                  <span className="flex items-center justify-center gap-3">
                    Continuer
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>

              {/* Step 2: Password */}
              <div className={`space-y-5 transition-all duration-500 ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute'}`}>
                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-white/70 text-sm font-medium ml-1">Mot de passe</label>
                  <div 
                    className={`rounded-2xl transition-all duration-300 ${focusedField === 'password' ? 'ring-2 ring-violet-500/50' : ''}`}
                    style={{ background: focusedField === 'password' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}
                  >
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                      minLength={8}
                      className="w-full px-5 py-3.5 bg-transparent border-0 rounded-2xl text-white placeholder-white/30 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-white/40 text-xs ml-1">Minimum 8 caractères</p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-white/70 text-sm font-medium ml-1">Confirmer le mot de passe</label>
                  <div 
                    className={`rounded-2xl transition-all duration-300 ${focusedField === 'confirmPassword' ? 'ring-2 ring-violet-500/50' : ''}`}
                    style={{ background: focusedField === 'confirmPassword' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}
                  >
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full px-5 py-3.5 bg-transparent border-0 rounded-2xl text-white placeholder-white/30 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 text-white/50 text-sm cursor-pointer mt-4">
                  <div className="relative mt-0.5">
                    <input type="checkbox" required className="sr-only peer" />
                    <div className="w-5 h-5 rounded-md border border-white/20 peer-checked:bg-violet-500 peer-checked:border-violet-500 transition-all" />
                    <svg className="absolute top-1 left-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>
                    J'accepte les{' '}
                    <a href="#" className="text-violet-400 hover:text-violet-300">conditions d'utilisation</a>
                    {' '}et la{' '}
                    <a href="#" className="text-violet-400 hover:text-violet-300">politique de confidentialité</a>
                  </span>
                </label>

                {/* Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-4 px-6 rounded-2xl text-white font-semibold transition-all duration-300 hover:bg-white/10 border border-white/20"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-4 px-6 rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      boxShadow: '0 10px 40px -10px rgba(139,92,246,0.5)',
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Création...
                      </span>
                    ) : (
                      'Créer mon compte'
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Login link */}
            <p className="text-center text-white/50 mt-8">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                Se connecter
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
