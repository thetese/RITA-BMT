import { create } from 'zustand';

interface SalesState {
  sales: any[];
  accounters: any[];
  lowStockItems: any[];
  setSales: (sales: any[]) => void;
  setAccounters: (accounters: any[]) => void;
  setLowStockItems: (items: any[]) => void;
  loadAllData: () => Promise<void>;
}

export const useSalesStore = create<SalesState>((set) => ({
  sales: [],
  accounters: [],
  lowStockItems: [],
  setSales: (sales) => set({ sales }),
  setAccounters: (accounters) => set({ accounters }),
  setLowStockItems: (lowStockItems) => set({ lowStockItems }),
  loadAllData: async () => {
    const api = (window as any).api;
    if (!api) return;
    try {
      const [sales, accounters, lowStock] = await Promise.all([
        api.getSales(),
        api.getAccounters(),
        api.getLowStockItems()
      ]);
      set({ sales, accounters, lowStockItems: lowStock });
    } catch (error) {
      console.error('Failed to load store data:', error);
    }
  }
}));
