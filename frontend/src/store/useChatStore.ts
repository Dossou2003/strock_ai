/**
 * Store Zustand pour la gestion du chatbot.
 */

import { create } from 'zustand';
import { ChatMessage } from '../types/chatbot';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;

  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  isOpen: false,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  clearMessages: () => set({ messages: [] }),
}));
