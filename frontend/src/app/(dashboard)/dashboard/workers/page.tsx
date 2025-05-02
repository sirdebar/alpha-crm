"use client";

import { useEffect, useState } from "react";
import { WorkerStats } from "@/types";
import { api } from "@/lib/api";
import { UserPlus, Search, Plus, X, Calendar, User, Tag } from "lucide-react";

export default function WorkersPage() {
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

  useEffect(() => {
    async function loadWorkers() {
      try {
        const workersData = await api.workers.getStats();
        setWorkers(workersData);
      } catch (err) {
        console.error("Ошибка при загрузке воркеров:", err);
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
      setError(err instanceof Error ? err.message : "Ошибка при создании воркера");
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '8px'}}>
            Управление воркерами
          </h1>
          <p style={{fontSize: '14px', color: '#9da3ae'}}>
            Всего воркеров: {filteredWorkers.length}
          </p>
        </div>
        
        <div style={{display: 'flex', gap: '12px'}}>
          {/* Поиск */}
          <div style={{position: 'relative'}}>
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
                width: '200px',
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
              gap: '8px'
            }}
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus size={16} />
            Добавить
          </button>
        </div>
      </div>
      
      {/* Карточка со списком воркеров */}
      <div style={{
        backgroundColor: '#141414',
        borderRadius: '12px',
        border: '1px solid #222',
        overflow: 'hidden'
      }}>
        {/* Заголовок таблицы */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 120px 120px 120px',
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
        </div>
        
        {/* Тело таблицы */}
        <div>
          {filteredWorkers.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: '#9da3ae',
              fontSize: '14px'
            }}>
              Нет доступных воркеров
            </div>
          ) : (
            filteredWorkers.map((worker) => (
              <div 
                key={worker.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 120px 120px 120px',
                  padding: '16px 20px',
                  borderBottom: '1px solid #222',
                  fontSize: '14px',
                  color: 'white',
                  alignItems: 'center'
                }}
              >
                <div style={{color: '#9da3ae', fontSize: '13px'}}>{worker.id}</div>
                <div style={{fontWeight: '500'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      {worker.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>{worker.username}</div>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'}}>
                  <User size={14} style={{color: '#9da3ae'}} />
                  <span>{worker.curatorName || "—"}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'}}>
                  <Tag size={14} style={{color: '#9da3ae'}} />
                  <span>{worker.tag || "—"}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'}}>
                  <Calendar size={14} style={{color: '#9da3ae'}} />
                  <span>{worker.daysInTeam}</span>
                </div>
              </div>
            ))
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
            width: '400px',
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
                Добавление воркера
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
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    Метка
                    <span style={{color: '#9da3ae', fontSize: '11px'}}>(необязательно)</span>
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
    </div>
  );
} 