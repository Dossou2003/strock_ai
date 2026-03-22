/**
 * Page 404 avec design glassmorphique premium.
 */

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-violet-950/50 to-black" />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 4s ease-in-out infinite',
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

      <div 
        className={`relative z-10 text-center transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div 
          className="text-[150px] md:text-[200px] font-bold leading-none bg-clip-text text-transparent mb-4"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(139,92,246,0.8) 0%, rgba(236,72,153,0.8) 100%)',
          }}
        >
          404
        </div>
        <p className="text-xl md:text-2xl text-white/60 mb-8">Page non trouvée</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            boxShadow: '0 20px 40px -10px rgba(139,92,246,0.5)',
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l'accueil
        </Link>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.3; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
