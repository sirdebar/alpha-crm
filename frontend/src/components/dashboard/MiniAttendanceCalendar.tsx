"use client";

import React, { useState } from 'react';
import { AttendanceRecord, WorkerAttendance } from '@/types';

interface MiniAttendanceCalendarProps {
  attendance: WorkerAttendance;
}

export default function MiniAttendanceCalendar({ attendance }: MiniAttendanceCalendarProps) {
  const [showReasonDialog, setShowReasonDialog] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  // Получаем даты текущего месяца
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
  
  // Создаем мапу дат посещаемости для быстрого поиска
  const createAttendanceMap = () => {
    const map = new Map<string, AttendanceRecord>();
    attendance.records.forEach(record => {
      map.set(record.date, record);
    });
    return map;
  };

  const handleDayClick = (record?: AttendanceRecord) => {
    if (record && !record.present) {
      setSelectedRecord(record);
      setShowReasonDialog(true);
    }
  };
  
  const renderCalendarSquares = () => {
    const days = getDaysInCalendar();
    const attendanceMap = createAttendanceMap();
    
    return days.map(day => {
      const record = attendanceMap.get(day);
      const isPresent = record ? record.present : undefined;
      const bgColor = record 
        ? (isPresent ? '#2ecc71' : '#e74c3c') 
        : '#2c2c2c';
      const brightness = record ? '1' : '0.5';
      
      return (
        <div
          key={day}
          onClick={() => handleDayClick(record)}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            backgroundColor: bgColor,
            margin: '2px',
            opacity: brightness,
            cursor: record && !record.present ? 'pointer' : 'default',
          }}
        />
      );
    });
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px',
        padding: '0 4px' 
      }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '2px' }}>
            <span style={{ color: 'white' }}>{attendance.totalDays}</span>
            <span style={{ color: '#9da3ae', marginLeft: '4px', fontSize: '13px' }}>Total</span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 'bold' }}>
            <span style={{ color: 'white' }}>{attendance.bestStreak}</span>
            <span style={{ color: '#9da3ae', marginLeft: '4px', fontSize: '13px' }}>Best</span>
          </div>
        </div>
        <div style={{ 
          padding: '4px 8px', 
          borderRadius: '6px', 
          backgroundColor: '#1c1c1c',
          fontSize: '13px',
          fontWeight: 'bold'
        }}>
          <span style={{ 
            color: getPercentageColor(attendance.weeklyPercentage)
          }}>
            {Math.round(attendance.weeklyPercentage)}%
          </span>
          <span style={{ color: '#9da3ae', marginLeft: '4px', fontSize: '12px' }}>за неделю</span>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'flex-start',
        gap: '2px',
        margin: '0 auto',
        maxWidth: '250px'
      }}>
        {renderCalendarSquares()}
      </div>

      {/* Диалог просмотра причины отсутствия */}
      {showReasonDialog && selectedRecord && (
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
            padding: '20px',
            width: '90%',
            maxWidth: '350px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '16px' }}>
              Информация об отсутствии
            </h3>
            
            <div style={{ marginBottom: '8px', fontSize: '13px', color: '#9da3ae' }}>
              Дата: {new Date(selectedRecord.date).toLocaleDateString('ru-RU')}
            </div>
            
            <div style={{
              backgroundColor: '#2c2c2c',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              <div style={{ 
                fontSize: '13px', 
                color: '#9da3ae',
                marginBottom: '4px' 
              }}>
                Причина:
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: 'white', 
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                minHeight: '30px'
              }}>
                {selectedRecord.reason || "Причина не указана"}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowReasonDialog(false)}
                style={{
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '13px'
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