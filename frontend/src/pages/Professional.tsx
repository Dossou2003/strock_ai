/**
 * Page Espace Professionnel avec design glassmorphique premium.
 * Fonctionnalités avancées pour les professionnels de santé.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Professional() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: '📊',
      title: 'Tableau de bord avancé',
      description: 'Visualisez les statistiques détaillées de vos analyses avec des graphiques interactifs.',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: '📁',
      title: 'Gestion des patients',
      description: 'Organisez et suivez les dossiers de vos patients avec un historique complet.',
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      icon: '📄',
      title: 'Rapports PDF',
      description: 'Générez des rapports professionnels détaillés pour vos patients.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: '🔗',
      title: 'Intégration PACS',
      description: 'Connectez-vous directement à votre système PACS pour importer les images.',
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-violet-950/50 to-black" />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)',
            top: '-200px',
            right: '-100px',
          }}
        />
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div 
          className={`text-center mb-16 transition-all duration-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
            style={{
              background: 'rgba(139,92,246,0.2)',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/80">Réservé aux professionnels de santé</span>
          </div>
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
            }}
          >
            Espace Professionnel
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Accédez à des fonctionnalités avancées pour optimiser votre pratique clinique
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, i) => (
            <div 
              key={i}
              className={`group relative p-8 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <div 
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-gradient-to-br ${feature.gradient}`}
                style={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-white/50 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div 
          className={`rounded-[2rem] p-12 text-center transition-all duration-1000 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.2) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div 
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            }}
          >
            <span className="text-4xl">🏥</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Bientôt disponible
          </h2>
          <p className="text-white/50 mb-8 max-w-xl mx-auto">
            L'espace professionnel est en cours de développement. 
            Inscrivez-vous pour être notifié de son lancement.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              boxShadow: '0 20px 40px -10px rgba(139,92,246,0.5)',
            }}
          >
            S'inscrire maintenant
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
