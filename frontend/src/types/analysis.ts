/**
 * Types TypeScript pour les analyses d'images CT.
 */

export interface Analysis {
  id: string;
  user: string;
  ct_image: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  processing_time?: number;
  created_at: string;
  updated_at: string;
}

export interface Result {
  id: string;
  analysis: string;
  has_stroke: boolean;
  probability: number;
  confidence: string;
  affected_territory: 'none' | 'ACM_g' | 'ACM_d' | 'ACA' | 'ACP';
  segmentation_image?: string;
  heatmap_image?: string;
  comparison_image?: string;
  radiomics_features: {
    gauche: Record<string, number>;
    droite: Record<string, number>;
    asymetrie: Record<string, number>;
  };
  created_at: string;
}

export interface AnalysisWithResult extends Analysis {
  result?: Result;
}

export interface UploadResponse {
  id: string;
  message: string;
  status: string;
}

export interface AnalysisState {
  currentAnalysis: AnalysisWithResult | null;
  analyses: AnalysisWithResult[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
}
