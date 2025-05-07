"use client";

import { useEffect, useState } from "react";
import { WorkerStats, UserRole } from "@/types";
import { api } from "@/lib/api";
import { UserPlus, Search, Plus, X, Calendar, User, Tag, Code } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

export default function WorkersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.role === UserRole.ADMIN;
  const isCurator = user?.role === UserRole.CURATOR;
  const canAddCodes = isAdmin || isCurator; // Оба роли могут добавлять коды
  const [workers, setWorkers] = useState<WorkerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    tag: "",
  });
  const [error, setError] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [showAddCodesDialog, setShowAddCodesDialog] = useState(false);
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
    async function loadWorkers() {
      try {
        const workersData = await api.workers.getStats();
        setWorkers(workersData);
      } catch (err) {
        console.error("Ошибка при загрузке работников:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWorkers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateWorker = async () => {
    try {
      setError("");
      if (!formData.username || !formData.password) {
        setError("Заполните обязательные поля");
        return;
      }
      
      const tag = formData.tag.trim() === "" ? undefined : formData.tag;
      await api.workers.create(formData.username, formData.password, tag);
      
      // Перезагружаем список воркеров
      const updatedWorkers = await api.workers.getStats();
      setWorkers(updatedWorkers);
      
      setFormData({ username: "", password: "", tag: "" });
      setShowCreateDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании работника");
    }
  };

  const handleAddCodes = async () => {
    if (!selectedWorkerId || codesCount < 1) {
      return;
    }
    
    setAddingCodes(true);
    try {
      await api.codeStats.addCodes(selectedWorkerId, codesCount);
      
      // Перезагружаем список работников после добавления кодов
      try {
        const workersData = await api.workers.getStats();
        setWorkers(workersData);
      } catch (loadError) {
        console.error("Ошибка при перезагрузке работников:", loadError);
      }
      
      // Сбрасываем форму
      setShowAddCodesDialog(false);
      setCodesCount(1);
      setSelectedWorkerId(null);
      
    } catch (error) {
      console.error("Ошибка при добавлении кодов:", error);
    } finally {
      setAddingCodes(false);
    }
  };

  // Фильтрация воркеров для поиска
  const filteredWorkers = workers.filter(worker => 
    worker.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (worker.curatorName && worker.curatorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (worker.tag && worker.tag.toLowerCase().includes(searchTerm.toLowerCase()))
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
            Управление работниками
          </h1>
          <p style={{fontSize: '14px', color: '#9da3ae'}}>
            Всего работников: {filteredWorkers.length}
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
          
          {/* Кнопка добавления воркера (только для кураторов) */}
          {isCurator && (
          <button 
              onClick={() => setShowCreateDialog(true)}
            style={{
                height: '36px',
                minWidth: '120px',
              backgroundColor: '#76ABAE',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
                justifyContent: 'center',
              gap: '8px',
                fontSize: '13px',
                borderRadius: '8px',
                border: 'none',
                padding: '0 16px',
                cursor: 'pointer'
              }}
          >
            <Plus size={16} />
            {!isMobile && 'Добавить'}
          </button>
          )}
        </div>
      </div>
      
      {/* Карточка со списком воркеров */}
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
            gridTemplateColumns: canAddCodes ? '60px 1fr 120px 120px 120px 60px' : '60px 1fr 120px 120px 120px',
            padding: '16px 20px',
            borderBottom: '1px solid #222',
            fontSize: '13px',
            fontWeight: '500',
            color: '#9da3ae'
          }}>
            <div>ID</div>
            <div>Имя</div>
            <div>Куратор</div>
            <div>Метка</div>
            <div>Дней в команде</div>
            {canAddCodes && <div></div>}
          </div>
        )}
        
        {/* Тело таблицы */}
        <div>
          {filteredWorkers.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#9da3ae',
              fontSize: '14px'
            }}>
              Нет доступных работников
            </div>
          ) : (
            filteredWorkers.map((worker) => {
              const createdAt = new Date(worker.createdAt);
              const now = new Date();
              const daysInTeam = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
              
              if (isMobile) {
                // Мобильный вид - карточками
                return (
                  <div 
                    key={worker.id}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #222',
                      fontSize: '14px',
                      color: 'white'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <div style={{fontWeight: '500'}}>{worker.username}</div>
                      {canAddCodes && (
                        <button 
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(118, 171, 174, 0.1)',
                            color: '#76ABAE',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Добавить коды"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkerId(worker.id);
                            setShowAddCodesDialog(true);
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '16px',
                      fontSize: '13px',
                      color: '#9da3ae'
                    }}>
                      {worker.tag && (
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                          <Tag size={14} />
                          <span>{worker.tag}</span>
                        </div>
                      )}
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
                  key={worker.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: canAddCodes ? '60px 1fr 120px 120px 120px 60px' : '60px 1fr 120px 120px 120px',
                    padding: '16px 20px',
                    borderBottom: '1px solid #222',
                    color: 'white',
                    fontSize: '14px',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => router.push(`/dashboard/workers/${worker.id}`)}
                >
                  <div>{worker.id}</div>
                  <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {worker.username}
                  </div>
                  <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#9da3ae', fontSize: '13px'}}>
                    {worker.curatorName}
                  </div>
                  <div style={{
                    color: worker.tag ? '#76ABAE' : '#9da3ae',
                    fontSize: '13px'
                  }}>
                    {worker.tag || 'Нет метки'}
                  </div>
                  <div style={{color: '#9da3ae', fontSize: '13px'}}>
                    {worker.daysInTeam} {worker.daysInTeam === 1 ? 'день' : worker.daysInTeam < 5 ? 'дня' : 'дней'}
                  </div>
                  {canAddCodes && (
                    <div 
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorkerId(worker.id);
                        setShowAddCodesDialog(true);
                      }}
                    >
                      <button 
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(118, 171, 174, 0.1)',
                          color: '#76ABAE',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Добавить коды"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Диалог создания воркера */}
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
                Добавление работника
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
                  setFormData({ username: "", password: "", tag: "" });
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
                    Метка (опционально)
                  </div>
                  <input
                    type="text"
                    name="tag"
                    value={formData.tag}
                    onChange={handleInputChange}
                    placeholder="Введите метку"
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
                  setFormData({ username: "", password: "", tag: "" });
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
                onClick={handleCreateWorker}
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for adding codes */}
      {showAddCodesDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1c1c1c',
            borderRadius: '12px',
            border: '1px solid #333',
            width: '90%',
            maxWidth: '400px',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
                margin: 0
              }}>
                Добавление кодов
              </h3>
              <button 
                onClick={() => setShowAddCodesDialog(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9da3ae',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{marginBottom: '16px'}}>
              <p style={{
                fontSize: '14px',
                color: '#9da3ae',
                margin: '0 0 16px 0'
              }}>
                Добавление кодов для работника #{selectedWorkerId}
              </p>
              
              <div style={{marginBottom: '16px'}}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
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
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button 
                onClick={() => setShowAddCodesDialog(false)}
                style={{
                  backgroundColor: '#333',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  padding: '0 16px',
                  height: '40px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>
              <button 
                onClick={handleAddCodes}
                disabled={addingCodes || codesCount < 1}
                style={{
                  backgroundColor: '#76ABAE',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  padding: '0 16px',
                  height: '40px',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: addingCodes ? 0.7 : 1
                }}
              >
                {addingCodes ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 