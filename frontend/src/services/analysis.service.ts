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
   * Nettoie une URL absolue pour la rendre relative au proxy Nginx.
   */
  private cleanUrl(url?: string): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('http')) {
      try {
        const urlObj = new URL(url);
        // Si c'est le port 8000 (backend Django), on garde que le chemin
        if (urlObj.port === '8000' || urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
          return urlObj.pathname;
        }
      } catch (e) {
        // Ignorer les erreurs d'URL invalide
      }
    }
    return url;
  }

  /**
   * Applique le nettoyage sur un objet Result.
   */
  private cleanResultUrls(result?: Result): Result | undefined {
    if (!result) return undefined;
    return {
      ...result,
      segmentation_image: this.cleanUrl(result.segmentation_image),
      heatmap_image: this.cleanUrl(result.heatmap_image),
      comparison_image: this.cleanUrl(result.comparison_image),
    };
  }

  /**
   * Applique le nettoyage sur un objet Analysis.
   */
  private cleanAnalysisUrls(analysis: Analysis): Analysis {
    return {
      ...analysis,
      ct_image: this.cleanUrl(analysis.ct_image) as string,
      result: this.cleanResultUrls(analysis.result),
    };
  }

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

    return this.cleanAnalysisUrls(response.data);
  }

  /**
   * Récupère la liste des analyses de l'utilisateur.
   */
  async getAnalyses(page = 1, pageSize = 20): Promise<PaginatedResponse<AnalysisListItem>> {
    const response = await api.get<PaginatedResponse<AnalysisListItem>>('/analysis/', {
      params: { page, page_size: pageSize },
    });
    return {
      ...response.data,
      results: response.data.results.map(item => ({
        ...item,
        ct_image: this.cleanUrl(item.ct_image) as string
      }))
    };
  }

  /**
   * Récupère l'historique complet des analyses de l'utilisateur.
   */
  async getHistory(): Promise<AnalysisListItem[]> {
    const response = await api.get<PaginatedResponse<AnalysisListItem>>('/analysis/', {
      params: { page_size: 100 },
    });
    return response.data.results.map(item => ({
      ...item,
      ct_image: this.cleanUrl(item.ct_image) as string
    }));
  }

  /**
   * Récupère les détails d'une analyse.
   */
  async getAnalysis(id: string): Promise<Analysis> {
    const response = await api.get<Analysis>(`/analysis/${id}/`);
    return this.cleanAnalysisUrls(response.data);
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
    return this.cleanResultUrls(response.data) as Result;
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
