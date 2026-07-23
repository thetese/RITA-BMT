import { create } from 'zustand';

interface AuthState {
  currentUser: any | null;
  setCurrentUser: (user: any | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
}));
