/**
 * Dashboard des résultats d'analyse.
 * Affiche le diagnostic, les probabilités et les visualisations.
 */

import { Result } from '../../services/analysis.service';

interface ResultsDashboardProps {
  result: Result;
  ctImage?: string;
}

export default function ResultsDashboard({ result, ctImage }: ResultsDashboardProps) {
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

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'haute': return 'text-green-600 bg-green-100';
      case 'moyenne': return 'text-yellow-600 bg-yellow-100';
      case 'faible': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Diagnostic principal */}
      <div className={`
        p-6 rounded-xl text-center
        ${result.has_stroke 
          ? 'bg-red-50 border-2 border-red-200' 
          : 'bg-green-50 border-2 border-green-200'
        }
      `}>
        <div className="text-5xl mb-4">
          {result.has_stroke ? '⚠️' : '✅'}
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${result.has_stroke ? 'text-red-700' : 'text-green-700'}`}>
          {result.has_stroke ? 'AVC Détecté' : 'Cerveau Normal'}
        </h2>
        <p className={`text-lg ${result.has_stroke ? 'text-red-600' : 'text-green-600'}`}>
          Probabilité: {(result.probability * 100).toFixed(1)}%
        </p>
        {result.confidence && (
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
            Confiance: {result.confidence}
          </span>
        )}
      </div>

      {/* Détails */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Territoire affecté */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Territoire Affecté</h3>
          <div className="text-3xl font-bold text-blue-600">
            {getTerritoryLabel(result.affected_territory)}
          </div>
        </div>

        {/* Temps de traitement */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse</h3>
          <p className="text-gray-600">
            Date: {new Date(result.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Images */}
      <div className="grid md:grid-cols-2 gap-6">
        {ctImage && (
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Originale</h3>
            <img src={ctImage} alt="Scan CT" className="w-full rounded-lg" />
          </div>
        )}
        
        {result.segmentation_image && (
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Segmentation</h3>
            <img src={result.segmentation_image} alt="Segmentation" className="w-full rounded-lg" />
          </div>
        )}
      </div>

      {/* Features radiomiques */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Features Radiomiques (Asymétrie)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(result.radiomics_features?.asymetrie || result.glcm_features?.asymetrie || {}).slice(0, 8).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 truncate">{key.replace('delta_', '')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {typeof value === 'number' ? value.toFixed(4) : value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
