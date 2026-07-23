const fs = require('fs');
const path = require('path');

const modules = [
  { name: 'retail', component: 'RetailPOS' },
  { name: 'restaurant', component: 'RestaurantPOS' },
  { name: 'service', component: 'ServicePOS' },
  { name: 'projects', component: 'Tasks' },
  { name: 'inventory', component: 'ProductsManagement' },
  { name: 'hr', component: 'UsersManagement' },
  { name: 'finance', component: 'Expenses' }
];

modules.forEach(m => {
  const code = `import React from 'react';
import ${m.component} from '../components/${m.component}';
import { ToastProvider } from '../components/ui/Toast';
import { ConfirmProvider } from '../components/ui/Confirm';

(window as any).RitaPlugin = {
  mount: (container: HTMLElement, props: any) => {
    const ReactDOM = (window as any).ReactDOM;
    const root = ReactDOM.createRoot(container);
    root.render(
      <ToastProvider>
        <ConfirmProvider>
          <${m.component} {...props.appProps} />
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
};`;
  fs.writeFileSync(path.join('src', 'plugins', m.name + '.tsx'), code);
});
console.log('Created all 7 plugin wrappers.');
