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
  finance: {
    getMyCuratorFinance: async (): Promise<CuratorFinance> => {
      return fetchApi<CuratorFinance>('/finance/my');
    },
    updateMyCuratorFinance: async (update: { profit?: number; expenses?: number }): Promise<CuratorFinance> => {
      console.log('Обращение к API для обновления финансов:', update);
      
      // Убедимся, что данные корректны
      const validUpdate = {
        profit: update.profit !== undefined ? parseFloat(update.profit.toString()) : undefined,
        expenses: update.expenses !== undefined ? parseFloat(update.expenses.toString()) : undefined
      };
      
      try {
        return await fetchApi<CuratorFinance>('/finance/my', {
          method: 'PATCH',
          body: JSON.stringify(validUpdate),
        });
      } catch (error) {
        console.error('Ошибка в API при обновлении финансов:', error);
        throw error;
      }
    },
    getMyCuratorFinanceHistory: async (months = 6): Promise<CuratorFinance[]> => {
      return fetchApi<CuratorFinance[]>(`/finance/my/history?months=${months}`);
    },
    getTopCurators: async (month?: string, limit = 3): Promise<TopCuratorsData> => {
      const monthParam = month ? `month=${month}&` : '';
      return fetchApi<TopCuratorsData>(`/finance/top?${monthParam}limit=${limit}`);
    },
    getAllCuratorsStats: async (month?: string): Promise<CuratorFinanceStats[]> => {
      const monthParam = month ? `?month=${month}` : '';
      return fetchApi<CuratorFinanceStats[]>(`/finance/all${monthParam}`);
    },
    getCuratorFinance: async (curatorId: number): Promise<CuratorFinance> => {
      return fetchApi<CuratorFinance>(`/finance/curator/${curatorId}`);
    },
    updateCuratorFinance: async (
      curatorId: number,
      update: { profit?: number; expenses?: number }
    ): Promise<CuratorFinance> => {
      return fetchApi<CuratorFinance>(`/finance/curator/${curatorId}`, {
        method: 'PATCH',
        body: JSON.stringify(update),
      });
    },
    getCuratorFinanceHistory: async (curatorId: number, months = 6): Promise<CuratorFinance[]> => {
      return fetchApi<CuratorFinance[]>(`/finance/curator/${curatorId}/history?months=${months}`);
    },
  },
}; 