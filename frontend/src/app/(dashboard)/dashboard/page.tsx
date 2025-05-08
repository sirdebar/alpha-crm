"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { UserRole } from "@/types";
import { api } from "@/lib/api";
import { User, Users, Calendar } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalWorkers: 0,
    totalCurators: 0,
    daysInTeam: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
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
          const generalStats = await api.statistics.getGeneral();
          setStats({
            totalWorkers: generalStats.totalWorkers,
            totalCurators: generalStats.totalCurators,
            daysInTeam: 0, // Для админа не показываем
          });
        } else {
          try {
            const curatorStats = await api.statistics.getCurator();
            setStats({
              totalWorkers: curatorStats?.totalWorkers || 0,
              totalCurators: 0, // Для эйчара не показываем
              daysInTeam: curatorStats?.daysInTeam || 0,
            });
          } catch (curatorError) {
            console.error("Ошибка при загрузке статистики эйчара:", curatorError);
            setStats({
              totalWorkers: 0,
              totalCurators: 0,
              daysInTeam: 0,
            });
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке статистики:", error);
        setStats({
          totalWorkers: 0,
          totalCurators: 0,
          daysInTeam: 0,
        });
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

  return (
    <div>
      <div style={{marginBottom: '20px'}}>
        <h1 style={{
          fontSize: isMobile ? '18px' : '20px', 
          fontWeight: 'bold', 
          color: 'white', 
          marginBottom: '8px'
        }}>
          Панель управления
        </h1>
        <p style={{fontSize: '14px', color: '#9da3ae'}}>
          Добро пожаловать, {user?.username}!
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile 
          ? '1fr' 
          : 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {user?.role === UserRole.ADMIN && (
          <div style={{
            backgroundColor: '#141414',
            borderRadius: '12px',
            border: '1px solid #222',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '3px',
              width: '40%',
              backgroundColor: '#76ABAE'
            }}></div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{fontSize: '14px', color: '#9da3ae'}}>
                Количество эйчаров
              </div>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(118, 171, 174, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users style={{width: '18px', height: '18px', color: '#76ABAE'}} />
              </div>
            </div>
            
            <div style={{fontSize: '28px', fontWeight: 'bold', color: 'white'}}>
              {stats.totalCurators}
            </div>
            <div style={{fontSize: '12px', color: '#9da3ae', marginTop: '4px'}}>
              Активных эйчаров в системе
            </div>
          </div>
        )}

        <div style={{
          backgroundColor: '#141414',
          borderRadius: '12px',
          border: '1px solid #222',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '3px',
            width: '40%',
            backgroundColor: '#76ABAE'
          }}></div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{fontSize: '14px', color: '#9da3ae'}}>
              Количество холодок
            </div>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(118, 171, 174, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User style={{width: '18px', height: '18px', color: '#76ABAE'}} />
            </div>
          </div>
          
          <div style={{fontSize: '28px', fontWeight: 'bold', color: 'white'}}>
            {stats.totalWorkers}
          </div>
          <div style={{fontSize: '12px', color: '#9da3ae', marginTop: '4px'}}>
            {user?.role === UserRole.ADMIN 
              ? "Всего холодок в системе" 
              : "Ваших холодок в системе"}
          </div>
        </div>

        {user?.role === UserRole.CURATOR && (
          <div style={{
            backgroundColor: '#141414',
            borderRadius: '12px',
            border: '1px solid #222',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '3px',
              width: '40%',
              backgroundColor: '#76ABAE'
            }}></div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{fontSize: '14px', color: '#9da3ae'}}>
                Дней в команде
              </div>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(118, 171, 174, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar style={{width: '18px', height: '18px', color: '#76ABAE'}} />
              </div>
            </div>
            
            <div style={{fontSize: '28px', fontWeight: 'bold', color: 'white'}}>
              {stats.daysInTeam}
            </div>
            <div style={{fontSize: '12px', color: '#9da3ae', marginTop: '4px'}}>
              Ваш стаж работы
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 