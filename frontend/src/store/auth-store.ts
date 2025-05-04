import { create } from 'zustand';
import { AuthResponse, User } from '@/types';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (authResponse: AuthResponse) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      hydrated: false,
      login: (authResponse: AuthResponse) => {
        set({
          token: authResponse.access_token,
          user: authResponse.user,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },
      setUser: (user: User) => {
        set({ user });
      },
      setHydrated: (state: boolean) => {
        set({ hydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
); 