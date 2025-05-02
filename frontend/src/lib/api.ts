import { AuthResponse, CuratorStats, GeneralStats, SearchResult, User, UserProfile, Worker, WorkerStats, CodeHourlyStats, TopWorker, WorkerCodeStats } from '@/types';
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
      const errorData = await response.json().catch(() => ({ message: 'Неизвестная ошибка сервера' }));
      if (response.status === 500) {
        throw new Error('Внутренняя ошибка сервера. Попробуйте позже.');
      }
      throw new Error(errorData.message || 'Ошибка запроса');
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
    updatePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
      return fetchApi<{ message: string }>('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
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
    getWorker: async (id: number): Promise<Worker> => {
      return fetchApi<Worker>(`/workers/${id}`);
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
  profile: {
    getProfile: async (): Promise<UserProfile> => {
      return fetchApi<UserProfile>('/profile');
    },
    updateProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
      return fetchApi<UserProfile>('/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
    },
    uploadAvatar: async (formData: FormData): Promise<{ avatarUrl: string }> => {
      const token = useAuthStore.getState().token;
      
      try {
        const response = await fetch(`${API_URL}/profile/avatar`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Ошибка при загрузке аватарки' }));
          throw new Error(error.message || 'Ошибка загрузки');
        }
        
        return await response.json();
      } catch (err) {
        console.error('Ошибка загрузки аватарки:', err);
        if (err instanceof TypeError && err.message.includes('fetch')) {
          throw new Error('Сервер недоступен. Убедитесь, что бэкенд запущен на порту 3001');
        }
        throw err;
      }
    },
  },
  search: {
    searchUsers: async (query: string): Promise<SearchResult> => {
      return fetchApi<SearchResult>(`/search?q=${encodeURIComponent(query)}`);
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
  codeStats: {
    getDailyHourlyStats: async (): Promise<CodeHourlyStats[]> => {
      return fetchApi<CodeHourlyStats[]>('/code-stats/daily-hourly');
    },
    getTopWorkersToday: async (): Promise<TopWorker[]> => {
      return fetchApi<TopWorker[]>('/code-stats/top-workers');
    },
    getWorkerStats: async (workerId: number): Promise<WorkerCodeStats> => {
      return fetchApi<WorkerCodeStats>(`/code-stats/workers/${workerId}`);
    },
    addCodes: async (workerId: number, count: number): Promise<any> => {
      return fetchApi<any>(`/code-stats/workers/${workerId}/add-codes`, {
        method: 'POST',
        body: JSON.stringify({ count }),
      });
    },
  },
}; 