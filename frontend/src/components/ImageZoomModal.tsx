import { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  description?: string;
}

export default function ImageZoomModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  title,
  description 
}: ImageZoomModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full max-w-7xl max-h-screen p-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            {description && (
              <p className="text-sm text-white/60 mt-1">{description}</p>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Image Container */}
        <div className="flex-1 relative rounded-xl overflow-hidden bg-black/50 border border-white/10">
          <div 
            className="absolute inset-0 flex items-center justify-center overflow-auto"
            style={{ padding: '2rem' }}
          >
            <img
              src={imageUrl}
              alt={title}
              className="max-w-none transition-transform duration-300 ease-out"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                cursor: zoom > 1 ? 'move' : 'default',
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-4 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Dézoomer"
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>
          
          <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm font-semibold text-white">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Zoomer"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>
          
          <div className="w-px h-8 bg-white/20 mx-2" />
          
          <button
            onClick={handleRotate}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Rotation 90°"
          >
            <RotateCw className="w-5 h-5 text-white" />
          </button>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-400/30 transition-colors"
          >
            <span className="text-sm font-semibold text-white">Réinitialiser</span>
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-center mt-3">
          <p className="text-xs text-white/40">
            Appuyez sur <kbd className="px-2 py-0.5 rounded bg-white/10 text-white/60">Échap</kbd> pour fermer
          </p>
        </div>
      </div>
    </div>
  );
}
