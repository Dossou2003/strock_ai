/**
 * Service pour les analyses d'images CT.
 */

import api from './api';

export interface Analysis {
  id: string;
  user: string;
  user_email: string;
  ct_image: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  processing_time?: number;
  created_at: string;
  updated_at: string;
  result?: Result;
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
  glcm_features: {
    gauche: GLCMFeatures;
    droite: GLCMFeatures;
    asymetrie: AsymetrieFeatures;
  };
  radiomics_features: {
    gauche: Record<string, number>;
    droite: Record<string, number>;
    asymetrie: Record<string, number>;
  };
  created_at: string;
}

export interface GLCMFeatures {
  contrast: number;
  energy: number;
  homogeneity: number;
  correlation: number;
  entropy: number;
}

export interface AsymetrieFeatures {
  delta_contrast: number;
  delta_energy: number;
  delta_homogeneity: number;
  delta_correlation: number;
  delta_entropy: number;
}

export interface AnalysisListItem {
  id: string;
  ct_image: string;
  status: string;
  has_stroke?: boolean;
  probability?: number;
  affected_territory?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class AnalysisService {
  /**
   * Upload une nouvelle image CT pour analyse.
   */
  async uploadImage(file: File): Promise<Analysis> {
    const formData = new FormData();
    formData.append('ct_image', file);

    const response = await api.post<Analysis>('/analysis/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Récupère la liste des analyses de l'utilisateur.
   */
  async getAnalyses(page = 1, pageSize = 20): Promise<PaginatedResponse<AnalysisListItem>> {
    const response = await api.get<PaginatedResponse<AnalysisListItem>>('/analysis/', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  }

  /**
   * Récupère l'historique complet des analyses de l'utilisateur.
   */
  async getHistory(): Promise<AnalysisListItem[]> {
    const response = await api.get<PaginatedResponse<AnalysisListItem>>('/analysis/', {
      params: { page_size: 100 },
    });
    return response.data.results;
  }

  /**
   * Récupère les détails d'une analyse.
   */
  async getAnalysis(id: string): Promise<Analysis> {
    const response = await api.get<Analysis>(`/analysis/${id}/`);
    return response.data;
  }

  /**
   * Récupère le statut d'une analyse.
   */
  async getAnalysisStatus(id: string): Promise<{
    id: string;
    status: string;
    processing_time?: number;
    error_message?: string;
  }> {
    const response = await api.get(`/analysis/${id}/status/`);
    return response.data;
  }

  /**
   * Supprime une analyse.
   */
  async deleteAnalysis(id: string): Promise<void> {
    await api.delete(`/analysis/${id}/`);
  }

  /**
   * Récupère le résultat d'une analyse.
   */
  async getResult(analysisId: string): Promise<Result> {
    const response = await api.get<Result>(`/results/analysis/${analysisId}/`);
    return response.data;
  }

  /**
   * Poll le statut d'une analyse jusqu'à ce qu'elle soit terminée.
   */
  async pollAnalysisStatus(
    id: string,
    onUpdate?: (status: string) => void,
    interval = 2000
  ): Promise<Analysis> {
    return new Promise((resolve, reject) => {
      const poll = setInterval(async () => {
        try {
          const status = await this.getAnalysisStatus(id);
          
          if (onUpdate) {
            onUpdate(status.status);
          }

          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(poll);
            const analysis = await this.getAnalysis(id);
            resolve(analysis);
          }
        } catch (error) {
          clearInterval(poll);
          reject(error);
        }
      }, interval);
    });
  }
}

export default new AnalysisService();
