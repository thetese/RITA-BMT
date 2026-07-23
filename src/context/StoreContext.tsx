import React, { createContext, useContext, useState, useEffect } from 'react';

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  createdAt?: string;
}

interface StoreContextType {
  currentStore: StoreLocation | null;
  setCurrentStore: (store: StoreLocation) => void;
  availableStores: StoreLocation[];
  refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType>({
  currentStore: null,
  setCurrentStore: () => {},
  availableStores: [],
  refreshStores: async () => {},
});

export const useStoreLocation = () => useContext(StoreContext);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStore, setCurrentStore] = useState<StoreLocation | null>(null);
  const [availableStores, setAvailableStores] = useState<StoreLocation[]>([]);

  const refreshStores = async () => {
    try {
      const stores = await window.api.getStores();
      setAvailableStores(stores);
      
      // Default to user's assigned store, or the first available store
      if (!currentStore && stores.length > 0) {
        // Retrieve last selected store from localStorage or default
        const savedStoreId = localStorage.getItem('currentStoreId');
        const defaultStore = stores.find((s: StoreLocation) => s.id === savedStoreId) || stores[0];
        setCurrentStore(defaultStore);
      }
    } catch (err) {
      console.error("Failed to fetch stores:", err);
    }
  };

  useEffect(() => {
    refreshStores();
  }, []);

  const handleSetCurrentStore = (store: StoreLocation) => {
    setCurrentStore(store);
    localStorage.setItem('currentStoreId', store.id);
    
    // Optionally trigger a global event or reload data for the new store
    window.dispatchEvent(new CustomEvent('store-changed', { detail: store }));
  };

  return (
    <StoreContext.Provider value={{ currentStore, setCurrentStore: handleSetCurrentStore, availableStores, refreshStores }}>
      {children}
    </StoreContext.Provider>
  );
};
