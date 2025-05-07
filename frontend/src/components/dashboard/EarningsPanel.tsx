"use client";

import React, { useState, useEffect } from 'react';
import { EarningStats, UserRole } from '@/types';
import { DollarSign, Edit, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface EarningsPanelProps {
  workerId: number;
  initialEarnings?: EarningStats;
  userRole: UserRole;
  onEarningsUpdate?: (earnings: EarningStats) => void;
}

export default function EarningsPanel({
  workerId,
  initialEarnings,
  userRole,
  onEarningsUpdate
}: EarningsPanelProps) {
  const [earnings, setEarnings] = useState<EarningStats | undefined>(initialEarnings);
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [incomeValue, setIncomeValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const canManageEarnings = userRole === UserRole.CURATOR || userRole === UserRole.ADMIN;

  useEffect(() => {
    if (initialEarnings) {
      setEarnings(initialEarnings);
      setIncomeValue(initialEarnings.income.toString());
    }
  }, [initialEarnings]);

  // Автоматическое обновление статистики каждые 30 секунд
  useEffect(() => {
    // Функция для получения актуальных данных о заработке
    const fetchEarnings = async () => {
      try {
        const updatedEarnings = await api.workers.getEarnings(workerId);
        setEarnings(updatedEarnings);
        
        if (onEarningsUpdate) {
          onEarningsUpdate(updatedEarnings);
        }
      } catch (error) {
        console.error("Ошибка при получении данных о заработке:", error);
      }
    };

    // Настраиваем интервал обновления каждые 30 секунд
    const interval = setInterval(fetchEarnings, 30000);
    
    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(interval);
  }, [workerId, onEarningsUpdate]);

  const handleUpdateIncome = async () => {
    const newIncome = parseFloat(incomeValue);
    if (isNaN(newIncome) || newIncome < 0) {
      return;
    }

    setLoading(true);
    try {
      await api.workers.updateIncome(workerId, newIncome);
      
      // Обновляем статистику
      const updatedEarnings = await api.workers.getEarnings(workerId);
      setEarnings(updatedEarnings);
      
      if (onEarningsUpdate) {
        onEarningsUpdate(updatedEarnings);
      }
      
      // Показываем сообщение об успехе
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      setIsEditingIncome(false);
    } catch (error) {
      console.error("Ошибка при обновлении ставки:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEarnings = async () => {
    const amount = parseFloat(incomeValue);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    setLoading(true);
    try {
      const updatedEarnings = await api.workers.addEarnings(workerId, amount);
      setEarnings(updatedEarnings);
      
      if (onEarningsUpdate) {
        onEarningsUpdate(updatedEarnings);
      }
      
      // Показываем сообщение об успехе
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Очищаем поле ввода
      setIncomeValue("");
    } catch (error) {
      console.error("Ошибка при добавлении заработка:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!earnings) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#9da3ae' }}>
        Данные о заработке отсутствуют
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Секция добавления заработка - только для кураторов и админов */}
        {canManageEarnings && (
          <div style={{
            backgroundColor: '#1c1c1c',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '14px', color: '#9da3ae', marginBottom: '8px' }}>
                Добавить заработок
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={incomeValue}
                  onChange={(e) => setIncomeValue(e.target.value)}
                  style={{
                    backgroundColor: '#141414',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    color: 'white',
                    padding: '8px 10px',
                    width: '120px',
                    fontSize: '14px',
                    appearance: 'textfield',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                  placeholder="Сумма"
                />
                <button
                  onClick={handleAddEarnings}
                  disabled={loading}
                  style={{
                    backgroundColor: '#76ABAE',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    cursor: loading ? 'default' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    fontSize: '14px'
                  }}
                >
                  Добавить
                </button>
              </div>
            </div>
            
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(118, 171, 174, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={20} style={{ color: '#76ABAE' }} />
            </div>
          </div>
        )}
        
        {/* Секция статистики заработка */}
        <div style={{
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#9da3ae',
            marginBottom: '12px'
          }}>
            Статистика заработка
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}>
            {/* Сегодня */}
            <div style={{
              backgroundColor: '#1c1c1c',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '13px', color: '#9da3ae', marginBottom: '8px' }}>
                Сегодня
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                ${earnings.dailyEarnings.toFixed(2)}
              </div>
            </div>
            
            {/* За неделю */}
            <div style={{
              backgroundColor: '#1c1c1c',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '13px', color: '#9da3ae', marginBottom: '8px' }}>
                За неделю
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                ${earnings.weeklyEarnings.toFixed(2)}
              </div>
            </div>
            
            {/* За месяц */}
            <div style={{
              backgroundColor: '#1c1c1c',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '13px', color: '#9da3ae', marginBottom: '8px' }}>
                За месяц
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                ${earnings.monthlyEarnings.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Уведомление об успешном обновлении */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgba(16, 185, 129, 0.9)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 100,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <CheckCircle size={18} style={{ marginRight: '8px' }} />
          <span>Данные успешно обновлены!</span>
          <style jsx>{`
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
} 