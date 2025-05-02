"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { UserRole } from "@/types";
import { Settings, LogOut, Search, BellRing } from "lucide-react";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header style={{
      height: '60px',
      borderBottom: '1px solid #222',
      backgroundColor: '#141414',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '300px'
      }}>
        <div style={{
          position: 'relative',
          width: '100%'
        }}>
          <input
            type="text"
            placeholder="Поиск..."
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
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
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
        
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: '#1c1c1c',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onClick={handleLogout}
        >
          <div style={{
            width: '26px',
            height: '26px',
            backgroundColor: '#76ABAE',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            {user?.username ? user.username.substring(0, 2).toUpperCase() : "U"}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'white' }}>
              {user?.username}
            </span>
            <span style={{ fontSize: '10px', color: '#9da3ae' }}>
              {user?.role === UserRole.ADMIN ? "Администратор" : "Куратор"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
} 