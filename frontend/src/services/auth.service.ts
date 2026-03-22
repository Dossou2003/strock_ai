/**
 * Service d'authentification.
 * 
 * Gère:
 * - Inscription
 * - Connexion
 * - Déconnexion
 * - Récupération du profil utilisateur
 */

import api from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role?: 'patient' | 'doctor' | 'admin';
  phone?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

class AuthService {
  /**
   * Inscription d'un nouvel utilisateur.
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register/', data);
    this.saveTokens(response.data.tokens);
    this.saveUser(response.data.user);
    return response.data;
  }

  /**
   * Connexion utilisateur.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login/', credentials);
    this.saveTokens(response.data.tokens);
    this.saveUser(response.data.user);
    return response.data;
  }

  /**
   * Déconnexion utilisateur.
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  /**
   * Récupère le profil de l'utilisateur connecté.
   */
  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me/');
    this.saveUser(response.data);
    return response.data;
  }

  /**
   * Vérifie si l'utilisateur est connecté.
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Récupère l'utilisateur depuis le localStorage.
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Sauvegarde les tokens dans le localStorage.
   */
  private saveTokens(tokens: { access: string; refresh: string }): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  /**
   * Sauvegarde l'utilisateur dans le localStorage.
   */
  private saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export default new AuthService();
