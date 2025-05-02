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
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive?: boolean;
}

function SidebarItem({ href, icon, title, isActive }: SidebarItemProps) {
  return (
    <Link href={href} style={{ width: '100%', textDecoration: 'none' }}>
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
        alignItems: 'center'
      }}>
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
      
      <div style={{
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <SidebarItem
          href="/dashboard"
          icon={<LayoutDashboard style={{ width: '16px', height: '16px' }} />}
          title="Панель управления"
          isActive={pathname === "/dashboard"}
        />
        
        {isAdmin && (
          <SidebarItem
            href="/dashboard/users"
            icon={<Users style={{ width: '16px', height: '16px' }} />}
            title="Управление сотрудниками"
            isActive={pathname === "/dashboard/users"}
          />
        )}
        
        <SidebarItem
          href="/dashboard/workers"
          icon={<UserPlus style={{ width: '16px', height: '16px' }} />}
          title="Воркеры"
          isActive={pathname === "/dashboard/workers"}
        />
        
        <SidebarItem
          href="/dashboard/statistics"
          icon={<BarChart4 style={{ width: '16px', height: '16px' }} />}
          title="Статистика"
          isActive={pathname === "/dashboard/statistics"}
        />
        
        <SidebarItem
          href="/dashboard/settings"
          icon={<Settings style={{ width: '16px', height: '16px' }} />}
          title="Настройки"
          isActive={pathname === "/dashboard/settings"}
        />
      </div>
      
      <div style={{
        marginTop: 'auto',
        padding: '16px',
        borderTop: '1px solid #222',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          backgroundColor: '#222',
          borderRadius: '50%',
          marginRight: '12px'
        }}></div>
        <div>
          <div style={{fontSize: '13px', color: 'white', fontWeight: '500'}}>{user?.username}</div>
          <div style={{fontSize: '11px', color: '#9DA3AE'}}>{user?.role === UserRole.ADMIN ? 'Администратор' : 'Куратор'}</div>
        </div>
      </div>
    </div>
  );
} 