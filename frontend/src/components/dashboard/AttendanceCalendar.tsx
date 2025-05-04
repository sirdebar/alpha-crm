"use client";

import React, { useState, useEffect } from 'react';
import { AttendanceRecord, WorkerAttendance } from '@/types';
import { UserRole } from '@/types';
import { api } from '@/lib/api';

interface AttendanceCalendarProps {
  workerId: number;
  initialAttendance?: WorkerAttendance;
  userRole: UserRole;
  onAttendanceUpdate?: (attendance: WorkerAttendance) => void;
}

export default function AttendanceCalendar({
  workerId,
  initialAttendance,
  userRole,
  onAttendanceUpdate
}: AttendanceCalendarProps) {
  const [attendance, setAttendance] = useState<WorkerAttendance | undefined>(initialAttendance);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showSelectStatusDialog, setShowSelectStatusDialog] = useState<boolean>(false);
  const [showReasonDialog, setShowReasonDialog] = useState<boolean>(false);
  const [showReasonViewDialog, setShowReasonViewDialog] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const isCurator = userRole === UserRole.CURATOR || userRole === UserRole.ADMIN;

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleDateClick = (date: string, record?: AttendanceRecord) => {
    if (!isCurator && record?.present === false) {
      // Если пользователь не куратор и день отмечен как отсутствие,
      // показываем просмотр причины
      if (record) {
        setSelectedRecord(record);
        setShowReasonViewDialog(true);
      }
      return;
    }
    
    if (!isCurator) return;
    
    setSelectedDate(date);
    
    if (record) {
      // Если запись уже существует и это отсутствие, показываем причину
      if (!record.present) {
        setSelectedRecord(record);
        setShowReasonViewDialog(true);
        return;
      }
    } 
    
    // В других случаях открываем диалог выбора статуса
    setShowSelectStatusDialog(true);
  };

  const handleStatusSelect = (present: boolean) => {
    setAttendanceStatus(present);
    setShowSelectStatusDialog(false);
    
    if (!present) {
      // Если выбрано отсутствие, показываем диалог для ввода причины
      setReason("");
      setShowReasonDialog(true);
    } else {
      // Если выбрано присутствие, сразу сохраняем без причины
      handleSaveAttendance(present, "");
    }
  };

  const handleReasonSubmit = () => {
    handleSaveAttendance(false, reason);
  };

  const handleSaveAttendance = async (present: boolean, reasonText: string) => {
    if (!selectedDate || !attendance) return;
    
    setLoading(true);
    try {
      const record = await api.workers.updateAttendance(
        workerId,
        selectedDate,
        present,
        reasonText || undefined
      );
      
      // Обновляем локальное состояние посещаемости
      const updatedRecords = attendance.records.map(r => 
        r.date === record.date ? record : r
      );
      
      if (!updatedRecords.find(r => r.date === record.date)) {
        updatedRecords.push(record);
      }
      
      // Пересчитываем статистику
      const presentDays = updatedRecords.filter(r => r.present).length;
      
      // Расчет наилучшего стрика присутствия
      let currentStreak = 0;
      let bestStreak = 0;
      
      // Сортируем записи по дате
      const sortedRecords = [...updatedRecords].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      for (const record of sortedRecords) {
        if (record.present) {
          currentStreak++;
          bestStreak = Math.max(bestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
      
      // Расчет процента посещаемости за неделю
      const today = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      
      const recentRecords = sortedRecords.filter(r => {
        const date = new Date(r.date);
        return date >= oneWeekAgo && date <= today;
      });
      
      const weeklyPercentage = recentRecords.length === 0 
        ? 0 
        : (recentRecords.filter(r => r.present).length / recentRecords.length) * 100;
      
      const updatedAttendance: WorkerAttendance = {
        totalDays: presentDays,
        bestStreak,
        records: updatedRecords,
        weeklyPercentage
      };
      
      setAttendance(updatedAttendance);
      if (onAttendanceUpdate) {
        onAttendanceUpdate(updatedAttendance);
      }
    } catch (error) {
      console.error("Ошибка при обновлении посещаемости:", error);
    } finally {
      setLoading(false);
      setShowReasonDialog(false);
      setSelectedDate(null);
    }
  };

  // Получаем даты последних 30-31 дней
  const getDaysInCalendar = () => {
    const days: string[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Получаем количество дней в текущем месяце
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push(date.toISOString().split('T')[0]);
    }
    
    return days;
  };
  
  const renderCalendarSquares = () => {
    const days = getDaysInCalendar();
    const records = attendance?.records || [];
    
    // Создаем мапу дат для быстрого поиска
    const recordMap = new Map<string, AttendanceRecord>();
    records.forEach(record => {
      recordMap.set(record.date, record);
    });
    
    return days.map(day => {
      const record = recordMap.get(day);
      const isPresent = record?.present;
      const bgColor = record 
        ? (isPresent ? '#2ecc71' : '#e74c3c') 
        : '#2c2c2c';
      const brightness = record ? '1' : '0.5';
      
      return (
        <div
          key={day}
          onClick={() => handleDateClick(day, record)}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            backgroundColor: bgColor,
            margin: '2px',
            cursor: isCurator || (!record?.present) ? 'pointer' : 'default',
            opacity: brightness,
            transition: 'transform 0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          title={record?.reason || (record?.present ? 'Присутствовал' : 'Отсутствовал')}
        >
          <span style={{ 
            fontSize: '10px', 
            color: 'white', 
            fontWeight: 'bold' 
          }}>
            {new Date(day).getDate()}
          </span>
        </div>
      );
    });
  };

  if (!attendance) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#9da3ae' }}>
        Данные о посещаемости отсутствуют
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px' 
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
            <span style={{ color: 'white' }}>{attendance.totalDays}</span>
            <span style={{ color: '#9da3ae', marginLeft: '4px' }}>Total</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            <span style={{ color: 'white' }}>{attendance.bestStreak}</span>
            <span style={{ color: '#9da3ae', marginLeft: '4px' }}>Best</span>
          </div>
        </div>
        <div style={{ 
          padding: '8px 12px', 
          borderRadius: '8px', 
          backgroundColor: '#1c1c1c',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          <span style={{ 
            color: getPercentageColor(attendance.weeklyPercentage)
          }}>
            {Math.round(attendance.weeklyPercentage)}%
          </span>
          <span style={{ color: '#9da3ae', marginLeft: '4px' }}>за неделю</span>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'flex-start',
        gap: '2px',
        margin: '0 auto',
        maxWidth: '300px'
      }}>
        {renderCalendarSquares()}
      </div>
      
      {isCurator && (
        <div style={{ 
          marginTop: '16px', 
          fontSize: '13px', 
          color: '#9da3ae',
          textAlign: 'center'
        }}>
          Нажмите на квадратик, чтобы изменить статус посещения
        </div>
      )}
      
      {/* Диалог выбора статуса */}
      {showSelectStatusDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1c1c1c',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: 'white', marginTop: 0, marginBottom: '16px' }}>
              Выберите статус
            </h3>
            
            <div style={{ 
              marginBottom: '16px',
              fontSize: '14px',
              color: '#9da3ae'
            }}>
              Дата: {selectedDate && new Date(selectedDate).toLocaleDateString('ru-RU')}
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '16px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button
                onClick={() => handleStatusSelect(true)}
                style={{
                  flex: '1',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Присутствие
              </button>
              
              <button
                onClick={() => handleStatusSelect(false)}
                style={{
                  flex: '1',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Отсутствие
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSelectStatusDialog(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Диалог для ввода причины отсутствия */}
      {showReasonDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1c1c1c',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: 'white', marginTop: 0, marginBottom: '16px' }}>
              Отметить отсутствие
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#9da3ae' }}>
                Дата: {selectedDate && new Date(selectedDate).toLocaleDateString('ru-RU')}
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label 
                  htmlFor="reason" 
                  style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '14px', 
                    color: '#9da3ae' 
                  }}
                >
                  Причина отсутствия (необязательно):
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#2c2c2c',
                    color: 'white',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '8px',
                    resize: 'vertical',
                    minHeight: '80px',
                    fontSize: '14px'
                  }}
                  placeholder="Введите причину..."
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setShowReasonDialog(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleReasonSubmit}
                disabled={loading}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: loading ? 'default' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  fontSize: '14px'
                }}
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Диалог просмотра причины отсутствия */}
      {showReasonViewDialog && selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1c1c1c',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: 'white', marginTop: 0, marginBottom: '16px' }}>
              Информация об отсутствии
            </h3>
            
            <div style={{ marginBottom: '8px', fontSize: '14px', color: '#9da3ae' }}>
              Дата: {new Date(selectedRecord.date).toLocaleDateString('ru-RU')}
            </div>
            
            <div style={{
              backgroundColor: '#2c2c2c',
              padding: '16px',
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#9da3ae',
                marginBottom: '4px' 
              }}>
                Причина:
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: 'white', 
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                minHeight: '40px'
              }}>
                {selectedRecord.reason || "Причина не указана"}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {isCurator && (
                <button
                  onClick={() => {
                    setShowReasonViewDialog(false);
                    setSelectedDate(selectedRecord.date);
                    setShowSelectStatusDialog(true);
                  }}
                  style={{
                    backgroundColor: '#76ABAE',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    marginRight: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Изменить
                </button>
              )}
              <button
                onClick={() => setShowReasonViewDialog(false)}
                style={{
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getPercentageColor(percentage: number): string {
  if (percentage >= 80) return '#2ecc71';
  if (percentage >= 50) return '#f39c12';
  return '#e74c3c';
} 