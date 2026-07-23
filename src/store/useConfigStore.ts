import { create } from 'zustand';

interface ConfigState {
  theme: 'light' | 'dark';
  businessType: 'restaurant' | 'supermarket' | 'retail';
  setTheme: (theme: 'light' | 'dark') => void;
  setBusinessType: (type: 'restaurant' | 'supermarket' | 'retail') => void;
  toggleTheme: () => void;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  theme: 'light',
  businessType: 'supermarket',
  setTheme: (theme) => set({ theme }),
  setBusinessType: (businessType) => set({ businessType }),
  toggleTheme: () => {
    const current = get().theme;
    const newTheme = current === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    const api = (window as any).api;
    if (api) api.setSetting('theme', newTheme);
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
}));
