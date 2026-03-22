/**
 * Page Ressources éducatives avec design glassmorphique premium.
 * Informations sur l'AVC et guide d'utilisation de la plateforme.
 */

import { useEffect, useState } from 'react';

export default function Resources() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'avc' | 'guide' | 'faq'>('avc');

  useEffect(() => {
    setMounted(true);
  }, []);

  const avcInfo = [
    {
      title: 'Qu\'est-ce qu\'un AVC ?',
      content: 'L\'Accident Vasculaire Cérébral (AVC) est une urgence médicale causée par l\'interruption de la circulation sanguine dans le cerveau. Il existe deux types principaux : l\'AVC ischémique (80% des cas) et l\'AVC hémorragique.',
      icon: '🧠',
    },
    {
      title: 'Signes d\'alerte FAST',
      content: 'F (Face) - Visage paralysé, A (Arm) - Bras engourdi, S (Speech) - Troubles de la parole, T (Time) - Temps d\'appeler les urgences. Chaque minute compte !',
      icon: '⚡',
    },
    {
      title: 'Territoires vasculaires',
      content: 'Le cerveau est irrigué par différentes artères : ACM (Artère Cérébrale Moyenne), ACA (Artère Cérébrale Antérieure), ACP (Artère Cérébrale Postérieure). Notre IA détecte les anomalies dans ces territoires.',
      icon: '🔬',
    },
  ];

  const guideSteps = [
    {
      step: '01',
      title: 'Préparer l\'image',
      description: 'Assurez-vous que l\'image CT est de bonne qualité, en coupe axiale, et au format JPG, PNG ou JPEG.',
    },
    {
      step: '02',
      title: 'Uploader le scan',
      description: 'Glissez-déposez l\'image ou cliquez pour sélectionner le fichier depuis votre ordinateur.',
    },
    {
      step: '03',
      title: 'Attendre l\'analyse',
      description: 'Notre IA effectue la segmentation U-Net, l\'extraction de features GLCM/GLRLM et la classification.',
    },
    {
      step: '04',
      title: 'Consulter les résultats',
      description: 'Visualisez le diagnostic, la probabilité, le territoire affecté et les images de segmentation.',
    },
  ];

  const faqs = [
    {
      question: 'Quelle est la précision de l\'IA ?',
      answer: 'Notre modèle atteint une précision supérieure à 95% sur les données de test. Cependant, il s\'agit d\'un outil d\'aide au diagnostic et non d\'un substitut à l\'avis médical.',
    },
    {
      question: 'Quels formats d\'image sont acceptés ?',
      answer: 'Nous acceptons les formats JPG, JPEG et PNG. Les images DICOM seront supportées prochainement.',
    },
    {
      question: 'Mes données sont-elles sécurisées ?',
      answer: 'Oui, toutes les images sont traitées de manière sécurisée et ne sont pas conservées après l\'analyse, sauf si vous choisissez de les sauvegarder dans votre historique.',
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

      <div className="relative z-10 max-w-5xl mx-auto px-4">
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
            Ressources Éducatives
          </h1>
          <p className="text-white/50 text-lg">
            Apprenez-en plus sur l'AVC et comment utiliser notre plateforme
          </p>
        </div>

        {/* Tabs */}
        <div 
          className={`flex justify-center gap-2 mb-12 transition-all duration-1000 delay-100 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {[
            { key: 'avc', label: 'À propos de l\'AVC', icon: '🧠' },
            { key: 'guide', label: 'Guide d\'utilisation', icon: '📖' },
            { key: 'faq', label: 'FAQ', icon: '❓' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.key 
                  ? 'text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              style={{
                background: activeTab === tab.key 
                  ? 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(236,72,153,0.3) 100%)'
                  : 'rgba(255,255,255,0.05)',
                border: activeTab === tab.key ? '1px solid rgba(139,92,246,0.5)' : '1px solid transparent',
              }}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div 
          className={`transition-all duration-1000 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* AVC Info Tab */}
          {activeTab === 'avc' && (
            <div className="space-y-6">
              {avcInfo.map((item, i) => (
                <div 
                  key={i}
                  className="rounded-[2rem] p-8"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="flex items-start gap-6">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.2) 100%)',
                        border: '1px solid rgba(139,92,246,0.3)',
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                      <p className="text-white/60 leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Guide Tab */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              {guideSteps.map((item, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-6 rounded-[2rem] p-8"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-white/60 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {faqs.map((item, i) => (
                <div 
                  key={i}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-violet-400">Q:</span>
                    {item.question}
                  </h3>
                  <p className="text-white/60 leading-relaxed pl-6">{item.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
