import { api } from './api';
import { CuratorFinance, CuratorFinanceStats, TopCuratorsData } from '@/types';

// Получить текущую финансовую информацию для куратора
export const getMyCuratorFinance = async (): Promise<CuratorFinance> => {
  return api.finance.getMyCuratorFinance();
};

// Обновить информацию о финансах куратора
export const updateMyCuratorFinance = async (update: { profit?: number; expenses?: number }): Promise<CuratorFinance> => {
  try {
    console.log('Отправка запроса на обновление финансов:', update);
    
    const result = await api.finance.updateMyCuratorFinance(update);
    
    console.log('Успешно получены обновленные данные о финансах:', result);
    return result;
  } catch (error) {
    console.error('Ошибка при обновлении финансов куратора:', error);
    throw error; // Пробрасываем ошибку дальше для обработки в компоненте
  }
};

// Получить историю финансов куратора
export const getMyCuratorFinanceHistory = async (months = 6): Promise<CuratorFinance[]> => {
  return api.finance.getMyCuratorFinanceHistory(months);
};

// Получить топ кураторов по профиту (только для админов)
export const getTopCurators = async (month?: string, limit = 3): Promise<TopCuratorsData> => {
  return api.finance.getTopCurators(month, limit);
};

// Получить статистику по всем кураторам (только для админов)
export const getAllCuratorsStats = async (month?: string): Promise<CuratorFinanceStats[]> => {
  return api.finance.getAllCuratorsStats(month);
};

// Получить финансы конкретного куратора (только для админов)
export const getCuratorFinance = async (curatorId: number): Promise<CuratorFinance> => {
  return api.finance.getCuratorFinance(curatorId);
};

// Обновить финансы конкретного куратора (только для админов)
export const updateCuratorFinance = async (
  curatorId: number,
  update: { profit?: number; expenses?: number }
): Promise<CuratorFinance> => {
  return api.finance.updateCuratorFinance(curatorId, update);
};

// Получить историю финансов конкретного куратора (только для админов)
export const getCuratorFinanceHistory = async (curatorId: number, months = 6): Promise<CuratorFinance[]> => {
  return api.finance.getCuratorFinanceHistory(curatorId, months);
}; 