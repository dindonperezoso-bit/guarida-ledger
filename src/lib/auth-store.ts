import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * BANCO DE LA GUARIDA VIRGILIO
 * Authentication Store - Manages user session state
 * 
 * Handles:
 * - User authentication state
 * - Session persistence (localStorage for "remember me", sessionStorage for temporary)
 * - Loading states during auth operations
 * - Session validation and cleanup
 */

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
  validateSession: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      authUser: null,
      isAuthenticated: false,
      isLoading: true,

      setAuthUser: (user: AuthUser, rememberMe: boolean) => {
        console.log(`[AUTH_STORE] Setting auth user: ${user.username}, rememberMe: ${rememberMe}`);
        
        set({
          authUser: user,
          isAuthenticated: true,
          isLoading: false
        });
        
        // Store in sessionStorage for non-persistent sessions
        if (!rememberMe) {
          console.log('[AUTH_STORE] Storing session in sessionStorage (temporary)');
          sessionStorage.setItem('authUser', JSON.stringify(user));
        } else {
          console.log('[AUTH_STORE] Session will be persisted via localStorage (remember me)');
        }
      },

      clearAuthUser: () => {
        console.log('[AUTH_STORE] Clearing auth user');
        
        set({
          authUser: null,
          isAuthenticated: false,
          isLoading: false
        });
        
        sessionStorage.removeItem('authUser');
      },

      loadAuthUser: () => {
        console.log('[AUTH_STORE] Loading auth user from storage');
        
        // Check sessionStorage first (for non-persistent sessions)
        const sessionUser = sessionStorage.getItem('authUser');
        if (sessionUser) {
          try {
            const user = JSON.parse(sessionUser);
            console.log(`[AUTH_STORE] Found session user: ${user.username}`);
            
            set({
              authUser: user,
              isAuthenticated: true,
              isLoading: false
            });
            return;
          } catch (error) {
            console.error('[AUTH_STORE] Error parsing session user:', error);
            sessionStorage.removeItem('authUser');
          }
        }
        
        console.log('[AUTH_STORE] No session found, user is not authenticated');
        set({ isLoading: false });
      },

      validateSession: () => {
        const state = get();
        
        if (!state.authUser || !state.isAuthenticated) {
          console.log('[AUTH_STORE] Session validation failed: no auth user');
          return false;
        }

        if (!state.authUser.isActive) {
          console.log('[AUTH_STORE] Session validation failed: user account is inactive');
          return false;
        }

        console.log(`[AUTH_STORE] Session validation successful for user: ${state.authUser.username}`);
        return true;
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
