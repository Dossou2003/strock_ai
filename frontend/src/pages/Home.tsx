/**
 * Page d'accueil avec design glassmorphique premium.
 * Style Apple-like avec animations 3D et micro-interactions.
 */

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import authService from '../services/auth.service';

export default function Home() {
  const isAuthenticated = authService.isAuthenticated();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: '🧠',
      title: 'IA Avancée',
      description: 'U-Net pour la segmentation, GLCM/GLRLM pour l\'analyse de texture, et ensemble ML (SVM + XGBoost + AdaBoost) pour une détection précise.',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: '⚡',
      title: 'Ultra Rapide',
      description: 'Analyse complète en moins de 10 secondes. Détection de l\'effacement des sillons corticaux en temps réel.',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: '🔬',
      title: 'Visualisation 3D',
      description: 'Visualisez la segmentation des territoires vasculaires en 3D avec comparaison hémisphérique interactive.',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      icon: '💬',
      title: 'Assistant IA',
      description: 'Chatbot médical intelligent pour expliquer les résultats et répondre à vos questions sur l\'AVC.',
      gradient: 'from-emerald-500 to-teal-600',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload du Scan CT',
      description: 'Téléchargez votre image CT cérébrale. Formats JPG, PNG et DICOM acceptés.',
      icon: '📤',
    },
    {
      number: '02',
      title: 'Analyse IA',
      description: 'Segmentation U-Net, extraction de 20 features radiomiques, calcul d\'asymétrie hémisphérique.',
      icon: '🔬',
    },
    {
      number: '03',
      title: 'Résultats Détaillés',
      description: 'Diagnostic avec probabilité, territoire affecté, visualisations 3D et explications IA.',
      icon: '📊',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background global */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-violet-950/50 to-black" />
        
        {/* Animated orbs */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)',
            top: '-400px',
            right: '-200px',
            animation: 'float 15s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.6) 0%, transparent 70%)',
            bottom: '-200px',
            left: '-100px',
            animation: 'float 20s ease-in-out infinite reverse',
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 70%)',
            top: '50%',
            left: '30%',
            animation: 'pulse 10s ease-in-out infinite',
          }}
        />

        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div 
            className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
              style={{
                background: 'rgba(139,92,246,0.2)',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80">Propulsé par l'Intelligence Artificielle</span>
            </div>

            {/* Main title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1]">
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 50%, rgba(139,92,246,0.8) 100%)',
                }}
              >
                Détection d'AVC
              </span>
              <br />
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgba(139,92,246,1) 0%, rgba(236,72,153,1) 50%, rgba(59,130,246,1) 100%)',
                }}
              >
                par IA
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Analyse rapide et précise des scans CT cérébraux. 
              Segmentation U-Net, analyse radiomique et classification par ensemble ML.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/analysis"
                  className="group relative px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    boxShadow: '0 20px 40px -10px rgba(139,92,246,0.5)',
                  }}
                >
                  <span className="flex items-center justify-center gap-3">
                    🔬 Commencer une Analyse
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group relative px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      boxShadow: '0 20px 40px -10px rgba(139,92,246,0.5)',
                    }}
                  >
                    <span className="flex items-center justify-center gap-3">
                      Créer un Compte
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 rounded-2xl text-lg font-semibold border border-white/20 hover:bg-white/10 transition-all duration-300"
                  >
                    Se Connecter
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20">
              {[
                { value: '< 10s', label: 'Temps d\'analyse' },
                { value: '95%+', label: 'Précision' },
                { value: '20', label: 'Features radiomiques' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div 
                    className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent mb-2"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 
              className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
              }}
            >
              Pourquoi Stroke AI ?
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Une plateforme complète pour la détection précoce des AVC ischémiques
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="group relative p-8 rounded-3xl transition-all duration-500 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {/* Glow on hover */}
                <div 
                  className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
                  style={{
                    background: `linear-gradient(135deg, ${feature.gradient.includes('violet') ? 'rgba(139,92,246,0.2)' : feature.gradient.includes('amber') ? 'rgba(245,158,11,0.2)' : feature.gradient.includes('cyan') ? 'rgba(6,182,212,0.2)' : 'rgba(16,185,129,0.2)'} 0%, transparent 100%)`,
                  }}
                />
                
                <div className="relative">
                  <div 
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-gradient-to-br ${feature.gradient}`}
                    style={{
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/50 leading-relaxed text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 
              className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
              }}
            >
              Comment ça marche ?
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Un processus simple en 3 étapes pour obtenir un diagnostic précis
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div 
                key={i}
                className="relative flex items-start gap-8 mb-12 last:mb-0"
              >
                {/* Line connector */}
                {i < steps.length - 1 && (
                  <div 
                    className="absolute left-10 top-24 w-0.5 h-20"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(139,92,246,0.5), transparent)',
                    }}
                  />
                )}
                
                {/* Number */}
                <div 
                  className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.2) 100%)',
                    border: '1px solid rgba(139,92,246,0.3)',
                  }}
                >
                  <span className="text-3xl">{step.icon}</span>
                </div>

                {/* Content */}
                <div 
                  className="flex-1 p-8 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-violet-400 font-mono text-sm">{step.number}</span>
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  </div>
                  <p className="text-white/50 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="container mx-auto px-4">
          <div 
            className="relative max-w-4xl mx-auto p-12 md:p-20 rounded-[3rem] text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.2) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Background glow */}
            <div 
              className="absolute inset-0 opacity-50"
              style={{
                background: 'radial-gradient(circle at center, rgba(139,92,246,0.3) 0%, transparent 70%)',
              }}
            />

            <div className="relative">
              <h2 
                className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                }}
              >
                Prêt à commencer ?
              </h2>
              <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
                Rejoignez les professionnels de santé qui utilisent Stroke AI pour une détection précoce des AVC.
              </p>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    boxShadow: '0 20px 40px -10px rgba(139,92,246,0.5)',
                  }}
                >
                  Créer un Compte Gratuit
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  }}
                >
                  <span className="text-xl">🧠</span>
                </div>
                <span className="text-xl font-bold text-white">Stroke AI</span>
              </div>
              <p className="text-white/40 max-w-md leading-relaxed">
                Plateforme de détection d'AVC par intelligence artificielle. 
                Analyse de scans CT cérébraux avec segmentation U-Net et classification par ensemble ML.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <ul className="space-y-3 text-white/40">
                <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
                <li><Link to="/resources" className="hover:text-white transition-colors">Ressources</Link></li>
                <li><Link to="/professional" className="hover:text-white transition-colors">Espace Pro</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-white/40 text-sm leading-relaxed">
                Pour toute question médicale, consultez un professionnel de santé qualifié.
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/30 text-sm">
            <p>© 2025 Stroke AI. Tous droits réservés. Projet de mémoire - Armel DAHOUI</p>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-40px) rotate(3deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
