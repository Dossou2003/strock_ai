/**
 * Types TypeScript pour le chatbot.
 */

export interface ChatMessage {
  id: string;
  user: string;
  analysis?: string;
  message: string;
  response: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  analysis_id?: string;
}

export interface ChatResponse {
  response: string;
  message_id: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}
