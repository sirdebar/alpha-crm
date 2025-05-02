"use client";

import { useEffect, useState } from "react";
import { UserRole, CuratorStats, GeneralStats } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Calendar, Users, BarChart3 } from "lucide-react";

export default function StatisticsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [curatorStats, setCuratorStats] = useState<CuratorStats | null>(null);
  const [generalStats, setGeneralStats] = useState<GeneralStats | null>(null);
  const [isMobile, setIsMobile] = useState(false);

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
        if (user?.role === UserRole.ADMIN) {
          try {
            const stats = await api.statistics.getGeneral();
            setGeneralStats(stats);
          } catch (adminError) {
            console.error("Ошибка при загрузке общей статистики:", adminError);
            setGeneralStats({
              totalCurators: 0,
              totalWorkers: 0
            });
          }
        } else {
          try {
            const stats = await api.statistics.getCurator();
            setCuratorStats(stats || {
              curatorName: user?.username || '',
              totalWorkers: 0,
              daysInTeam: 0,
              chartData: []
            });
          } catch (curatorError) {
            console.error("Ошибка при загрузке статистики куратора:", curatorError);
            setCuratorStats({
              curatorName: user?.username || '',
              totalWorkers: 0,
              daysInTeam: 0,
              chartData: []
            });
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке статистики:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user]);

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
  let chartData: Array<{ date: string; count: number }> = [];
  if (curatorStats?.chartData) {
    // Сортировка по дате для правильного отображения графика
    chartData = curatorStats.chartData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        date: new Date(item.date).toLocaleDateString('ru-RU'),
        count: item.count
      }));
  }

  return (
    <div>
      {/* Заголовок */}
      <div style={{marginBottom: '24px'}}>
        <h1 style={{
          fontSize: isMobile ? '18px' : '20px', 
          fontWeight: 'bold', 
          color: 'white', 
          marginBottom: '8px'
        }}>
          Статистика
        </h1>
        <p style={{fontSize: '14px', color: '#9da3ae'}}>
          {user?.role === UserRole.ADMIN 
            ? 'Общая статистика по системе' 
            : 'Ваша личная статистика'
          }
        </p>
      </div>

      {user?.role === UserRole.ADMIN && generalStats ? (
        <div style={{
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
          gap: '16px'
        }}>
          <div style={{
            backgroundColor: '#141414',
            borderRadius: '12px',
            border: '1px solid #222',
            overflow: 'hidden'
          }}>
            <div style={{padding: '16px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(118, 171, 174, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={20} style={{color: '#76ABAE'}} />
                </div>
                <div>
                  <div style={{fontSize: '14px', color: '#9da3ae', marginBottom: '4px'}}>
                    Всего кураторов
                  </div>
                  <div style={{fontSize: '24px', fontWeight: 'bold', color: 'white'}}>
                    {generalStats.totalCurators}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#141414',
            borderRadius: '12px',
            border: '1px solid #222',
            overflow: 'hidden'
          }}>
            <div style={{padding: '16px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(118, 171, 174, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={20} style={{color: '#76ABAE'}} />
                </div>
                <div>
                  <div style={{fontSize: '14px', color: '#9da3ae', marginBottom: '4px'}}>
                    Всего работников
                  </div>
                  <div style={{fontSize: '24px', fontWeight: 'bold', color: 'white'}}>
                    {generalStats.totalWorkers}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : curatorStats ? (
        <div>
          <div style={{
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '16px', 
            marginBottom: '20px'
          }}>
            <div style={{
              backgroundColor: '#141414',
              borderRadius: '12px',
              border: '1px solid #222',
              overflow: 'hidden'
            }}>
              <div style={{padding: '16px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(118, 171, 174, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Users size={20} style={{color: '#76ABAE'}} />
                  </div>
                  <div>
                    <div style={{fontSize: '14px', color: '#9da3ae', marginBottom: '4px'}}>
                      Ваши работники
                    </div>
                    <div style={{fontSize: '24px', fontWeight: 'bold', color: 'white'}}>
                      {curatorStats.totalWorkers}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#141414',
              borderRadius: '12px',
              border: '1px solid #222',
              overflow: 'hidden'
            }}>
              <div style={{padding: '16px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(118, 171, 174, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Calendar size={20} style={{color: '#76ABAE'}} />
                  </div>
                  <div>
                    <div style={{fontSize: '14px', color: '#9da3ae', marginBottom: '4px'}}>
                      Дней в команде
                    </div>
                    <div style={{fontSize: '24px', fontWeight: 'bold', color: 'white'}}>
                      {curatorStats.daysInTeam}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#141414',
            borderRadius: '12px',
            border: '1px solid #222',
            overflow: 'hidden'
          }}>
            <div style={{padding: isMobile ? '16px' : '20px'}}>
              <div style={{
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center', 
                justifyContent: 'space-between', 
                marginBottom: '16px',
                gap: isMobile ? '12px' : '0'
              }}>
                <div>
                  <div style={{fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '4px'}}>
                    График привлечения работников
                  </div>
                  <div style={{fontSize: '13px', color: '#9da3ae'}}>
                    Динамика добавления новых работников по дням
                  </div>
                </div>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: '#1c1c1c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BarChart3 size={16} style={{color: '#9da3ae'}} />
                </div>
              </div>
              
              <div style={{height: isMobile ? '250px' : '300px'}}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: isMobile ? 10 : 30,
                        left: isMobile ? 10 : 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9da3ae"
                        tick={{fontSize: isMobile ? 10 : 12}}
                      />
                      <YAxis 
                        stroke="#9da3ae" 
                        tick={{fontSize: isMobile ? 10 : 12}}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1c1c1c', 
                          border: '1px solid #333',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="Количество работников" 
                        stroke="#76ABAE" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#9da3ae',
                    fontSize: '14px'
                  }}>
                    Нет данных для отображения
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
} 