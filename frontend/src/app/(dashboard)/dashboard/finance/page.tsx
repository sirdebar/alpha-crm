"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { UserRole } from "@/types";
import CuratorFinancePanel from "@/components/finance/CuratorFinancePanel";
import TopCuratorsPanel from "@/components/finance/TopCuratorsPanel";
import CuratorsFinanceTable from "@/components/finance/CuratorsFinanceTable";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { getMyCuratorFinanceHistory } from "@/lib/finance-api";

export default function FinancePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  
  // Проверка мобильного устройства
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
  
  // Загрузка истории финансов для куратора
  useEffect(() => {
    const loadFinanceHistory = async () => {
      if (user?.role === UserRole.CURATOR) {
        try {
          setLoading(true);
          const history = await getMyCuratorFinanceHistory(6);
          
          // Проверяем, что history - это массив
          if (Array.isArray(history)) {
            // Преобразуем данные для графика
            const chartData = history.map(record => {
              const date = new Date(record.month);
              const monthName = date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
              
              return {
                name: monthName,
                profit: record.profit,
                expenses: record.expenses,
                netProfit: record.profit - record.expenses
              };
            });
            
            setHistoryData(chartData);
          } else {
            console.error('Неожиданный формат данных истории финансов:', history);
          }
        } catch (error) {
          console.error('Ошибка при загрузке истории финансов:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadFinanceHistory();
  }, [user]);
  
  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#9da3ae' }}>
        Загрузка...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '24px',
        color: 'white'
      }}>
        Финансы
      </h1>
      
      {/* Куратор видит свою финансовую панель и график истории */}
      {user.role === UserRole.CURATOR && (
        <>
          <CuratorFinancePanel userRole={user.role} />
          
          {historyData.length > 0 && (
            <div style={{
              backgroundColor: '#141414',
              borderRadius: '12px',
              border: '1px solid #222',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '16px', color: '#9da3ae', marginBottom: '16px' }}>
                История финансов за последние 6 месяцев
              </div>
              
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={historyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#9da3ae' }}
                    />
                    <YAxis 
                      tick={{ fill: '#9da3ae' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1c1c1c', 
                        border: '1px solid #333',
                        color: 'white'
                      }}
                      formatter={(value: any) => [`$${value}`, '']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      name="Профит" 
                      stroke="#4CAF50" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      name="Затраты" 
                      stroke="#FF5555" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netProfit" 
                      name="Чистая прибыль" 
                      stroke="#76ABAE" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Админ видит топ кураторов и радарную диаграмму */}
      {user.role === UserRole.ADMIN && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <TopCuratorsPanel userRole={user.role} />
          
          {/* Радарная диаграмма для админа */}
          <div style={{
            backgroundColor: '#141414',
            borderRadius: '12px',
            border: '1px solid #222',
            padding: '20px'
          }}>
            <div style={{ fontSize: '16px', color: '#9da3ae', marginBottom: '16px' }}>
              Распределение профита кураторов
            </div>
            
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                  { subject: 'Профит', A: 120, B: 110, fullMark: 150 },
                  { subject: 'Затраты', A: 98, B: 130, fullMark: 150 },
                  { subject: 'Работники', A: 86, B: 130, fullMark: 150 },
                  { subject: 'Активность', A: 99, B: 100, fullMark: 150 },
                  { subject: 'Рост', A: 85, B: 90, fullMark: 150 },
                  { subject: 'Эффективность', A: 65, B: 85, fullMark: 150 },
                ]}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis 
                    dataKey="subject"
                    tick={{ fill: "#9da3ae", fontSize: 12 }} 
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 150]}
                    tick={{ fill: "#9da3ae", fontSize: 10 }}
                  />
                  <Radar 
                    name="Топ куратор"
                    dataKey="A" 
                    stroke="#FFD700" 
                    fill="#FFD700" 
                    fillOpacity={0.3} 
                  />
                  <Radar 
                    name="Средний показатель"
                    dataKey="B" 
                    stroke="#76ABAE" 
                    fill="#76ABAE" 
                    fillOpacity={0.3} 
                  />
                  <Legend />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1c1c1c', 
                      border: '1px solid #333',
                      color: 'white' 
                    }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      {/* Таблица с финансами всех кураторов для админа */}
      {user.role === UserRole.ADMIN && (
        <CuratorsFinanceTable userRole={user.role} />
      )}
    </div>
  );
}