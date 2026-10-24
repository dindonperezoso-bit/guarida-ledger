import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  _id: string;
  username: string;
  userRole: string;
  memberProfileId: string;
  isActive: boolean;
}

interface AuthStore {
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthUser: (user: AuthUser, rememberMe: boolean) => void;
  clearAuthUser: () => void;
  loadAuthUser: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      authUser: null,
      isAuthenticated: false,
      isLoading: false,

      setAuthUser: (user: AuthUser, rememberMe: boolean) => {
        set({
          authUser: user,
          isAuthenticated: true,
          isLoading: false
        });
        
        // Store in sessionStorage if not remembering
        if (!rememberMe) {
          sessionStorage.setItem('authUser', JSON.stringify(user));
        }
      },

      clearAuthUser: () => {
        set({
          authUser: null,
          isAuthenticated: false,
          isLoading: false
        });
        sessionStorage.removeItem('authUser');
      },

      loadAuthUser: () => {
        // Check sessionStorage first (for non-persistent sessions)
        const sessionUser = sessionStorage.getItem('authUser');
        if (sessionUser) {
          try {
            const user = JSON.parse(sessionUser);
            set({
              authUser: user,
              isAuthenticated: true,
              isLoading: false
            });
            return;
          } catch (error) {
            console.error('Error loading session user:', error);
          }
        }
        
        set({ isLoading: false });
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        authUser: state.authUser,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
