"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { UserRole } from "@/types";
import { LogOut, User, Info, Calendar, Shield } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      logout();
      router.push("/login");
    }, 500);
  };

  return (
    <div>
      {/* Заголовок */}
      <div style={{marginBottom: '24px'}}>
        <h1 style={{fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '8px'}}>
          Настройки
        </h1>
        <p style={{fontSize: '14px', color: '#9da3ae'}}>
          Управление профилем и информация о системе
        </p>
      </div>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px'}}>
        {/* Профиль пользователя */}
        <div style={{
          backgroundColor: '#141414',
          borderRadius: '12px',
          border: '1px solid #222',
          overflow: 'hidden'
        }}>
          <div style={{padding: '20px'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px'}}>
              <div>
                <div style={{fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '4px'}}>
                  Информация о профиле
                </div>
                <div style={{fontSize: '13px', color: '#9da3ae'}}>
                  Данные вашего аккаунта
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
                <User size={16} style={{color: '#9da3ae'}} />
              </div>
            </div>
            
            <div style={{marginBottom: '24px'}}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div>
                  <div style={{fontSize: '13px', color: '#9da3ae', marginBottom: '6px'}}>
                    Имя пользователя
                  </div>
                  <div style={{fontSize: '15px', color: 'white'}}>
                    {user?.username}
                  </div>
                </div>
                
                <div>
                  <div style={{fontSize: '13px', color: '#9da3ae', marginBottom: '6px'}}>
                    Роль
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Shield size={14} style={{color: user?.role === UserRole.ADMIN ? '#76ABAE' : '#9da3ae'}} />
                    <div style={{fontSize: '15px', color: 'white'}}>
                      {user?.role === UserRole.ADMIN ? "Администратор" : "Куратор"}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div style={{fontSize: '13px', color: '#9da3ae', marginBottom: '6px'}}>
                    Дата регистрации
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Calendar size={14} style={{color: '#9da3ae'}} />
                    <div style={{fontSize: '15px', color: 'white'}}>
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("ru-RU") : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleLogout} 
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                borderRadius: '8px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <LogOut size={14} />
              {loading ? "Выход..." : "Выйти из системы"}
            </button>
          </div>
        </div>
        
        {/* О системе */}
        <div style={{
          backgroundColor: '#141414',
          borderRadius: '12px',
          border: '1px solid #222',
          overflow: 'hidden'
        }}>
          <div style={{padding: '20px'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px'}}>
              <div>
                <div style={{fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '4px'}}>
                  О системе
                </div>
                <div style={{fontSize: '13px', color: '#9da3ae'}}>
                  Информация о Alpha CRM
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
                <Info size={16} style={{color: '#9da3ae'}} />
              </div>
            </div>
            
            <div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div>
                  <div style={{fontSize: '13px', color: '#9da3ae', marginBottom: '6px'}}>
                    Версия
                  </div>
                  <div style={{fontSize: '15px', color: 'white'}}>
                    1.0.0
                  </div>
                </div>
                
                <div>
                  <div style={{fontSize: '13px', color: '#9da3ae', marginBottom: '6px'}}>
                    Разработчик
                  </div>
                  <div style={{fontSize: '15px', color: 'white'}}>
                    Alpha Team
                  </div>
                </div>
                
                <div>
                  <div style={{fontSize: '13px', color: '#9da3ae', marginBottom: '6px'}}>
                    Техническая поддержка
                  </div>
                  <div style={{fontSize: '15px', color: 'white'}}>
                    support@alphacrm.ru
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 