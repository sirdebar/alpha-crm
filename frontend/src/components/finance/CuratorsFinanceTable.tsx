"use client";

import React, { useState, useEffect } from 'react';
import { CuratorFinanceStats, UserRole } from '@/types';
import { Filter, ArrowDown, ArrowUp, DollarSign } from 'lucide-react';
import { getAllCuratorsStats } from '@/lib/finance-api';

// Тип сортировки
type SortField = 'curatorName' | 'profit' | 'expenses' | 'netProfit';
type SortDirection = 'asc' | 'desc';

interface CuratorsFinanceTableProps {
  userRole: UserRole;
}

export default function CuratorsFinanceTable({ userRole }: CuratorsFinanceTableProps) {
  const [curatorsStats, setCuratorsStats] = useState<CuratorFinanceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для сортировки
  const [sortField, setSortField] = useState<SortField>('netProfit');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Получение текущего месяца в формате YYYY-MM-01
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  // Загрузка данных о финансах всех кураторов
  useEffect(() => {
    const loadCuratorsStats = async () => {
      try {
        setLoading(true);
        const data = await getAllCuratorsStats(getCurrentMonth());
        
        if (Array.isArray(data)) {
          setCuratorsStats(data);
        } else {
          console.error('Неожиданный формат данных о финансах кураторов:', data);
          setError('Получены некорректные данные о финансах кураторов');
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных о финансах кураторов:', err);
        setError('Не удалось загрузить данные о финансах кураторов');
      } finally {
        setLoading(false);
      }
    };

    if (userRole === UserRole.ADMIN) {
      loadCuratorsStats();
    }
  }, [userRole]);

  // Функция для изменения сортировки
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Если поле то же самое, меняем направление сортировки
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Если новое поле, устанавливаем его и направление по умолчанию
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Сортировка данных
  const sortedCurators = [...curatorsStats].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'curatorName') {
      comparison = a.curatorName.localeCompare(b.curatorName);
    } else {
      comparison = a[sortField] - b[sortField];
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Компонент отображается только для админов
  if (userRole !== UserRole.ADMIN) {
    return null;
  }

  // Отображение для загрузки или ошибки
  if (loading && curatorsStats.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#9da3ae' }}>
        Загрузка данных...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#ff5555' }}>
        {error}
      </div>
    );
  }

  // Форматируем дату для отображения
  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    const options = { month: 'long', year: 'numeric' } as const;
    return date.toLocaleDateString('ru-RU', options);
  };

  // Получаем общую статистику
  const totalProfit = curatorsStats.reduce((sum, curator) => sum + curator.profit, 0);
  const totalExpenses = curatorsStats.reduce((sum, curator) => sum + curator.expenses, 0);
  const totalNetProfit = curatorsStats.reduce((sum, curator) => sum + curator.netProfit, 0);

  return (
    <div style={{
      backgroundColor: '#141414',
      borderRadius: '12px',
      border: '1px solid #222',
      padding: '20px',
      marginBottom: '20px',
      overflowX: 'auto'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'medium', color: '#9da3ae', marginBottom: '6px' }}>
          Финансовая статистика кураторов
        </div>
        <div style={{ fontSize: '12px', color: '#76ABAE' }}>
          {formatMonth(getCurrentMonth())}
        </div>
      </div>

      {/* Таблица кураторов */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px'
      }}>
        <thead>
          <tr>
            <th style={{
              textAlign: 'left',
              padding: '10px 12px',
              backgroundColor: '#1c1c1c',
              color: '#9da3ae',
              borderRadius: '6px 0 0 6px',
              cursor: 'pointer'
            }} onClick={() => handleSort('curatorName')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Куратор
                {sortField === 'curatorName' && (
                  sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </div>
            </th>
            <th style={{
              textAlign: 'right',
              padding: '10px 12px',
              backgroundColor: '#1c1c1c',
              color: '#9da3ae',
              cursor: 'pointer'
            }} onClick={() => handleSort('profit')}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                Профит
                {sortField === 'profit' && (
                  sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </div>
            </th>
            <th style={{
              textAlign: 'right',
              padding: '10px 12px',
              backgroundColor: '#1c1c1c',
              color: '#9da3ae',
              cursor: 'pointer'
            }} onClick={() => handleSort('expenses')}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                Затраты
                {sortField === 'expenses' && (
                  sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </div>
            </th>
            <th style={{
              textAlign: 'right',
              padding: '10px 12px',
              backgroundColor: '#1c1c1c',
              color: '#9da3ae',
              borderRadius: '0 6px 6px 0',
              cursor: 'pointer'
            }} onClick={() => handleSort('netProfit')}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                Чистая прибыль
                {sortField === 'netProfit' && (
                  sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedCurators.map((curator, index) => (
            <tr key={curator.curatorId} style={{
              backgroundColor: index % 2 === 0 ? '#141414' : 'rgba(28, 28, 28, 0.5)'
            }}>
              <td style={{ padding: '12px', color: 'white' }}>
                {curator.curatorName}
              </td>
              <td style={{ padding: '12px', textAlign: 'right', color: '#4CAF50' }}>
                ${curator.profit.toFixed(2)}
              </td>
              <td style={{ padding: '12px', textAlign: 'right', color: '#FF5555' }}>
                ${curator.expenses.toFixed(2)}
              </td>
              <td style={{ 
                padding: '12px', 
                textAlign: 'right',
                color: curator.netProfit >= 0 ? '#4CAF50' : '#FF5555',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '4px'
              }}>
                <DollarSign size={14} />
                {curator.netProfit.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#1c1c1c' }}>
            <td style={{ 
              padding: '12px', 
              fontWeight: 'bold', 
              color: '#9da3ae',
              borderRadius: '6px 0 0 6px'
            }}>
              Итого
            </td>
            <td style={{ 
              padding: '12px', 
              textAlign: 'right', 
              fontWeight: 'bold',
              color: '#4CAF50' 
            }}>
              ${totalProfit.toFixed(2)}
            </td>
            <td style={{ 
              padding: '12px', 
              textAlign: 'right', 
              fontWeight: 'bold',
              color: '#FF5555' 
            }}>
              ${totalExpenses.toFixed(2)}
            </td>
            <td style={{ 
              padding: '12px', 
              textAlign: 'right', 
              fontWeight: 'bold',
              color: totalNetProfit >= 0 ? '#4CAF50' : '#FF5555',
              borderRadius: '0 6px 6px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '4px'
            }}>
              <DollarSign size={14} />
              {totalNetProfit.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
} 