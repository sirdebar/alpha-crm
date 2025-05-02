"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Worker, UserRole, WorkerCodeStats } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { 
  ChevronLeft, 
  Edit, 
  Trash, 
  ArrowUpRight, 
  User, 
  Calendar, 
  Code,
  Plus,
  BarChart
} from "lucide-react";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function WorkerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const workerId = params.id;
  
  const [worker, setWorker] = useState<Worker | null>(null);
  const [codeStats, setCodeStats] = useState<WorkerCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showAddCodes, setShowAddCodes] = useState(false);
  const [codesCount, setCodesCount] = useState<number>(1);
  const [addingCodes, setAddingCodes] = useState(false);
  
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
    async function loadWorkerData() {
      try {
        const workerData = await api.workers.getWorker(Number(workerId));
        setWorker(workerData);
        
        // Загружаем статистику кодов
        try {
          const stats = await api.codeStats.getWorkerStats(Number(workerId));
          setCodeStats(stats);
        } catch (error) {
          console.error("Ошибка при загрузке статистики кодов:", error);
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных работника:", error);
      } finally {
        setLoading(false);
      }
    }

    loadWorkerData();
  }, [workerId]);

  const handleAddCodes = async () => {
    if (codesCount < 1) {
      return;
    }
    
    setAddingCodes(true);
    try {
      await api.codeStats.addCodes(Number(workerId), codesCount);
      
      // Обновляем статистику
      const stats = await api.codeStats.getWorkerStats(Number(workerId));
      setCodeStats(stats);
      
      // Сбрасываем форму
      setShowAddCodes(false);
      setCodesCount(1);
    } catch (error) {
      console.error("Ошибка при добавлении кодов:", error);
    } finally {
      setAddingCodes(false);
    }
  };

  if (loading) {
    return (
      <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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

  if (!worker) {
    return (
      <div style={{textAlign: 'center', padding: '40px 20px'}}>
        <div style={{fontSize: '16px', color: 'white', marginBottom: '8px'}}>Работник не найден</div>
        <div style={{fontSize: '14px', color: '#9da3ae', marginBottom: '24px'}}>
          Возможно, он был удален или у вас нет прав доступа
        </div>
        <button 
          onClick={() => router.push('/dashboard/workers')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 16px',
            backgroundColor: '#1c1c1c',
            color: 'white',
            borderRadius: '8px',
            border: '1px solid #333',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={14} style={{marginRight: '8px'}} />
          Назад к списку
        </button>
      </div>
    );
  }

  // Форматирование данных для графика
  const chartData = codeStats?.hourlyData.map(item => ({
    hour: `${item.hour}:00`,
    total: item.total
  })) || [];

  return (
    <div>
      {/* Хлебные крошки и навигация */}
      <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px'}}>
        <button 
          onClick={() => router.push('/dashboard/workers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            backgroundColor: '#1c1c1c',
            border: 'none',
            cursor: 'pointer',
            marginRight: '14px'
          }}
        >
          <ChevronLeft size={16} style={{color: '#9da3ae'}} />
        </button>
        
        <div style={{flex: '1'}}>
          <div style={{
            fontSize: isMobile ? '16px' : '18px', 
            fontWeight: 'bold', 
            color: 'white'
          }}>
            {worker.username}
          </div>
          
          <div style={{display: 'flex', alignItems: 'center', marginTop: '4px'}}>
            <div style={{fontSize: '13px', color: '#9da3ae'}}>
              {worker.tag && `${worker.tag} • `}Куратор: {worker.curator?.username || 'Не назначен'}
            </div>
          </div>
        </div>
        
        {user?.role === UserRole.ADMIN && (
          <div style={{display: 'flex', gap: '8px'}}>
            <button 
              onClick={() => setShowAddCodes(!showAddCodes)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '34px',
                paddingLeft: '14px',
                paddingRight: '14px',
                borderRadius: '8px',
                backgroundColor: '#76ABAE',
                border: 'none',
                cursor: 'pointer',
                color: 'white',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <Plus size={16} style={{marginRight: '8px'}} />
              {isMobile ? '' : 'Добавить коды'}
            </button>
            
            <button 
              onClick={() => router.push(`/dashboard/workers/edit/${worker.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#1c1c1c',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Edit size={14} style={{color: '#9da3ae'}} />
            </button>
          </div>
        )}
      </div>
      
      {/* Форма добавления кодов */}
      {showAddCodes && user?.role === UserRole.ADMIN && (
        <div style={{
          backgroundColor: '#1c1c1c',
          borderRadius: '12px',
          border: '1px solid #333',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h3 style={{fontSize: '16px', fontWeight: '500', color: 'white', marginBottom: '12px'}}>
            Добавление кодов
          </h3>
          
          <div style={{display: 'flex', gap: '12px', alignItems: 'flex-end'}}>
            <div style={{flex: 1}}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                color: '#e0e0e0',
                marginBottom: '8px'
              }}>
                Количество кодов
              </label>
              <input 
                type="number" 
                min="1"
                value={codesCount}
                onChange={(e) => setCodesCount(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: '#141414',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '0 12px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <button 
              onClick={handleAddCodes}
              disabled={addingCodes || codesCount < 1}
              style={{
                height: '40px',
                paddingLeft: '16px',
                paddingRight: '16px',
                backgroundColor: '#76ABAE',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: addingCodes ? 'default' : 'pointer',
                opacity: addingCodes ? 0.7 : 1
              }}
            >
              {addingCodes ? 'Добавление...' : 'Добавить'}
            </button>
          </div>
        </div>
      )}
      
      {/* Основная информация */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: '#141414',
          borderRadius: '12px',
          border: '1px solid #222',
          padding: '16px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(118, 171, 174, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} style={{color: '#76ABAE'}} />
            </div>
            <div>
              <div style={{fontSize: '13px', color: '#9da3ae', marginBottom: '4px'}}>
                Имя
              </div>
              <div style={{fontSize: '16px', color: 'white', fontWeight: '500'}}>
                {worker.username}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#141414',
          borderRadius: '12px',
          border: '1px solid #222',
          padding: '16px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(118, 171, 174, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={18} style={{color: '#76ABAE'}} />
            </div>
            <div>
              <div style={{fontSize: '13px', color: '#9da3ae', marginBottom: '4px'}}>
                Дата добавления
              </div>
              <div style={{fontSize: '16px', color: 'white', fontWeight: '500'}}>
                {new Date(worker.createdAt).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#141414',
          borderRadius: '12px',
          border: '1px solid #222',
          padding: '16px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(118, 171, 174, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Code size={18} style={{color: '#76ABAE'}} />
            </div>
            <div>
              <div style={{fontSize: '13px', color: '#9da3ae', marginBottom: '4px'}}>
                Коды сегодня
              </div>
              <div style={{fontSize: '16px', color: 'white', fontWeight: '500'}}>
                {codeStats?.worker.codesCount || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* График кодов по часам */}
      {chartData && chartData.length > 0 && (
        <div style={{
          backgroundColor: '#141414',
          borderRadius: '12px',
          border: '1px solid #222',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div style={{padding: '16px', borderBottom: '1px solid #222'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <h2 style={{fontSize: '16px', fontWeight: 'bold', color: 'white'}}>
                Активность по часам
              </h2>
              <BarChart size={18} style={{color: '#9da3ae'}} />
            </div>
            <p style={{fontSize: '13px', color: '#9da3ae', marginTop: '4px'}}>
              Количество взятых кодов по часам за сегодня
            </p>
          </div>
          
          <div style={{height: '300px', padding: '16px'}}>
            {chartData.some(item => item.total > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
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
                </RechartsBarChart>
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
                <BarChart size={30} style={{color: '#333', marginBottom: '16px'}} />
                <p>Нет данных о кодах по часам за сегодня</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Описание работника */}
      {worker.description && (
        <div style={{
          backgroundColor: '#141414',
          borderRadius: '12px',
          border: '1px solid #222',
          padding: '16px'
        }}>
          <h2 style={{fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '12px'}}>
            Описание
          </h2>
          <p style={{fontSize: '14px', color: '#e0e0e0', lineHeight: '1.5'}}>
            {worker.description}
          </p>
        </div>
      )}
    </div>
  );
} 