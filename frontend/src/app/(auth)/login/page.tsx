"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, FormField } from "@/components/ui/form";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { AlertCircle, Lock, User } from "lucide-react";

interface LoginFormValues {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();
  const { login, isAuthenticated, token, hydrated } = useAuthStore();

  // Проверяем авторизацию при загрузке страницы
  useEffect(() => {
    if (!hydrated) {
      // Ждем загрузки состояния из хранилища
      return;
    }

    const checkAuth = async () => {
      // Если пользователь уже авторизован и у него есть токен
      if (isAuthenticated && token) {
        try {
          // Проверяем валидность токена
          await api.auth.getProfile();
          // Если токен валидный, перенаправляем на дашборд
          router.push("/dashboard");
        } catch (error) {
          // При ошибке авторизации просто отображаем страницу логина
          console.error("Ошибка проверки авторизации:", error);
          setPageLoading(false);
        }
      } else {
        setPageLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, token, router, hydrated]);

  const form = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.auth.login(data.username, data.password);
      login(response);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('сервер')) {
          setError('Сервер недоступен. Убедитесь, что бэкенд запущен на порту 3001');
        } else if (err.message.includes('Неверный')) {
          setError(err.message);
        } else {
          setError(`Ошибка входа: ${err.message}`);
        }
      } else {
        setError("Ошибка входа: Не удалось подключиться к серверу");
      }
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Отображаем загрузку, если страница еще загружается
  if (pageLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0f0f0f',
        color: '#ffffff'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid rgba(118, 171, 174, 0.2)',
            borderTopColor: '#76ABAE',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            marginTop: '16px',
            fontSize: '14px',
            color: '#9da3ae'
          }}>Загрузка...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
      <div style={{width: '420px', maxWidth: '100%', padding: '0 20px'}}>
        <div style={{textAlign: 'center', marginBottom: '28px'}}>
          <h1 style={{fontSize: '24px', fontWeight: 'bold', color: 'white'}}>Alpha CRM</h1>
          <p style={{color: '#9da3ae', fontSize: '14px', marginTop: '4px'}}>Система управления холодками</p>
        </div>
        
        <div style={{
          backgroundColor: '#141414',
          borderRadius: '12px',
          border: '1px solid #222',
          overflow: 'hidden'
        }}>
          <div style={{height: '3px', width: '100%', backgroundColor: '#76ABAE'}}></div>
          
          <div style={{padding: '24px 24px 12px 24px'}}>
            <div style={{fontSize: '16px', fontWeight: '500', color: 'white'}}>Авторизация</div>
            <div style={{fontSize: '13px', color: '#9da3ae', marginTop: '4px'}}>
              Введите данные для входа в систему
            </div>
          </div>
          
          <div style={{padding: '12px 24px 20px 24px'}}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} style={{display: 'flex', flexDirection: 'column', gap: '16px'}} method="post">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <div>
                      <div style={{fontSize: '13px', fontWeight: 'normal', color: '#e0e0e0', marginBottom: '6px'}}>Логин</div>
                      <div style={{position: 'relative'}}>
                        <input
                          placeholder="Введите логин"
                          type="text"
                          {...field}
                          style={{
                            backgroundColor: '#1c1c1c',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '14px',
                            height: '42px',
                            width: '100%',
                            paddingLeft: '40px',
                            paddingRight: '12px',
                            outline: 'none'
                          }}
                        />
                        <User style={{
                          position: 'absolute',
                          left: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '16px',
                          height: '16px',
                          color: '#9da3ae'
                        }} />
                      </div>
                    </div>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <div>
                      <div style={{fontSize: '13px', fontWeight: 'normal', color: '#e0e0e0', marginBottom: '6px'}}>Пароль</div>
                      <div style={{position: 'relative'}}>
                        <input
                          type="password"
                          placeholder="Введите пароль"
                          {...field}
                          style={{
                            backgroundColor: '#1c1c1c',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '14px',
                            height: '42px',
                            width: '100%',
                            paddingLeft: '40px',
                            paddingRight: '12px',
                            outline: 'none'
                          }}
                        />
                        <Lock style={{
                          position: 'absolute',
                          left: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '16px',
                          height: '16px',
                          color: '#9da3ae'
                        }} />
                      </div>
                    </div>
                  )}
                />
                
                {error && (
                  <div style={{
                    padding: '10px 12px',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '13px',
                    color: '#f87171'
                  }}>
                    <AlertCircle style={{width: '14px', height: '14px', flexShrink: 0}} />
                    <div style={{marginLeft: '10px'}}>{error}</div>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    backgroundColor: '#76ABAE',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    height: '42px',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }}
                >
                  {isLoading ? "Выполняется вход..." : "Войти в систему"}
                </button>
              </form>
            </Form>
          </div>
          
          <div style={{padding: '0 24px 24px 24px', display: 'flex', justifyContent: 'center'}}>
            <p style={{fontSize: '12px', color: '#9da3ae'}}>
              По умолчанию: <span style={{color: '#e0e0e0'}}>admin / admin</span>
            </p>
          </div>
        </div>
        
        <div style={{marginTop: '20px', textAlign: 'center'}}>
          <p style={{fontSize: '12px', color: '#555'}}>
            © 2025 Alpha CRM
          </p>
        </div>
      </div>
    </div>
  );
} 