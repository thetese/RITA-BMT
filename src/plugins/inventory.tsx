import React from 'react';
import ProductsManagement from '../components/ProductsManagement';
import { ToastProvider } from '../components/ui/Toast';
import { ConfirmProvider } from '../components/ui/Confirm';

(window as any).RitaPlugin = {
  mount: (container: HTMLElement, props: any) => {
    const ReactDOM = (window as any).ReactDOM;
    const root = ReactDOM.createRoot(container);
    root.render(
      <ToastProvider>
        <ConfirmProvider>
          <ProductsManagement {...props.appProps} />
        </ConfirmProvider>
      </ToastProvider>
    );
    (window as any).RitaPlugin._root = root;
  },
  unmount: () => {
    const root = (window as any).RitaPlugin._root;
    if (root) {
      root.unmount();
    }
  }
};