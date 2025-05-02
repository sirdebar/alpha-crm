"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  BarChart4, 
  Settings,
  Info,
  HelpCircle,
  Code
} from "lucide-react";
import { useEffect, useState } from "react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive?: boolean;
  onClick?: () => void;
}

function SidebarItem({ href, icon, title, isActive, onClick }: SidebarItemProps) {
  return (
    <Link href={href} style={{ width: '100%', textDecoration: 'none' }} onClick={onClick}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          borderRadius: '6px',
          backgroundColor: isActive ? '#1E1E1E' : 'transparent',
          color: isActive ? '#FFFFFF' : '#9DA3AE',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontSize: '14px',
          fontWeight: isActive ? '500' : 'normal'
        }}
      >
        {icon}
        {title}
      </div>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isAdmin = user?.role === UserRole.ADMIN;
  const [isMobile, setIsMobile] = useState(false);

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

  // Для мобильной версии - закрывать меню при клике на пункт
  const closeSidebarOnMobile = () => {
    if (isMobile && window.innerWidth <= 768) {
      // Закрыть сайдбар, отправив сигнал родителю (будет перехвачено в layout.tsx)
      const event = new CustomEvent('closeMobileSidebar');
      window.dispatchEvent(event);
    }
  };

  return (
    <div style={{
      height: '100%',
      width: '250px',
      backgroundColor: '#141414',
      borderRight: '1px solid #222',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#76ABAE',
            borderRadius: '6px',
            marginRight: '12px'
          }}></div>
          <h1 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            margin: 0
          }}>Alpha CRM</h1>
        </div>
      </div>
      
      <div style={{
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        overflowY: 'auto'
      }}>
        <SidebarItem
          href="/dashboard"
          icon={<LayoutDashboard style={{ width: '16px', height: '16px' }} />}
          title="Панель управления"
          isActive={pathname === "/dashboard"}
          onClick={closeSidebarOnMobile}
        />
        
        {isAdmin && (
          <SidebarItem
            href="/dashboard/users"
            icon={<Users style={{ width: '16px', height: '16px' }} />}
            title="Управление сотрудниками"
            isActive={pathname === "/dashboard/users"}
            onClick={closeSidebarOnMobile}
          />
        )}
        
        <SidebarItem
          href="/dashboard/workers"
          icon={<UserPlus style={{ width: '16px', height: '16px' }} />}
          title="Работники"
          isActive={pathname === "/dashboard/workers"}
          onClick={closeSidebarOnMobile}
        />
        
        <SidebarItem
          href="/dashboard/statistics"
          icon={<BarChart4 style={{ width: '16px', height: '16px' }} />}
          title="Статистика"
          isActive={pathname === "/dashboard/statistics"}
          onClick={closeSidebarOnMobile}
        />
        
        <SidebarItem
          href="/dashboard/code-stats"
          icon={<Code style={{ width: '16px', height: '16px' }} />}
          title="Статистика кодов"
          isActive={pathname === "/dashboard/code-stats"}
          onClick={closeSidebarOnMobile}
        />
        
        <SidebarItem
          href="/dashboard/settings"
          icon={<Settings style={{ width: '16px', height: '16px' }} />}
          title="Настройки"
          isActive={pathname === "/dashboard/settings"}
          onClick={closeSidebarOnMobile}
        />
      </div>
      
      <div style={{
        marginTop: 'auto',
        padding: '16px',
        borderTop: '1px solid #222',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 4px'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#9DA3AE',
            fontWeight: '500'
          }}>
            Alpha CRM v1.0.0
          </div>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <a 
              href="#" 
              style={{
                color: '#9DA3AE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              title="Справка"
            >
              <HelpCircle size={14} />
            </a>
            <a 
              href="#" 
              style={{
                color: '#9DA3AE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              title="О системе"
            >
              <Info size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 