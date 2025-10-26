import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '@devvai/devv-code-backend';

export type UserRole = 'admin' | 'manager' | 'resident';

interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, otp: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, otp: string, role: UserRole) => {
        const response = await auth.verifyOTP(email, otp);
        set({
          user: {
            uid: response.user.uid,
            email: response.user.email,
            name: response.user.name || email.split('@')[0],
            role,
          },
          isAuthenticated: true,
        });
      },

      logout: async () => {
        await auth.logout();
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updateUserRole: (role: UserRole) => {
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
