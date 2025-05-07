"use client";

import React, { useState, useEffect } from 'react';
import { CuratorFinance, UserRole } from '@/types';
import { DollarSign, Edit, CheckCircle, Banknote, TrendingDown } from 'lucide-react';
import { getMyCuratorFinance, updateMyCuratorFinance } from '@/lib/finance-api';

interface CuratorFinancePanelProps {
  userRole: UserRole;
  onFinanceUpdate?: (finance: CuratorFinance) => void;
}

export default function CuratorFinancePanel({
  userRole,
  onFinanceUpdate
}: CuratorFinancePanelProps) {
  const [finance, setFinance] = useState<CuratorFinance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для редактирования
  const [editMode, setEditMode] = useState(false);
  const [profitInput, setProfitInput] = useState<number>(0);
  const [expensesInput, setExpensesInput] = useState<number>(0);
  
  // Загрузка данных о финансах куратора
  useEffect(() => {
    const loadFinances = async () => {
      try {
        setLoading(true);
        const data = await getMyCuratorFinance();
        
        if (data && typeof data === 'object') {
          setFinance(data);
          setProfitInput(data.profit);
          setExpensesInput(data.expenses);
        } else {
          console.error('Неожиданный формат данных о финансах:', data);
          setError('Получены некорректные данные о финансах');
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных о финансах:', err);
        setError('Не удалось загрузить данные о финансах');
      } finally {
        setLoading(false);
      }
    };

    if (userRole === UserRole.CURATOR) {
      loadFinances();
    }
  }, [userRole]);

  // Обновление финансов куратора
  const handleUpdateFinance = async () => {
    try {
      setLoading(true);
      setError(null); // Сбрасываем предыдущие ошибки
      
      console.log('Отправка данных для обновления:', { profit: profitInput, expenses: expensesInput });
      
      try {
        const updatedFinance = await updateMyCuratorFinance({
          profit: profitInput,
          expenses: expensesInput
        });
        
        console.log('Получены обновленные данные:', updatedFinance);
        
        if (updatedFinance && typeof updatedFinance === 'object') {
          setFinance(updatedFinance);
          setEditMode(false);
          
          if (onFinanceUpdate) {
            onFinanceUpdate(updatedFinance);
          }
        } else {
          console.error('Неожиданный формат данных о финансах после обновления:', updatedFinance);
          setError('Получены некорректные данные после обновления');
        }
      } catch (error: any) {
        console.error('Детальная ошибка при обновлении финансов:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
          error
        });
        
        // Формируем более информативное сообщение об ошибке
        let errorMessage = 'Не удалось обновить данные о финансах';
        
        if (error?.message) {
          errorMessage += `: ${error.message}`;
        }
        
        // Дополнительная проверка на ошибки сетевого соединения
        if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('Failed')) {
          errorMessage = `Проблема с подключением к серверу: ${error.message}`;
        }
        
        // Проверка на CORS-ошибки
        if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
          errorMessage = `Ошибка кросс-доменных запросов (CORS): ${error.message}`;
        }
        
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Отображение для загрузки или ошибки
  if (loading && !finance) {
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

  // Только для кураторов
  if (userRole !== UserRole.CURATOR || !finance) {
    return null;
  }

  // Вычисляем чистую прибыль
  const netProfit = finance.profit - finance.expenses;

  return (
    <div style={{
      backgroundColor: '#141414',
      borderRadius: '12px',
      border: '1px solid #222',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'medium', color: '#9da3ae' }}>
          Финансовая панель
        </div>
        
        {!finance.locked && (
          <button
            onClick={() => setEditMode(!editMode)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#76ABAE',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            {editMode ? (
              <>
                <CheckCircle size={18} />
                Готово
              </>
            ) : (
              <>
                <Edit size={18} />
                Редактировать
              </>
            )}
          </button>
        )}
      </div>

      {finance.locked && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 165, 0, 0.1)',
          color: 'orange',
          fontSize: '12px',
          borderRadius: '6px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <DollarSign size={16} />
          Запись за этот месяц заблокирована. Редактирование недоступно.
        </div>
      )}

      {/* Режим просмотра */}
      {!editMode && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px'
        }}>
          {/* Профит */}
          <div style={{
            backgroundColor: '#1c1c1c',
            borderRadius: '8px',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '3px',
              width: '30%',
              backgroundColor: '#4CAF50'
            }} />
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '14px', color: '#9da3ae' }}>
                Профит
              </div>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Banknote style={{ width: '16px', height: '16px', color: '#4CAF50' }} />
              </div>
            </div>
            
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
              ${finance.profit.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: '#9da3ae', marginTop: '4px' }}>
              За этот месяц
            </div>
          </div>
          
          {/* Затраты */}
          <div style={{
            backgroundColor: '#1c1c1c',
            borderRadius: '8px',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '3px',
              width: '30%',
              backgroundColor: '#FF5555'
            }} />
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '14px', color: '#9da3ae' }}>
                Затраты
              </div>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 85, 85, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingDown style={{ width: '16px', height: '16px', color: '#FF5555' }} />
              </div>
            </div>
            
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
              ${finance.expenses.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: '#9da3ae', marginTop: '4px' }}>
              За этот месяц
            </div>
          </div>
          
          {/* Чистая прибыль */}
          <div style={{
            backgroundColor: '#1c1c1c',
            borderRadius: '8px',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '3px',
              width: '30%',
              backgroundColor: '#76ABAE'
            }} />
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '14px', color: '#9da3ae' }}>
                Чистая прибыль
              </div>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(118, 171, 174, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign style={{ width: '16px', height: '16px', color: '#76ABAE' }} />
              </div>
            </div>
            
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: netProfit >= 0 ? '#4CAF50' : '#FF5555' }}>
              ${netProfit.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: '#9da3ae', marginTop: '4px' }}>
              Профит - Затраты
            </div>
          </div>
        </div>
      )}

      {/* Режим редактирования */}
      {editMode && !finance.locked && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#9da3ae', fontSize: '14px' }}>
              Профит ($)
            </label>
            <input
              type="text"
              value={profitInput}
              onChange={(e) => {
                // Разрешаем только числовой ввод
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setProfitInput(value === '' ? 0 : parseFloat(value));
                }
              }}
              style={{
                width: '100%',
                backgroundColor: '#1c1c1c',
                border: '1px solid #333',
                color: 'white',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#9da3ae', fontSize: '14px' }}>
              Затраты ($)
            </label>
            <input
              type="text"
              value={expensesInput}
              onChange={(e) => {
                // Разрешаем только числовой ввод
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setExpensesInput(value === '' ? 0 : parseFloat(value));
                }
              }}
              style={{
                width: '100%',
                backgroundColor: '#1c1c1c',
                border: '1px solid #333',
                color: 'white',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <button
            onClick={handleUpdateFinance}
            disabled={loading}
            style={{
              backgroundColor: '#76ABAE',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}
          >
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      )}
    </div>
  );
} 