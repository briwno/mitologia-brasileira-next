// src/utils/api.js
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  constructor() {
    this.baseURL = BASE_URL;
    this.token = null;
  }

  // Configurar token de autenticação
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  // Obter token armazenado
  getToken() {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  // Remover token
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Fazer requisição
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Métodos HTTP
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

// Instância única
const apiClient = new ApiClient();

// Serviços de API

// Autenticação
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.put('/auth/password', data),
};

// Cartas
export const cardsAPI = {
  getAll: (filters = {}) => apiClient.get('/cards', filters),
  getById: (id) => apiClient.get(`/cards/${id}`),
  getByCategory: (category) => apiClient.get('/cards', { category }),
  getByRegion: (region) => apiClient.get('/cards', { region }),
  search: (query) => apiClient.get('/cards/search', { q: query }),
  getFavorites: () => apiClient.get('/cards/favorites'),
  addToFavorites: (cardId) => apiClient.post('/cards/favorites', { cardId }),
  removeFromFavorites: (cardId) => apiClient.delete(`/cards/favorites/${cardId}`),
};

// Coleção
export const collectionAPI = {
  get: (uid) => apiClient.get(`/collection?uid=${encodeURIComponent(uid)}`),
  set: (uid, cards, itemCards = []) => apiClient.post('/collection', { uid, cards, itemCards }),
  addCard: (uid, cardId) => apiClient.patch('/collection', { uid, add: cardId }),
  removeCard: (uid, cardId) => apiClient.patch('/collection', { uid, remove: cardId }),
  addItemCard: (uid, itemCardId) => apiClient.patch('/collection', { uid, addItemCard: itemCardId }),
  removeItemCard: (uid, itemCardId) => apiClient.patch('/collection', { uid, removeItemCard: itemCardId }),
};

// Decks
export const decksAPI = {
  getAll: () => apiClient.get('/decks'),
  getById: (id) => apiClient.get(`/decks/${id}`),
  create: (deckData) => apiClient.post('/decks', deckData),
  update: (id, deckData) => apiClient.put(`/decks/${id}`, deckData),
  delete: (id) => apiClient.delete(`/decks/${id}`),
  validate: (cards) => apiClient.post('/decks/validate', { cards }),
};

// Jogos
export const gameAPI = {
  createRoom: (roomData) => apiClient.post('/game/rooms', roomData),
  getRooms: (filters = {}) => apiClient.get('/game/rooms', filters),
  joinRoom: (roomId) => apiClient.post(`/game/rooms/${roomId}/join`),
  leaveRoom: (roomId) => apiClient.post(`/game/rooms/${roomId}/leave`),
  startGame: (roomId) => apiClient.post(`/game/rooms/${roomId}/start`),
  getGameState: (gameId) => apiClient.get(`/game/${gameId}/state`),
  makeMove: (gameId, moveData) => apiClient.post(`/game/${gameId}/move`, moveData),
  getHistory: (gameId) => apiClient.get(`/game/${gameId}/history`),
};

// Usuários
export const userAPI = {
  getProfile: (userId) => apiClient.get(`/users/${userId}`),
  getStats: (userId) => apiClient.get(`/users/${userId}/stats`),
  getAchievements: (userId) => apiClient.get(`/users/${userId}/achievements`),
  updateSettings: (settings) => apiClient.put('/users/settings', settings),
  getRanking: (type = 'global') => apiClient.get('/users/ranking', { type }),
  getFriends: () => apiClient.get('/users/friends'),
  addFriend: (userId) => apiClient.post('/users/friends', { userId }),
  removeFriend: (userId) => apiClient.delete(`/users/friends/${userId}`),
};

// Quiz
export const quizAPI = {
  getQuestions: (category = null) => apiClient.get('/quiz/questions', { category }),
  submitAnswer: (questionId, answer) => apiClient.post('/quiz/answer', { questionId, answer }),
  getResults: (sessionId) => apiClient.get(`/quiz/results/${sessionId}`),
  getLeaderboard: () => apiClient.get('/quiz/leaderboard'),
};

// Museu
export const museumAPI = {
  getRegions: () => apiClient.get('/museum/regions'),
  getRegionCards: (regionId) => apiClient.get(`/museum/regions/${regionId}/cards`),
  markCardAsViewed: (cardId) => apiClient.post('/museum/viewed', { cardId }),
  getProgress: () => apiClient.get('/museum/progress'),
  getAchievements: () => apiClient.get('/museum/achievements'),
};

// Configurações globais
export const configAPI = {
  getSettings: () => apiClient.get('/config/settings'),
  updateSettings: (settings) => apiClient.put('/config/settings', settings),
  getAnnouncements: () => apiClient.get('/config/announcements'),
  getMaintenanceStatus: () => apiClient.get('/config/maintenance'),
};

// WebSocket para jogos em tempo real
export class GameSocket {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(gameId, token) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
    this.socket = new WebSocket(`${wsUrl}/game/${gameId}?token=${token}`);

    this.socket.onopen = () => {
      console.log('Connected to game socket');
      this.emit('connected');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit(data.type, data.payload);
    };

    this.socket.onclose = () => {
      console.log('Disconnected from game socket');
      this.emit('disconnected');
    };

    this.socket.onerror = (error) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send(type, payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
}

// Utilitários
export const apiUtils = {
  // Configurar token globalmente
  setAuthToken: (token) => {
    apiClient.setToken(token);
  },

  // Limpar autenticação
  clearAuth: () => {
    apiClient.clearToken();
  },

  // Verificar se está autenticado
  isAuthenticated: () => {
    return !!apiClient.getToken();
  },

  // Upload de arquivos
  uploadFile: async (file, endpoint = '/upload') => {
    const formData = new FormData();
    formData.append('file', file);

    const token = apiClient.getToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  // Interceptar erros de autenticação
  handleAuthError: (error) => {
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      apiClient.clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw error;
  },
};

export default apiClient;
