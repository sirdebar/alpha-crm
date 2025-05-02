"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole, User as UserType } from "@/types";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { UserPlus, Trash2, X, Calendar, Users as UsersIcon, Search, Plus } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteUsername, setDeleteUsername] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: UserRole.CURATOR,
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
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
    // Проверяем, что пользователь - админ
    if (user?.role !== UserRole.ADMIN) {
      router.push("/dashboard");
      return;
    }
    
    // Загружаем список пользователей
    async function loadUsers() {
      try {
        const userData = await api.users.getAll();
        setUsers(userData);
      } catch (err) {
        console.error("Ошибка при загрузке пользователей:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [router, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: UserRole) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleDeleteUser = async () => {
    try {
      await api.users.deactivate(deleteUsername);
      setUsers((prevUsers) => 
        prevUsers.map((user) => 
          user.username === deleteUsername ? { ...user, isActive: false } : user
        )
      );
      setShowDeleteDialog(false);
      setDeleteUsername("");
    } catch (err) {
      console.error("Ошибка при удалении пользователя:", err);
      setError(err instanceof Error ? err.message : "Ошибка при удалении пользователя");
    }
  };

  const handleCreateUser = async () => {
    try {
      setError("");
      if (!formData.username || !formData.password) {
        setError("Заполните все обязательные поля");
        return;
      }
      
      const newUser = await api.users.create(formData.username, formData.password, formData.role);
      setUsers((prev) => [...prev, newUser]);
      setFormData({ username: "", password: "", role: UserRole.CURATOR });
      setShowCreateDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании пользователя");
    }
  };

  // Фильтрация активных кураторов для отображения в таблице
  const filteredUsers = users
    .filter(user => user.isActive)
    .filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
      {/* Заголовок и поиск */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: '24px',
        gap: isMobile ? '16px' : '0'
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '18px' : '20px', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '8px'
          }}>
            Управление сотрудниками
          </h1>
          <p style={{fontSize: '14px', color: '#9da3ae'}}>
            Всего активных сотрудников: {filteredUsers.length}
          </p>
        </div>
        
        <div style={{
          display: 'flex', 
          gap: '12px',
          width: isMobile ? '100%' : 'auto'
        }}>
          {/* Поиск */}
          <div style={{
            position: 'relative',
            flex: isMobile ? 1 : 'none'
          }}>
            <input
              type="text"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: '#1c1c1c',
                border: '1px solid #333',
                borderRadius: '8px',
                color: 'white',
                fontSize: '13px',
                height: '36px',
                width: '100%',
                paddingLeft: '36px',
                paddingRight: '12px',
                outline: 'none'
              }}
            />
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '15px',
              height: '15px',
              color: '#9da3ae'
            }} />
          </div>
          
          {/* Кнопка добавления */}
          <button 
            style={{
              backgroundColor: '#76ABAE',
              color: 'white',
              borderRadius: '8px',
              fontSize: '13px',
              padding: '0 16px',
              height: '36px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus size={16} />
            {!isMobile && 'Добавить'}
          </button>
        </div>
      </div>
      
      {/* Карточка со списком пользователей */}
      <div style={{
        backgroundColor: '#141414',
        borderRadius: '12px',
        border: '1px solid #222',
        overflow: 'hidden'
      }}>
        {/* Заголовок таблицы (скрыт на мобильных) */}
        {!isMobile && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 130px 80px',
            padding: '16px 20px',
            borderBottom: '1px solid #222',
            fontSize: '13px',
            fontWeight: '500',
            color: '#9da3ae'
          }}>
            <div>Имя сотрудника</div>
            <div>Работники</div>
            <div>Дней в команде</div>
            <div>Действия</div>
          </div>
        )}
        
        {/* Тело таблицы */}
        <div>
          {filteredUsers.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#9da3ae',
              fontSize: '14px'
            }}>
              Нет активных сотрудников
            </div>
          ) : (
            filteredUsers.map((userItem) => {
              const createdAt = new Date(userItem.createdAt);
              const now = new Date();
              const daysInTeam = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
              
              if (isMobile) {
                // Мобильный вид - карточками
                return (
                  <div 
                    key={userItem.id}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #222',
                      fontSize: '14px',
                      color: 'white'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: userItem.role === UserRole.ADMIN ? '#76ABAE' : '#333',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: 'white'
                        }}>
                          {userItem.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div>{userItem.username}</div>
                          <div style={{fontSize: '12px', color: '#9da3ae'}}>
                            {userItem.role === UserRole.ADMIN ? 'Администратор' : 'Куратор'}
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        style={{
                          backgroundColor: 'rgba(220, 38, 38, 0.1)',
                          color: '#f87171',
                          border: 'none',
                          borderRadius: '6px',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setDeleteUsername(userItem.username);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      fontSize: '13px',
                      color: '#9da3ae'
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                        <UsersIcon size={14} />
                        <span>{userItem.workers?.length || 0} работников</span>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                        <Calendar size={14} />
                        <span>{daysInTeam} дней</span>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Десктопный вид - таблицей
              return (
                <div 
                  key={userItem.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px 130px 80px',
                    padding: '16px 20px',
                    borderBottom: '1px solid #222',
                    fontSize: '14px',
                    color: 'white',
                    alignItems: 'center'
                  }}
                >
                  <div style={{fontWeight: '500'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: userItem.role === UserRole.ADMIN ? '#76ABAE' : '#333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        {userItem.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div>{userItem.username}</div>
                        <div style={{fontSize: '12px', color: '#9da3ae'}}>
                          {userItem.role === UserRole.ADMIN ? 'Администратор' : 'Куратор'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <UsersIcon size={14} style={{color: '#9da3ae'}} />
                    <span>{userItem.workers?.length || 0}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <Calendar size={14} style={{color: '#9da3ae'}} />
                    <span>{daysInTeam}</span>
                  </div>
                  <div>
                    <button 
                      style={{
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        color: '#f87171',
                        border: 'none',
                        borderRadius: '6px',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setDeleteUsername(userItem.username);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Диалог удаления */}
      {showDeleteDialog && (
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
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#141414',
            border: '1px solid #222',
            borderRadius: '12px',
            width: isMobile ? '90%' : '400px',
            maxWidth: '400px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #222'
            }}>
              <div style={{fontSize: '16px', fontWeight: '500', color: 'white'}}>
                Удаление сотрудника
              </div>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9da3ae',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteUsername("");
                }}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{padding: '20px', fontSize: '14px', color: '#9da3ae'}}>
              Вы уверены, что хотите удалить сотрудника <span style={{color: 'white', fontWeight: '500'}}>{deleteUsername}</span>?
              Это действие нельзя отменить.
            </div>
            
            <div style={{
              padding: '12px 20px 20px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button 
                style={{
                  backgroundColor: '#222',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 16px',
                  height: '36px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteUsername("");
                }}
              >
                Отмена
              </button>
              <button 
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 16px',
                  height: '36px',
                  cursor: 'pointer'
                }}
                onClick={handleDeleteUser}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Диалог создания пользователя */}
      {showCreateDialog && (
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
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#141414',
            border: '1px solid #222',
            borderRadius: '12px',
            width: isMobile ? '90%' : '400px',
            maxWidth: '400px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #222'
            }}>
              <div style={{fontSize: '16px', fontWeight: '500', color: 'white'}}>
                Добавление сотрудника
              </div>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9da3ae',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setShowCreateDialog(false);
                  setFormData({ username: "", password: "", role: UserRole.CURATOR });
                  setError("");
                }}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{padding: '20px'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div>
                  <div style={{
                    fontSize: '13px', 
                    color: 'white', 
                    marginBottom: '6px'
                  }}>
                    Логин
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Введите логин"
                    style={{
                      backgroundColor: '#1c1c1c',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      padding: '0 12px',
                      height: '40px',
                      width: '100%',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <div style={{
                    fontSize: '13px', 
                    color: 'white', 
                    marginBottom: '6px'
                  }}>
                    Пароль
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Введите пароль"
                    style={{
                      backgroundColor: '#1c1c1c',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      padding: '0 12px',
                      height: '40px',
                      width: '100%',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div>
                  <div style={{
                    fontSize: '13px', 
                    color: 'white', 
                    marginBottom: '6px'
                  }}>
                    Роль
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '10px'
                  }}>
                    <button
                      type="button"
                      onClick={() => handleRoleChange(UserRole.CURATOR)}
                      style={{
                        flex: 1,
                        backgroundColor: formData.role === UserRole.CURATOR ? '#1c1c1c' : 'transparent',
                        border: `1px solid ${formData.role === UserRole.CURATOR ? '#76ABAE' : '#333'}`,
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: formData.role === UserRole.CURATOR ? 'white' : '#9da3ae',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Куратор
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange(UserRole.ADMIN)}
                      style={{
                        flex: 1,
                        backgroundColor: formData.role === UserRole.ADMIN ? '#1c1c1c' : 'transparent',
                        border: `1px solid ${formData.role === UserRole.ADMIN ? '#76ABAE' : '#333'}`,
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: formData.role === UserRole.ADMIN ? 'white' : '#9da3ae',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Администратор
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div style={{
                    padding: '10px 12px',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    fontSize: '13px',
                    color: '#f87171'
                  }}>
                    {error}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{
              padding: '12px 20px 20px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button 
                style={{
                  backgroundColor: '#222',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 16px',
                  height: '36px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setShowCreateDialog(false);
                  setFormData({ username: "", password: "", role: UserRole.CURATOR });
                  setError("");
                }}
              >
                Отмена
              </button>
              <button 
                style={{
                  backgroundColor: '#76ABAE',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 16px',
                  height: '36px',
                  cursor: 'pointer'
                }}
                onClick={handleCreateUser}
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 