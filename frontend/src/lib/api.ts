import { AuthResponse, CuratorStats, GeneralStats, User, Worker, WorkerStats } from '@/types';
import { useAuthStore } from '@/store/auth-store';

const API_URL = 'http://localhost:3001';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Неизвестная ошибка сервера' }));
      throw new Error(error.message || 'Ошибка запроса');
    }

    return await response.json();
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Сервер недоступен. Убедитесь, что бэкенд запущен на порту 3001');
    }
    throw err;
  }
}

export const api = {
  auth: {
    login: async (username: string, password: string): Promise<AuthResponse> => {
      return fetchApi<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
    },
    getProfile: async (): Promise<User> => {
      return fetchApi<User>('/auth/profile');
    },
  },
  users: {
    getAll: async (): Promise<User[]> => {
      return fetchApi<User[]>('/users');
    },
    getCurators: async (): Promise<User[]> => {
      return fetchApi<User[]>('/users/curators');
    },
    create: async (username: string, password: string, role: string): Promise<User> => {
      return fetchApi<User>('/users', {
        method: 'POST',
        body: JSON.stringify({ username, password, role }),
      });
    },
    deactivate: async (username: string): Promise<{ message: string }> => {
      return fetchApi<{ message: string }>(`/users/${username}`, {
        method: 'DELETE',
      });
    },
  },
  workers: {
    getAll: async (): Promise<Worker[]> => {
      return fetchApi<Worker[]>('/workers');
    },
    getStats: async (): Promise<WorkerStats[]> => {
      return fetchApi<WorkerStats[]>('/workers/stats');
    },
    create: async (username: string, password: string, tag?: string): Promise<Worker> => {
      return fetchApi<Worker>('/workers', {
        method: 'POST',
        body: JSON.stringify({ username, password, tag }),
      });
    },
  },
  statistics: {
    getGeneral: async (): Promise<GeneralStats> => {
      return fetchApi<GeneralStats>('/statistics/general');
    },
    getCurator: async (): Promise<CuratorStats> => {
      return fetchApi<CuratorStats>('/statistics/curator');
    },
  },
}; 