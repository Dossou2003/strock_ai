/**
 * Page d'analyse avec design glassmorphique premium.
 * Upload d'images CT et suivi de l'analyse en temps réel.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import analysisService from '../services/analysis.service';

type AnalysisStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export default function Analysis() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [_analysisId, setAnalysisId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpload = async (file: File) => {
    // Créer une preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    setStatus('uploading');
    setProgress(10);
    setError(null);

    try {
      setProgress(30);
      const response = await analysisService.uploadImage(file);
      setAnalysisId(response.id);
      
      setStatus('processing');
      setProgress(50);

      let attempts = 0;
      const maxAttempts = 30;
      
      const checkStatus = async () => {
        attempts++;
        const analysis = await analysisService.getAnalysis(response.id);
        
        if (analysis.status === 'completed') {
          setProgress(100);
          setStatus('completed');
          setTimeout(() => {
            navigate(`/results/${response.id}`);
          }, 1500);
        } else if (analysis.status === 'failed') {
          setStatus('error');
          setError(analysis.error_message || 'Erreur lors de l\'analyse');
        } else if (attempts < maxAttempts) {
          setProgress(50 + (attempts / maxAttempts) * 40);
          setTimeout(checkStatus, 2000);
        } else {
          setStatus('error');
          setError('Timeout: l\'analyse prend trop de temps');
        }
      };

      await checkStatus();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png'],
    },
    maxFiles: 1,
    disabled: status !== 'idle',
  });

  const steps = [
    { label: 'Upload', icon: '📤', active: status === 'uploading' },
    { label: 'Segmentation U-Net', icon: '🧠', active: status === 'processing' && progress < 70 },
    { label: 'Analyse Radiomique', icon: '📊', active: status === 'processing' && progress >= 70 && progress < 90 },
    { label: 'Classification', icon: '🎯', active: status === 'processing' && progress >= 90 },
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
            animation: 'float 15s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 70%)',
            bottom: '-100px',
            left: '-100px',
            animation: 'float 20s ease-in-out infinite reverse',
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

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div 
          className={`text-center mb-12 transition-all duration-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
            }}
          >
            Analyser un Scan CT
          </h1>
          <p className="text-white/50 text-lg">
            Uploadez votre image CT cérébrale pour détecter les signes d'AVC
          </p>
        </div>

        {/* Main Card */}
        <div 
          className={`relative rounded-[2rem] p-8 md:p-12 transition-all duration-1000 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          }}
        >
          {/* Idle State - Upload Zone */}
          {status === 'idle' && (
            <div
              {...getRootProps()}
              className={`relative rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-violet-500 bg-violet-500/10' 
                  : 'border-white/20 hover:border-violet-500/50 hover:bg-white/5'
              }`}
              style={{
                border: '2px dashed',
                borderColor: isDragActive ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.2)',
              }}
            >
              <input {...getInputProps()} />
              <div 
                className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.2) 100%)',
                  border: '1px solid rgba(139,92,246,0.3)',
                }}
              >
                <span className="text-5xl">🧠</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {isDragActive ? 'Déposez l\'image ici' : 'Glissez-déposez votre scan CT'}
              </h3>
              <p className="text-white/50 mb-6">
                ou cliquez pour sélectionner un fichier
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-white/40">
                <span className="px-3 py-1 rounded-full bg-white/5">JPG</span>
                <span className="px-3 py-1 rounded-full bg-white/5">PNG</span>
                <span className="px-3 py-1 rounded-full bg-white/5">JPEG</span>
              </div>
            </div>
          )}

          {/* Processing State */}
          {(status === 'uploading' || status === 'processing') && (
            <div className="text-center py-8">
              {/* Preview Image */}
              {previewUrl && (
                <div className="mb-8">
                  <div 
                    className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden"
                    style={{
                      border: '2px solid rgba(139,92,246,0.3)',
                      boxShadow: '0 0 40px rgba(139,92,246,0.2)',
                    }}
                  >
                    <img src={previewUrl} alt="CT Scan" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                </div>
              )}

              {/* Animated Brain */}
              <div 
                className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  boxShadow: '0 0 60px rgba(139,92,246,0.4)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              >
                <span className="text-4xl">🧠</span>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-4 mb-8">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center">
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${
                        step.active 
                          ? 'scale-110' 
                          : progress > (i + 1) * 25 
                            ? 'opacity-100' 
                            : 'opacity-40'
                      }`}
                      style={{
                        background: step.active 
                          ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' 
                          : 'rgba(255,255,255,0.1)',
                        boxShadow: step.active ? '0 0 20px rgba(139,92,246,0.5)' : 'none',
                      }}
                    >
                      {step.icon}
                    </div>
                    {i < steps.length - 1 && (
                      <div 
                        className="w-8 h-0.5 mx-2"
                        style={{
                          background: progress > (i + 1) * 25 
                            ? 'linear-gradient(90deg, #8B5CF6, #EC4899)' 
                            : 'rgba(255,255,255,0.1)',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto mb-6">
                <div 
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)',
                      boxShadow: '0 0 20px rgba(139,92,246,0.5)',
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-white/50">
                  <span>{Math.round(progress)}%</span>
                  <span>
                    {status === 'uploading' && 'Upload en cours...'}
                    {status === 'processing' && 'Analyse IA en cours...'}
                  </span>
                </div>
              </div>

              <p className="text-white/40 text-sm">
                Segmentation U-Net • Extraction GLCM/GLRLM • Classification Ensemble ML
              </p>
            </div>
          )}

          {/* Completed State */}
          {status === 'completed' && (
            <div className="text-center py-12">
              <div 
                className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                  boxShadow: '0 0 60px rgba(16,185,129,0.4)',
                }}
              >
                <span className="text-5xl">✓</span>
              </div>
              <h2 
                className="text-3xl font-bold mb-4 bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                }}
              >
                Analyse terminée !
              </h2>
              <p className="text-white/50">Redirection vers les résultats...</p>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center py-12">
              <div 
                className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.1) 100%)',
                  border: '1px solid rgba(239,68,68,0.3)',
                }}
              >
                <span className="text-5xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-red-400 mb-4">
                Erreur lors de l'analyse
              </h2>
              <p className="text-white/50 mb-8">{error}</p>
              <button
                onClick={() => {
                  setStatus('idle');
                  setError(null);
                  setProgress(0);
                  setPreviewUrl(null);
                }}
                className="px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  boxShadow: '0 10px 30px -10px rgba(139,92,246,0.5)',
                }}
              >
                Réessayer
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        {status === 'idle' && (
          <div 
            className={`mt-8 rounded-2xl p-6 transition-all duration-1000 delay-400 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.1) 100%)',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>📋</span> Instructions
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-white/60">
              <div className="flex items-start gap-3">
                <span className="text-violet-400">•</span>
                <span>Formats acceptés: JPG, PNG, JPEG</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-violet-400">•</span>
                <span>L'image doit être un scan CT cérébral axial</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-violet-400">•</span>
                <span>L'analyse prend généralement 5-15 secondes</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-violet-400">•</span>
                <span>Résultats: segmentation, diagnostic, visualisation 3D</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(3deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(139,92,246,0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 80px rgba(236,72,153,0.5); }
        }
      `}</style>
    </div>
  );
}
