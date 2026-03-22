/**
 * Page d'historique des analyses avec design glassmorphique premium.
 * Affiche la liste des analyses passées avec filtres et recherche.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import analysisService, { AnalysisListItem } from '../services/analysis.service';

export default function History() {
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'stroke' | 'normal'>('all');

  useEffect(() => {
    setMounted(true);
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setIsLoading(true);
      const data = await analysisService.getHistory();
      setAnalyses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'stroke') return a.has_stroke;
    return !a.has_stroke;
  });

  const getTerritoryLabel = (territory: string) => {
    const labels: Record<string, string> = {
      'none': 'Aucun',
      'ACM_g': 'ACM Gauche',
      'ACM_d': 'ACM Droite',
      'ACA': 'ACA',
      'ACP': 'ACP',
    };
    return labels[territory] || territory;
  };

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
          className={`flex flex-col md:flex-row md:items-center justify-between mb-8 transition-all duration-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div>
            <h1 
              className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
              }}
            >
              Historique des Analyses
            </h1>
            <p className="text-white/50">
              {analyses.length} analyse{analyses.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Link
            to="/analysis"
            className="mt-4 md:mt-0 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            }}
          >
            <span>+</span> Nouvelle Analyse
          </Link>
        </div>

        {/* Filters */}
        <div 
          className={`flex gap-3 mb-8 transition-all duration-1000 delay-100 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {[
            { key: 'all', label: 'Toutes', count: analyses.length },
            { key: 'stroke', label: 'AVC détecté', count: analyses.filter(a => a.has_stroke).length },
            { key: 'normal', label: 'Normal', count: analyses.filter(a => !a.has_stroke).length },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                filter === f.key 
                  ? 'text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              style={{
                background: filter === f.key 
                  ? 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(236,72,153,0.3) 100%)'
                  : 'rgba(255,255,255,0.05)',
                border: filter === f.key ? '1px solid rgba(139,92,246,0.5)' : '1px solid transparent',
              }}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              <span className="text-3xl">🧠</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div 
            className="rounded-2xl p-6 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchAnalyses}
              className="mt-4 px-6 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredAnalyses.length === 0 && (
          <div 
            className={`rounded-[2rem] p-12 text-center transition-all duration-1000 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div 
              className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.2) 100%)',
              }}
            >
              <span className="text-5xl">📋</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Aucune analyse</h3>
            <p className="text-white/50 mb-6">
              {filter === 'all' 
                ? 'Vous n\'avez pas encore effectué d\'analyse.'
                : `Aucune analyse avec ce filtre.`
              }
            </p>
            <Link
              to="/analysis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              }}
            >
              Commencer une analyse
            </Link>
          </div>
        )}

        {/* Analyses List */}
        {!isLoading && !error && filteredAnalyses.length > 0 && (
          <div 
            className={`space-y-4 transition-all duration-1000 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {filteredAnalyses.map((analysis, index) => {
              const hasStroke = analysis.has_stroke;
              const probability = analysis.probability ? Math.round(analysis.probability * 100) : 0;
              
              return (
                <Link
                  key={analysis.id}
                  to={`/results/${analysis.id}`}
                  className="block rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex items-center gap-6">
                    {/* Status Icon */}
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: hasStroke 
                          ? 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.1) 100%)',
                        border: `1px solid ${hasStroke ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                      }}
                    >
                      <span className="text-3xl">{hasStroke ? '⚠️' : '✓'}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-lg font-bold ${hasStroke ? 'text-red-400' : 'text-emerald-400'}`}>
                          {hasStroke ? 'AVC Détecté' : 'Normal'}
                        </h3>
                        {hasStroke && analysis.affected_territory && (
                          <span 
                            className="px-2 py-0.5 rounded-lg text-xs font-medium"
                            style={{ background: 'rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.9)' }}
                          >
                            {getTerritoryLabel(analysis.affected_territory)}
                          </span>
                        )}
                      </div>
                      <p className="text-white/50 text-sm">
                        {new Date(analysis.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Probability */}
                    <div className="text-right flex-shrink-0">
                      <div 
                        className={`text-2xl font-bold ${hasStroke ? 'text-red-400' : 'text-emerald-400'}`}
                      >
                        {probability}%
                      </div>
                      <div className="text-white/40 text-xs">Probabilité</div>
                    </div>

                    {/* Arrow */}
                    <div className="text-white/30 group-hover:text-white/60 transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(139,92,246,0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(236,72,153,0.5); }
        }
      `}</style>
    </div>
  );
}
