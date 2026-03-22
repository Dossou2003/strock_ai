/**
 * Page de résultats avec design glassmorphique premium.
 * Affichage des résultats d'analyse avec visualisation 3D de la segmentation.
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import analysisService, { Analysis } from '../services/analysis.service';
import CTScan3D from '../components/CTScan3D';
import ImageZoomModal from '../components/ImageZoomModal';

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<'2d' | '3d'>('2d');
  const [rotationX, setRotationX] = useState(15);
  const [rotationY, setRotationY] = useState(-15);
  const [zoomModal, setZoomModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    description: string;
  }>({ isOpen: false, imageUrl: '', title: '', description: '' });

  const openZoomModal = (imageUrl: string, title: string, description: string) => {
    setZoomModal({ isOpen: true, imageUrl, title, description });
  };

  const closeZoomModal = () => {
    setZoomModal({ isOpen: false, imageUrl: '', title: '', description: '' });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await analysisService.getAnalysis(id);
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  // Animation 3D automatique
  useEffect(() => {
    if (activeView === '3d') {
      const interval = setInterval(() => {
        setRotationY(prev => prev + 0.5);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [activeView]);

  const getTerritoryLabel = (territory: string) => {
    const labels: Record<string, string> = {
      'none': 'Aucun',
      'ACM_g': 'Artère Cérébrale Moyenne Gauche',
      'ACM_d': 'Artère Cérébrale Moyenne Droite',
      'ACA': 'Artère Cérébrale Antérieure',
      'ACP': 'Artère Cérébrale Postérieure',
    };
    return labels[territory] || territory;
  };

  const getTerritoryColor = (territory: string) => {
    const colors: Record<string, string> = {
      'ACM_g': '#EC4899',
      'ACM_d': '#8B5CF6',
      'ACA': '#10B981',
      'ACP': '#F59E0B',
    };
    return colors[territory] || '#6B7280';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <span className="text-5xl">🧠</span>
          </div>
          <p className="text-white/60">Chargement des résultats...</p>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(139,92,246,0.4); }
            50% { transform: scale(1.05); box-shadow: 0 0 80px rgba(236,72,153,0.5); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.1) 100%)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <span className="text-5xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Erreur</h2>
          <p className="text-white/50 mb-8">{error || 'Analyse introuvable'}</p>
          <Link
            to="/analysis"
            className="px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            }}
          >
            Nouvelle Analyse
          </Link>
        </div>
      </div>
    );
  }

  // Pending state
  if (!analysis.result) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.1) 100%)',
              border: '1px solid rgba(245,158,11,0.3)',
            }}
          >
            <span className="text-5xl animate-pulse">⏳</span>
          </div>
          <h2 className="text-2xl font-bold text-amber-400 mb-4">Analyse en cours</h2>
          <p className="text-white/50">Les résultats seront disponibles bientôt...</p>
        </div>
      </div>
    );
  }

  const result = analysis.result;
  const hasStroke = result.has_stroke;
  const probability = Math.round(result.probability * 100);

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-violet-950/50 to-black" />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: hasStroke 
              ? 'radial-gradient(circle, rgba(239,68,68,0.6) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, transparent 70%)',
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

      <div className="relative z-10 max-w-7xl mx-auto px-4">
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
              Résultats de l'Analyse
            </h1>
            <p className="text-white/50">
              ID: {analysis.id.slice(0, 8)}... • {new Date(analysis.created_at).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link
              to="/analysis"
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              }}
            >
              Nouvelle Analyse
            </Link>
            <Link
              to="/history"
              className="px-6 py-3 rounded-xl font-semibold border border-white/20 hover:bg-white/10 transition-all duration-300"
            >
              Historique
            </Link>
          </div>
        </div>

        {/* Main Result Card */}
        <div 
          className={`rounded-[2rem] p-8 mb-8 transition-all duration-1000 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{
            background: hasStroke 
              ? 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)'
              : 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)',
            border: `1px solid ${hasStroke ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Status Icon */}
            <div 
              className="w-32 h-32 rounded-3xl flex items-center justify-center flex-shrink-0"
              style={{
                background: hasStroke 
                  ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: hasStroke 
                  ? '0 0 60px rgba(239,68,68,0.4)'
                  : '0 0 60px rgba(16,185,129,0.4)',
              }}
            >
              <span className="text-6xl">{hasStroke ? '⚠️' : '✓'}</span>
            </div>

            {/* Result Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 
                className={`text-3xl md:text-4xl font-bold mb-2 ${hasStroke ? 'text-red-400' : 'text-emerald-400'}`}
              >
                {hasStroke ? 'AVC Détecté' : 'Aucun AVC Détecté'}
              </h2>
              <p className="text-white/60 text-lg mb-4">
                {hasStroke 
                  ? `Territoire affecté: ${getTerritoryLabel(result.affected_territory)}`
                  : 'Aucune anomalie détectée dans les territoires vasculaires'
                }
              </p>
              
              {/* Probability Gauge */}
              <div className="max-w-md">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/50">Probabilité</span>
                  <span className={`font-bold ${hasStroke ? 'text-red-400' : 'text-emerald-400'}`}>
                    {probability}%
                  </span>
                </div>
                <div 
                  className="h-3 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${probability}%`,
                      background: hasStroke 
                        ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)'
                        : 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Image Viewer */}
          <div 
            className={`rounded-[2rem] p-6 transition-all duration-1000 delay-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Visualisation</h3>
              <div className="flex rounded-xl overflow-hidden border border-white/10">
                <button
                  onClick={() => setActiveView('2d')}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    activeView === '2d' 
                      ? 'bg-violet-500 text-white' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  2D
                </button>
                <button
                  onClick={() => setActiveView('3d')}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    activeView === '3d' 
                      ? 'bg-violet-500 text-white' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  3D
                </button>
              </div>
            </div>

            {/* 2D View */}
            {activeView === '2d' && (
              <div className="grid grid-cols-2 gap-4">
                {/* Original CT */}
                <div 
                  className="relative rounded-xl overflow-hidden aspect-square bg-black/50 cursor-pointer hover:ring-2 hover:ring-violet-400/50 transition-all"
                  onClick={() => analysis.ct_image && openZoomModal(
                    analysis.ct_image,
                    'CT Original',
                    'Image scanner CT brute sans traitement'
                  )}
                >
                  {analysis.ct_image && (
                    <img 
                      src={analysis.ct_image} 
                      alt="CT Original" 
                      className="w-full h-full object-contain"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-xs text-white/80">CT Original</span>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <span className="text-[10px] text-white/60">🔍 Cliquer pour zoomer</span>
                  </div>
                </div>

                {/* Segmentation */}
                <div 
                  className="relative rounded-xl overflow-hidden aspect-square bg-black/50 cursor-pointer hover:ring-2 hover:ring-violet-400/50 transition-all"
                  onClick={() => result.segmentation_image && openZoomModal(
                    result.segmentation_image,
                    'Segmentation U-Net',
                    'Territoires vasculaires détectés sur votre scan CT'
                  )}
                >
                  {result.segmentation_image ? (
                    <img 
                      src={result.segmentation_image} 
                      alt="Segmentation" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30">
                      Segmentation non disponible
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                    <div className="text-xs text-white/90 font-semibold">Segmentation U-Net</div>
                    <div className="text-[10px] text-white/60 mt-0.5">Territoires vasculaires détectés sur votre scan CT</div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <span className="text-[10px] text-white/60">🔍 Cliquer pour zoomer</span>
                  </div>
                </div>

                {/* Masque de segmentation */}
                <div 
                  className="relative rounded-xl overflow-hidden aspect-square bg-black/50 cursor-pointer hover:ring-2 hover:ring-violet-400/50 transition-all"
                  onClick={() => result.heatmap_image && openZoomModal(
                    result.heatmap_image,
                    'Masque de segmentation pur',
                    'Classes prédites par le modèle U-Net (ACA, ACM_g, ACM_d, ACP)'
                  )}
                >
                  {result.heatmap_image ? (
                    <img 
                      src={result.heatmap_image} 
                      alt="Masque" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30">
                      Masque non disponible
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                    <div className="text-xs text-white/90 font-semibold">Masque de segmentation</div>
                    <div className="text-[10px] text-white/60 mt-0.5">Classes prédites par le modèle U-Net</div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <span className="text-[10px] text-white/60">🔍 Cliquer pour zoomer</span>
                  </div>
                </div>

                {/* Comparison */}
                <div 
                  className="relative rounded-xl overflow-hidden aspect-square bg-black/50 cursor-pointer hover:ring-2 hover:ring-violet-400/50 transition-all"
                  onClick={() => result.comparison_image && openZoomModal(
                    result.comparison_image,
                    'Comparaison hémisphérique',
                    'Visualisation côte-à-côte des deux hémisphères'
                  )}
                >
                  {result.comparison_image ? (
                    <img 
                      src={result.comparison_image} 
                      alt="Comparaison" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30">
                      Comparaison non disponible
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                    <div className="text-xs text-white/90 font-semibold">Comparaison hémisphérique</div>
                    <div className="text-[10px] text-white/60 mt-0.5">Visualisation côte-à-côte des deux hémisphères</div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <span className="text-[10px] text-white/60">🔍 Cliquer pour zoomer</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3D View */}
            {activeView === '3d' && (
              <div 
                className="relative h-96 rounded-xl overflow-hidden"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0.8) 70%)',
                }}
              >
                {/* 3D CT Scan Visualization - Reconstruction volumétrique du CT réel */}
                <CTScan3D
                  ctImageUrl={analysis.ct_image}
                  segmentationImageUrl={result.segmentation_image}
                  affectedTerritory={result.affected_territory}
                  autoRotate={true}
                />

                {/* Legend */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-violet-500" />
                    <span className="text-white/60">Hémisphère sain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-white/60">Zone ischémique</span>
                  </div>
                </div>

                {/* Info reconstruction 3D */}
                <div className="absolute top-4 left-4 text-xs text-white/70 bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                  <div className="font-semibold text-white/90 mb-1">🧠 Visualisation 3D du CT</div>
                  <div className="text-[10px] text-white/60 leading-relaxed">
                    Rendu volumétrique de votre scan CT réel<br/>
                    Structures anatomiques et sillons visibles<br/>
                    <span className="text-violet-300/80">Segmentation superposée en transparence</span>
                  </div>
                </div>
                
                {/* Controls hint */}
                <div className="absolute top-4 right-4 text-xs text-white/40">
                  Rotation automatique
                </div>
              </div>
            )}
          </div>

          {/* Features Analysis */}
          <div 
            className={`rounded-[2rem] p-6 transition-all duration-1000 delay-400 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <h3 className="text-xl font-bold text-white mb-6">Analyse Radiomique</h3>
            
            {/* Territory Legend */}
            <div className="flex flex-wrap gap-3 mb-6">
              {['ACM_g', 'ACM_d', 'ACA', 'ACP'].map(territory => (
                <div 
                  key={territory}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                    result.affected_territory === territory ? 'ring-2 ring-red-500' : ''
                  }`}
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ background: getTerritoryColor(territory) }}
                  />
                  <span className="text-white/70">{territory}</span>
                </div>
              ))}
            </div>

            {/* Asymmetry Features */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                Asymétrie hémisphérique (Delta)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(result.glcm_features?.asymetrie || {}).slice(0, 8).map(([key, value]) => (
                  <div 
                    key={key}
                    className="p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <div className="text-xs text-white/40 mb-1 truncate">{key}</div>
                    <div className="text-lg font-bold text-white">
                      {typeof value === 'number' ? value.toFixed(4) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div 
          className={`rounded-[2rem] p-6 mb-8 transition-all duration-1000 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button 
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              }}
            >
              📥 Télécharger le rapport
            </button>
            <button 
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              }}
            >
              💬 Discuter avec l'assistant
            </button>
            <button 
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium border border-white/20 hover:bg-white/10 transition-all duration-300"
            >
              🖨️ Imprimer
            </button>
          </div>
        </div>

        {/* Warning */}
        <div 
          className={`rounded-2xl p-4 transition-all duration-1000 delay-600 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <p className="text-amber-200/80 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>
              <strong>Avertissement:</strong> Ces résultats sont fournis à titre indicatif uniquement. 
              Consultez toujours un professionnel de santé pour un diagnostic médical.
            </span>
          </p>
        </div>
      </div>

      {/* Modal de zoom pour les images */}
      <ImageZoomModal
        isOpen={zoomModal.isOpen}
        onClose={closeZoomModal}
        imageUrl={zoomModal.imageUrl}
        title={zoomModal.title}
        description={zoomModal.description}
      />
    </div>
  );
}
