"use client";

import { useEffect, useState } from "react";
import { TopWorker, CodeHourlyStats, UserRole } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Users, BarChart3, Trophy, Clock, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CodeStatsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hourlyStats, setHourlyStats] = useState<CodeHourlyStats[]>([]);
  const [topWorkers, setTopWorkers] = useState<TopWorker[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

  useEffect(() => {
    async function loadStats() {
      try {
        const [hourly, top] = await Promise.all([
          api.codeStats.getDailyHourlyStats(),
          api.codeStats.getTopWorkersToday()
        ]);
        
        setHourlyStats(hourly || []);
        setTopWorkers(top || []);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Ошибка при загрузке статистики кодов:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();

    // Обновляем статистику каждую минуту
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Функция для обновления статистики вручную
  const refreshStats = async () => {
    try {
      setRefreshing(true);
      const [hourly, top] = await Promise.all([
        api.codeStats.getDailyHourlyStats(),
        api.codeStats.getTopWorkersToday()
      ]);
      
      setHourlyStats(hourly || []);
      setTopWorkers(top || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Ошибка при загрузке статистики кодов:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: '2px solid rgba(118, 171, 174, 0.2)',
          borderTopColor: '#76ABAE',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Форматирование данных для графика
  const chartData = hourlyStats.map(item => ({
    hour: `${item.hour}:00`,
    total: item.total
  }));

  return (
    <div>
      {/* Заголовок */}
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '18px' : '20px', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '8px'
          }}>
            Статистика кодов
          </h1>
          <p style={{fontSize: '14px', color: '#9da3ae'}}>
            Мониторинг получения кодов за текущий день
            {lastUpdated && (
              <span> • Обновлено: {lastUpdated.toLocaleTimeString()}</span>
            )}
          </p>
        </div>
        
        <button
          onClick={refreshStats}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1c1c1c',
            border: '1px solid #333',
            borderRadius: '8px',
            color: 'white',
            padding: '8px 12px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <RefreshCw 
            size={16} 
            style={{
              marginRight: '8px',
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }} 
          />
          Обновить
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </button>
      </div>

      <div style={{
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr', 
        gap: '20px'
      }}>
        {/* Левая колонка - Топ работников */}
        <div style={{
          backgroundColor: '#141414',
          borderRadius: '12px',
          border: '1px solid #222',
          overflow: 'hidden',
          width: isMobile ? '100%' : '320px'
        }}>
          <div style={{padding: '16px', borderBottom: '1px solid #222'}}>
            <div style={{
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <h2 style={{fontSize: '16px', fontWeight: 'bold', color: 'white'}}>
                Топ по кодам
              </h2>
              <Trophy size={18} style={{color: '#9da3ae'}} />
            </div>
            <p style={{fontSize: '13px', color: '#9da3ae'}}>
              Лучшие работники сегодня
            </p>
          </div>
          
          <div style={{maxHeight: '500px', overflowY: 'auto'}}>
            {topWorkers.length > 0 ? (
              <div>
                {topWorkers.map((worker, index) => (
                  <div 
                    key={worker.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: index < topWorkers.length - 1 ? '1px solid #1c1c1c' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => router.push(`/dashboard/workers/${worker.id}`)}
                  >
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      backgroundColor: index < 3 ? 'rgba(118, 171, 174, 0.1)' : 'rgba(45, 45, 45, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: index < 3 ? '#76ABAE' : '#9da3ae',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      marginRight: '14px'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: 'white',
                        marginBottom: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {worker.username}
                      </div>
                      <div style={{
                        fontSize: '12px', 
                        color: '#9da3ae',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {worker.tag && `${worker.tag} • `}Куратор: {worker.curatorName}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      color: index < 3 ? '#76ABAE' : 'white',
                      marginLeft: '10px'
                    }}>
                      {worker.codesCount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '30px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9da3ae',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                <Trophy size={30} style={{color: '#333', marginBottom: '16px'}} />
                <p>Нет данных о кодах за сегодня</p>
              </div>
            )}
          </div>
        </div>

        {/* Правая колонка - График */}
        <div style={{
          backgroundColor: '#141414',
          borderRadius: '12px',
          border: '1px solid #222',
          overflow: 'hidden',
          height: isMobile ? 'auto' : '500px'
        }}>
          <div style={{padding: '16px', borderBottom: '1px solid #222'}}>
            <div style={{
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <h2 style={{fontSize: '16px', fontWeight: 'bold', color: 'white'}}>
                Распределение по часам
              </h2>
              <Clock size={18} style={{color: '#9da3ae'}} />
            </div>
            <p style={{fontSize: '13px', color: '#9da3ae'}}>
              Количество кодов, взятых по часам за сегодня
            </p>
          </div>
          
          <div style={{height: isMobile ? '300px' : '414px', padding: '16px'}}>
            {chartData.length > 0 && chartData.some(item => item.total > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#9da3ae"
                    tick={{fontSize: 12}}
                    interval={isMobile ? 3 : 1}
                  />
                  <YAxis 
                    stroke="#9da3ae" 
                    tick={{fontSize: 12}}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1c1c1c', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    formatter={(value) => [`${value} кодов`, 'Количество']}
                  />
                  <Bar 
                    dataKey="total" 
                    name="Количество кодов" 
                    fill="#76ABAE" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#9da3ae',
                fontSize: '14px',
                flexDirection: 'column',
                textAlign: 'center'
              }}>
                <BarChart3 size={30} style={{color: '#333', marginBottom: '16px'}} />
                <p>Нет данных о кодах по часам за сегодня</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 