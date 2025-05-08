"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { User as UserType, UserRole, WorkerAttendance } from "@/types";
import { Settings, LogOut, Search, BellRing, Menu, X, User, Calendar } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MiniAttendanceCalendar from '@/components/dashboard/MiniAttendanceCalendar';

const API_URL = 'http://localhost:3001';

interface HeaderProps {
  toggleSidebar: () => void;
}

interface UserCardProps {
  user: UserType;
  onClose: () => void;
}

function UserCard({ user, onClose }: UserCardProps) {
  const [loading, setLoading] = useState(false);
  const [workerData, setWorkerData] = useState<{ attendance: WorkerAttendance } | null>(null);
  
  // Проверка: является ли пользователь работником (не куратор и не админ)
  const isWorker = !user.role || (user.role !== UserRole.ADMIN && user.role !== UserRole.CURATOR);
  
  useEffect(() => {
    if (isWorker && user.id) {
      loadWorkerAttendance();
    }
  }, [user.id, isWorker]);
  
  const loadWorkerAttendance = async () => {
    setLoading(true);
    try {
      const attendance = await api.workers.getAttendance(user.id);
      setWorkerData({ attendance });
    } catch (error) {
      console.error('Ошибка при загрузке данных о посещаемости:', error);
      // В случае ошибки создаем пустую заглушку для данных о посещаемости
      setWorkerData({
        attendance: {
          totalDays: 0,
          bestStreak: 0,
          records: [],
          weeklyPercentage: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#141414',
        borderRadius: '12px',
        border: '1px solid #222',
        width: '90%',
        maxWidth: '400px',
        overflow: 'hidden',
        position: 'relative',
        padding: '20px',
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9da3ae',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: user.profile?.avatarUrl ? 'transparent' : '#76ABAE',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '12px',
            backgroundImage: user.profile?.avatarUrl ? `url(${API_URL}${user.profile.avatarUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
            {!user.profile?.avatarUrl && user.username.substring(0, 2).toUpperCase()}
          </div>
          
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '4px',
          }}>
            {user.username}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: '#9da3ae',
          }}>
            <User size={14} />
            {user.role === UserRole.ADMIN ? "Администратор" : user.role === UserRole.CURATOR ? "Эйчар" : "Холодка"}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div>
            <div style={{
              fontSize: '13px',
              color: '#9da3ae',
              marginBottom: '6px',
            }}>
              В системе с
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Calendar size={14} style={{ color: '#9da3ae' }} />
              <div style={{ fontSize: '14px', color: 'white' }}>
                {new Date(user.createdAt).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>
          
          {/* Календарь посещаемости для работников */}
          {isWorker && (
            <div>
              <div style={{
                fontSize: '13px',
                color: '#9da3ae',
                marginBottom: '10px',
              }}>
                Посещаемость
              </div>
              
              {loading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '20px 0',
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
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
              ) : workerData?.attendance ? (
                <MiniAttendanceCalendar attendance={workerData.attendance} />
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '10px 0',
                  color: '#9da3ae',
                  fontSize: '13px'
                }}>
                  Нет данных о посещаемости
                </div>
              )}
            </div>
          )}
          
          {user.profile?.contactLinks && user.profile.contactLinks.length > 0 && (
            <div>
              <div style={{
                fontSize: '13px',
                color: '#9da3ae',
                marginBottom: '6px',
              }}>
                Контакты
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}>
                {user.profile.contactLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '14px',
                      color: '#76ABAE',
                      textDecoration: 'none',
                      wordBreak: 'break-all',
                    }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Header({ toggleSidebar }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  useEffect(() => {
    // Обработка клика вне компонента поиска
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    // Дебаунс для поискового запроса
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await api.search.searchUsers(searchQuery);
          setSearchResults(results.users);
        } catch (error) {
          console.error('Ошибка поиска:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.trim().length >= 2);
  };
  
  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
    setShowResults(false);
    setSearchQuery('');
  };
  
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid #222',
      backgroundColor: '#141414',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        {isMobile && (
          <button 
            onClick={toggleSidebar}
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
            <Menu size={22} />
          </button>
        )}
        
        <div 
          style={{
            position: 'relative',
            width: isMobile ? '160px' : '300px'
          }}
          ref={searchRef}
        >
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.trim().length >= 2 && setShowResults(true)}
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
          
          {/* Выпадающий список с результатами поиска */}
          {showResults && (
            <div style={{
              position: 'absolute',
              top: '44px',
              left: 0,
              width: '100%',
              backgroundColor: '#1c1c1c',
              border: '1px solid #333',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              zIndex: 100,
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              {isSearching ? (
                <div style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: '#9da3ae',
                  fontSize: '13px'
                }}>
                  Поиск...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map(user => (
                  <div 
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    style={{
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderBottom: '1px solid #333',
                      ':hover': {
                        backgroundColor: '#222'
                      }
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: user.profile?.avatarUrl ? 'transparent' : '#76ABAE',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundImage: user.profile?.avatarUrl ? `url(${API_URL}${user.profile.avatarUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}>
                      {!user.profile?.avatarUrl && user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontSize: '13px', fontWeight: '500', color: 'white'}}>
                        {user.username}
                      </div>
                      <div style={{fontSize: '11px', color: '#9da3ae'}}>
                        {user.role === UserRole.ADMIN ? "Администратор" : "Эйчар"}
                      </div>
                    </div>
                  </div>
                ))
              ) : searchQuery.trim().length >= 2 ? (
                <div style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: '#9da3ae',
                  fontSize: '13px'
                }}>
                  Ничего не найдено
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {!isMobile && (
          <div style={{
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            backgroundColor: '#1c1c1c',
            cursor: 'pointer'
          }}>
            <BellRing style={{ width: '16px', height: '16px', color: '#9da3ae' }} />
          </div>
        )}
        
        <button 
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            color: '#f87171',
            cursor: 'pointer'
          }}
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
        </button>
        
        <Link
          href="/dashboard/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: '#1c1c1c',
            borderRadius: '8px',
            cursor: 'pointer',
            textDecoration: 'none'
          }}
        >
          <div style={{
            width: '26px',
            height: '26px',
            backgroundColor: user?.profile?.avatarUrl ? 'transparent' : '#76ABAE',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'white',
            backgroundImage: user?.profile?.avatarUrl ? `url(${API_URL}${user.profile.avatarUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
            {!user?.profile?.avatarUrl && user?.username ? user.username.substring(0, 2).toUpperCase() : "U"}
          </div>
          {!isMobile && (
            <div style={{
              display: 'flex',
              flexDirection: 'column'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '500', color: 'white' }}>
                {user?.username}
              </span>
              <span style={{ fontSize: '10px', color: '#9da3ae' }}>
                {user?.role === UserRole.ADMIN ? "Администратор" : "Эйчар"}
              </span>
            </div>
          )}
        </Link>
      </div>
      
      {/* Модальное окно с профилем пользователя */}
      {selectedUser && (
        <UserCard 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </header>
  );
} 