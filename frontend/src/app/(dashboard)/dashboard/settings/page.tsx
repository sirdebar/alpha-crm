"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { UserProfile, UserRole } from "@/types";
import { LogOut, User, Info, Calendar, Shield, Camera, Link as LinkIcon, Save, X, Check } from "lucide-react";
import { api } from "@/lib/api";

const API_URL = 'http://localhost:3001';

export default function SettingsPage() {
  const { user, logout, setUser } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    avatarUrl: '',
    contactLinks: ['', '']
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Загрузка данных профиля
  useEffect(() => {
    async function loadProfile() {
      try {
        const profileData = await api.profile.getProfile();
        setProfile({
          avatarUrl: profileData.avatarUrl || '',
          contactLinks: profileData.contactLinks || ['', '']
        });
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
      }
    }

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Проверка на тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение.');
      return;
    }
    
    try {
      setSavingProfile(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const result = await api.profile.uploadAvatar(formData);
      
      // Обновляем состояние
      setProfile(prev => ({
        ...prev,
        avatarUrl: result.avatarUrl
      }));
      
      // Обновляем данные пользователя
      if (user) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            avatarUrl: result.avatarUrl
          }
        });
      }
    } catch (error) {
      console.error('Ошибка при загрузке аватарки:', error);
      alert('Не удалось загрузить аватарку. Пожалуйста, попробуйте снова.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleContactLinkChange = (index: number, value: string) => {
    const newLinks = [...(profile.contactLinks || ['', ''])];
    newLinks[index] = value;
    setProfile(prev => ({
      ...prev,
      contactLinks: newLinks
    }));
  };

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      
      // Валидация ссылок
      const validLinks = profile.contactLinks?.filter(link => 
        link.trim() !== '' && (link.startsWith('http://') || link.startsWith('https://'))
      ) || [];
      
      const updatedProfile = await api.profile.updateProfile({
        contactLinks: validLinks
      });
      
      // Обновляем данные пользователя
      if (user) {
        setUser({
          ...user,
          profile: updatedProfile
        });
      }
      
      alert('Профиль успешно обновлен!');
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
      alert('Не удалось сохранить профиль. Пожалуйста, попробуйте снова.');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    // Валидация
    if (!currentPassword) {
      setPasswordError('Введите текущий пароль');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('Введите новый пароль');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    try {
      setSavingPassword(true);
      await api.auth.updatePassword(currentPassword, newPassword);
      setPasswordSuccess('Пароль успешно изменен');
      
      // Очищаем поля
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Скрываем форму через 2 секунды
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Ошибка при смене пароля:', error);
      setPasswordError('Не удалось изменить пароль. Проверьте правильность текущего пароля.');
    } finally {
      setSavingPassword(false);
    }
  };

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
        <h1 style={{
          fontSize: isMobile ? '18px' : '20px', 
          fontWeight: 'bold', 
          color: 'white', 
          marginBottom: '8px'
        }}>
          Настройки
        </h1>
        <p style={{fontSize: '14px', color: '#9da3ae'}}>
          Управление профилем и информация о системе
        </p>
      </div>
      
      <div style={{
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '20px'
      }}>
        {/* Профиль пользователя */}
        <div style={{
          backgroundColor: '#141414',
          borderRadius: '12px',
          border: '1px solid #222',
          overflow: 'hidden'
        }}>
          <div style={{padding: isMobile ? '16px' : '20px'}}>
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
                {/* Аватарка */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: profile.avatarUrl ? 'transparent' : '#76ABAE',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundImage: profile.avatarUrl ? `url(${API_URL}${profile.avatarUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}>
                    {!profile.avatarUrl && user?.username ? user.username.substring(0, 2).toUpperCase() : null}
                    
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        border: 'none',
                        padding: '6px 0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '12px'
                      }}
                    >
                      <Camera size={14} />
                      {savingProfile ? 'Загрузка...' : 'Изменить'}
                    </button>
                  </div>
                </div>
                
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
                
                {/* Контакты */}
                <div>
                  <div style={{fontSize: '13px', color: '#9da3ae', marginBottom: '10px'}}>
                    Контактные ссылки (максимум 2)
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {[0, 1].map(index => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%'
                      }}>
                        <LinkIcon size={14} style={{color: '#9da3ae', flexShrink: 0}} />
                        <input 
                          type="text"
                          value={profile.contactLinks?.[index] || ''}
                          onChange={(e) => handleContactLinkChange(index, e.target.value)}
                          placeholder="https://example.com"
                          style={{
                            backgroundColor: '#1c1c1c',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '13px',
                            height: '32px',
                            width: '100%',
                            padding: '0 10px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#9da3ae',
                    marginTop: '6px'
                  }}>
                    Ссылки должны начинаться с http:// или https://
                  </div>
                </div>
                
                <button 
                  onClick={saveProfile}
                  disabled={savingProfile}
                  style={{
                    backgroundColor: 'rgba(118, 171, 174, 0.1)',
                    color: '#76ABAE',
                    border: '1px solid rgba(118, 171, 174, 0.2)',
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
                  <Save size={14} />
                  {savingProfile ? "Сохранение..." : "Сохранить изменения"}
                </button>
                
                {/* Смена пароля */}
                {!showPasswordForm ? (
                  <button 
                    onClick={() => setShowPasswordForm(true)}
                    style={{
                      backgroundColor: '#1c1c1c',
                      color: 'white',
                      border: '1px solid #333',
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
                    Сменить пароль
                  </button>
                ) : (
                  <div style={{
                    backgroundColor: '#1c1c1c',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '16px',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <div style={{fontSize: '14px', fontWeight: '500', color: 'white'}}>
                        Смена пароля
                      </div>
                      <button 
                        onClick={() => setShowPasswordForm(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#9da3ae',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div>
                        <div style={{fontSize: '12px', color: '#9da3ae', marginBottom: '6px'}}>
                          Текущий пароль
                        </div>
                        <input 
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          style={{
                            backgroundColor: '#141414',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '13px',
                            height: '32px',
                            width: '100%',
                            padding: '0 10px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      <div>
                        <div style={{fontSize: '12px', color: '#9da3ae', marginBottom: '6px'}}>
                          Новый пароль
                        </div>
                        <input 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={{
                            backgroundColor: '#141414',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '13px',
                            height: '32px',
                            width: '100%',
                            padding: '0 10px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      <div>
                        <div style={{fontSize: '12px', color: '#9da3ae', marginBottom: '6px'}}>
                          Подтвердите новый пароль
                        </div>
                        <input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          style={{
                            backgroundColor: '#141414',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '13px',
                            height: '32px',
                            width: '100%',
                            padding: '0 10px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      {passwordError && (
                        <div style={{
                          fontSize: '12px',
                          color: '#f87171',
                          padding: '6px',
                          backgroundColor: 'rgba(220, 38, 38, 0.1)',
                          borderRadius: '4px'
                        }}>
                          {passwordError}
                        </div>
                      )}
                      
                      {passwordSuccess && (
                        <div style={{
                          fontSize: '12px',
                          color: '#34d399',
                          padding: '6px',
                          backgroundColor: 'rgba(52, 211, 153, 0.1)',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Check size={14} />
                          {passwordSuccess}
                        </div>
                      )}
                      
                      <button 
                        onClick={changePassword}
                        disabled={savingPassword}
                        style={{
                          backgroundColor: 'rgba(118, 171, 174, 0.1)',
                          color: '#76ABAE',
                          border: '1px solid rgba(118, 171, 174, 0.2)',
                          borderRadius: '6px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        {savingPassword ? "Сохранение..." : "Сохранить пароль"}
                      </button>
                    </div>
                  </div>
                )}
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
          <div style={{padding: isMobile ? '16px' : '20px'}}>
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
                  <div style={{fontSize: '15px', color: 'white', wordBreak: 'break-word'}}>
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