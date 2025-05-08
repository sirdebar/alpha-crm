import { AuthResponse, CuratorStats, GeneralStats, SearchResult, User, UserProfile, Worker, WorkerStats, CodeHourlyStats, TopWorker, WorkerCodeStats, AttendanceRecord, WorkerAttendance, EarningStats, CuratorFinance, CuratorFinanceStats, TopCuratorsData } from '@/types';
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
    console.log(`Отправка запроса на: ${API_URL}${endpoint}`, { method: options.method || 'GET', headers });
    
    // Добавляем timeout и другие опции для более надежного fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд таймаут
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
      mode: 'cors',
    });
    
    clearTimeout(timeoutId);

    console.log(`Получен ответ:`, response.status, response.statusText);

    // Если ответ содержит JSON, извлекаем его даже если статус ошибочный
    const contentType = response.headers.get('content-type');
    const hasJsonResponse = contentType && contentType.includes('application/json');
    
    if (!response.ok) {
      // Сначала проверяем, есть ли JSON-ответ
      if (hasJsonResponse) {
        const errorData = await response.json();
        console.error('Ошибка API:', errorData);
        throw new Error(errorData.message || `Ошибка запроса: ${response.status}`);
      } else {
        console.error('Ошибка без JSON:', response.statusText);
        // Если это ошибка 401, сообщаем о проблеме авторизации
        if (response.status === 401) {
          throw new Error('Требуется авторизация. Пожалуйста, войдите в систему снова.');
        }
        
        if (response.status === 500) {
          throw new Error('Внутренняя ошибка сервера. Попробуйте позже.');
        }
        
        throw new Error(`Ошибка запроса: ${response.status} ${response.statusText}`);
      }
    }

    // Если есть JSON в ответе, возвращаем его
    if (hasJsonResponse) {
      return await response.json();
    }
    
    // В противном случае возвращаем пустой объект
    return {} as T;
  } catch (error: unknown) {
    console.error('Ошибка при выполнении запроса:', error);
    
    // Проверка на ошибку таймаута
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Превышено время ожидания ответа от сервера. Пожалуйста, попробуйте позже.');
    }
    
    // Обработка ошибки сети
    if (error instanceof TypeError) {
      console.error('Проблема сетевого подключения:', error.message);
      throw new Error(`Проблема подключения к серверу: ${error.message || 'неизвестная ошибка'}`);
    }
    
    // Если у ошибки есть сообщение, проверяем его содержимое
    if (error instanceof Error && 
        (error.message.includes('fetch') || 
         error.message.includes('network') || 
         error.message.includes('Failed'))) {
      console.error('Проблема сетевого подключения:', error.message);
      throw new Error(`Проблема подключения к серверу: ${error.message}`);
    }
    
    // В противном случае пробрасываем исходную ошибку, обрабатывая её как Error
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Произошла неизвестная ошибка при выполнении запроса');
    }
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
    getAttendance: async (id: number): Promise<WorkerAttendance> => {
      return fetchApi<WorkerAttendance>(`/workers/${id}/attendance`);
    },
    markAttendance: async (id: number, date: string, present: boolean, reason?: string): Promise<AttendanceRecord> => {
      return fetchApi<AttendanceRecord>(`/workers/${id}/attendance`, {
        method: 'POST',
        body: JSON.stringify({ date, present, reason }),
      });
    },
    updateAttendance: async (id: number, date: string, present: boolean, reason?: string): Promise<AttendanceRecord> => {
      return fetchApi<AttendanceRecord>(`/workers/${id}/attendance/${date}`, {
        method: 'PUT',
        body: JSON.stringify({ present, reason }),
      });
    },
    getEarnings: async (id: number): Promise<EarningStats> => {
      return fetchApi<EarningStats>(`/workers/${id}/earnings`);
    },
    updateIncome: async (id: number, income: number): Promise<Worker> => {
      return fetchApi<Worker>(`/workers/${id}/income`, {
        method: 'PATCH',
        body: JSON.stringify({ income }),
      });
    },
    addEarnings: async (id: number, amount: number): Promise<EarningStats> => {
      return fetchApi<EarningStats>(`/workers/${id}/earnings`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
    },
    deleteWorker: async (id: number): Promise<{ message: string }> => {
      return fetchApi<{ message: string }>(`/workers/${id}`, {
        method: 'DELETE',
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
    addCodes: async (workerId: number, count: number): Promise<{ success: boolean }> => {
      return fetchApi<{ success: boolean }>(`/code-stats/workers/${workerId}/add-codes`, {
        method: 'POST',
        body: JSON.stringify({ count }),
      });
    },
  },
  
  // Общие методы для HTTP запросов
  get: async <T>(endpoint: string): Promise<T> => {
    return fetchApi<T>(endpoint);
    },
  
  post: async <T>(endpoint: string, data: any): Promise<T> => {
    return fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    },
  
  patch: async <T>(endpoint: string, data: any): Promise<T> => {
    return fetchApi<T>(endpoint, {
        method: 'PATCH',
      body: JSON.stringify(data),
      });
    },
  
  put: async <T>(endpoint: string, data: any): Promise<T> => {
    return fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete: async <T>(endpoint: string): Promise<T> => {
    return fetchApi<T>(endpoint, {
      method: 'DELETE',
    });
  }
}; 