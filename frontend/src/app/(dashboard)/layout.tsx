"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    
    // Слушаем событие закрытия мобильного меню
    const handleCloseMobileSidebar = () => {
      setSidebarOpen(false);
    };
    
    window.addEventListener("closeMobileSidebar", handleCloseMobileSidebar);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("closeMobileSidebar", handleCloseMobileSidebar);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
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
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#0f0f0f',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Десктопный сайдбар (скрыт на мобильных) */}
      {!isMobile && (
        <div style={{height: '100%'}}>
          <Sidebar />
        </div>
      )}
      
      {/* Мобильный сайдбар (показывается по кнопке) */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 40,
          display: 'flex'
        }}>
          <div style={{
            height: '100%',
            width: '250px',
            zIndex: 50
          }}>
            <Sidebar />
          </div>
          <div 
            style={{
              flex: 1,
              height: '100%'
            }}
            onClick={toggleSidebar}
          ></div>
        </div>
      )}
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden'
      }}>
        <Header toggleSidebar={toggleSidebar} />
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          backgroundColor: '#0f0f0f'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
} 