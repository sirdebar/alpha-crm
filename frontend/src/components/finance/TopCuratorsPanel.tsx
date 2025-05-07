"use client";

import React, { useState, useEffect } from 'react';
import { TopCuratorsData, UserRole } from '@/types';
import { Trophy, TrendingUp, DollarSign } from 'lucide-react';
import { getTopCurators } from '@/lib/finance-api';

// Настраиваемые цвета для мест
const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']; // золото, серебро, бронза

interface TopCuratorsPanelProps {
  userRole: UserRole;
}

export default function TopCuratorsPanel({ userRole }: TopCuratorsPanelProps) {
  const [topData, setTopData] = useState<TopCuratorsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Получение текущего месяца в формате YYYY-MM-01
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  // Загрузка данных о топ кураторах
  useEffect(() => {
    const loadTopCurators = async () => {
      try {
        setLoading(true);
        const data = await getTopCurators(getCurrentMonth(), 3);
        
        if (data && typeof data === 'object' && Array.isArray(data.topCurators)) {
          setTopData(data);
        } else {
          console.error('Неожиданный формат данных о топ кураторах:', data);
          setError('Получены некорректные данные о топ кураторах');
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных о топ кураторах:', err);
        setError('Не удалось загрузить данные о топ кураторах');
      } finally {
        setLoading(false);
      }
    };

    if (userRole === UserRole.ADMIN) {
      loadTopCurators();
    }
  }, [userRole]);

  // Компонент отображается только для админов
  if (userRole !== UserRole.ADMIN) {
    return null;
  }

  // Отображение для загрузки или ошибки
  if (loading && !topData) {
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

  if (!topData || topData.topCurators.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#9da3ae' }}>
        Данные о финансах кураторов отсутствуют
      </div>
    );
  }

  // Форматируем дату для отображения
  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    const options = { month: 'long', year: 'numeric' } as const;
    return date.toLocaleDateString('ru-RU', options);
  };

  return (
    <div style={{
      backgroundColor: '#141414',
      borderRadius: '12px',
      border: '1px solid #222',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'medium', color: '#9da3ae', marginBottom: '6px' }}>
          Топ кураторов по прибыли
        </div>
        <div style={{ fontSize: '12px', color: '#76ABAE' }}>
          {formatMonth(getCurrentMonth())}
        </div>
      </div>

      {/* Отображение топ кураторов */}
      <div style={{ marginBottom: '24px' }}>
        {/* Отображаем только доступное количество кураторов, без заполнения до тройки */}
        {topData.topCurators.map((curator, index) => (
          <div 
            key={`curator-${curator.curatorId}-${index}`}
            style={{
              backgroundColor: '#1c1c1c',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: index < topData.topCurators.length - 1 ? '12px' : 0,
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            {/* Бейдж с местом */}
            <div style={{
              minWidth: '36px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: RANK_COLORS[index] || '#555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              color: index === 0 ? '#000' : '#fff'
            }}>
              {index === 0 ? <Trophy size={18} /> : (index + 1)}
            </div>
            
            {/* Информация о кураторе */}
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '15px', 
                fontWeight: 'bold', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {curator.curatorName}
                {index === 0 && (
                  <span style={{ 
                    backgroundColor: 'rgba(255, 215, 0, 0.2)', 
                    color: '#FFD700',
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    Лидер
                  </span>
                )}
              </div>
              
              <div style={{ 
                fontSize: '12px', 
                color: '#9da3ae',
                display: 'flex',
                gap: '16px',
                marginTop: '4px'
              }}>
                <span>Профит: ${curator.profit.toFixed(2)}</span>
                <span>Затраты: ${curator.expenses.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Чистая прибыль */}
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: curator.netProfit >= 0 ? '#4CAF50' : '#FF5555',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <DollarSign size={16} />
              {curator.netProfit.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Общая статистика */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        backgroundColor: '#1c1c1c',
        borderRadius: '8px',
        padding: '16px'
      }}>
        {/* Общий профит */}
        <div>
          <div style={{ fontSize: '13px', color: '#9da3ae', marginBottom: '4px' }}>
            Общий профит кураторов
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#4CAF50',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <TrendingUp size={16} />
            ${topData.totalProfit.toFixed(2)}
          </div>
        </div>
        
        {/* Общие затраты */}
        <div>
          <div style={{ fontSize: '13px', color: '#9da3ae', marginBottom: '4px' }}>
            Общие затраты кураторов
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#FF5555',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <DollarSign size={16} />
            ${topData.totalExpenses.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
} 