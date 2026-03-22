/**
 * Service pour le chatbot Gemini.
 */

import api from './api';

export interface ChatMessage {
  id: string;
  user: string;
  user_email: string;
  analysis?: string;
  message: string;
  response: string;
  timestamp: string;
}

export interface SendMessageData {
  message: string;
  analysis_id?: string;
}

class ChatbotService {
  /**
   * Envoie un message au chatbot.
   * Accepte soit un string soit un objet SendMessageData.
   */
  async sendMessage(messageOrData: string | SendMessageData): Promise<{ response: string; message_id: string }> {
    const data = typeof messageOrData === 'string' 
      ? { message: messageOrData } 
      : messageOrData;
    
    const response = await api.post<ChatMessage>('/chatbot/', data);
    return {
      response: response.data.response,
      message_id: response.data.id,
    };
  }

  /**
   * Récupère l'historique des messages.
   */
  async getHistory(): Promise<ChatMessage[]> {
    const response = await api.get<{ results: ChatMessage[] }>('/chatbot/');
    return response.data.results;
  }

  /**
   * Efface l'historique des messages.
   */
  async clearHistory(): Promise<void> {
    await api.delete('/chatbot/clear/');
  }
}

export default new ChatbotService();
