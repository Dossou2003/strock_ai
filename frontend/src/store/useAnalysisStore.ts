/**
 * Store Zustand pour la gestion des analyses.
 */

import { create } from 'zustand';
import { AnalysisWithResult } from '../types/analysis';

interface AnalysisState {
  currentAnalysis: AnalysisWithResult | null;
  analyses: AnalysisWithResult[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;

  setCurrentAnalysis: (analysis: AnalysisWithResult | null) => void;
  setAnalyses: (analyses: AnalysisWithResult[]) => void;
  addAnalysis: (analysis: AnalysisWithResult) => void;
  updateAnalysis: (id: string, updates: Partial<AnalysisWithResult>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUploadProgress: (progress: number) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysis: null,
  analyses: [],
  isLoading: false,
  error: null,
  uploadProgress: 0,

  setCurrentAnalysis: (currentAnalysis) => set({ currentAnalysis }),
  
  setAnalyses: (analyses) => set({ analyses }),
  
  addAnalysis: (analysis) => set((state) => ({
    analyses: [analysis, ...state.analyses],
  })),
  
  updateAnalysis: (id, updates) => set((state) => ({
    analyses: state.analyses.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    ),
    currentAnalysis:
      state.currentAnalysis?.id === id
        ? { ...state.currentAnalysis, ...updates }
        : state.currentAnalysis,
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  
  reset: () => set({
    currentAnalysis: null,
    analyses: [],
    isLoading: false,
    error: null,
    uploadProgress: 0,
  }),
}));
