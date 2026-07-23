import { IpcMain } from 'electron';
import Stripe from 'stripe';

export const registerSystemControllers = (ipcMain: IpcMain, store: any, reportScheduler: any) => {
  // Database
  ipcMain.handle('db:backup', (event) => store.backupDatabase(event.sender));
  ipcMain.handle('db:restore', (event) => store.restoreDatabase(event.sender));

  // Settings
  ipcMain.handle('settings:get', (_, key) => store.getSetting(key));
  ipcMain.handle('settings:set', (_, key, value) => store.setSetting(key, value));
  ipcMain.handle('settings:getAll', () => store.getAllSettings ? store.getAllSettings() : {});

  // Displays
  ipcMain.handle('displays:getAll', () => {
    const { screen } = require('electron');
    return screen.getAllDisplays().map(d => ({
      id: d.id,
      bounds: d.bounds,
      scaleFactor: d.scaleFactor,
      isPrimary: d.id === screen.getPrimaryDisplay().id
    }));
  });

  // Reports
  ipcMain.handle('reports:generate', (_, timeframe) => reportScheduler.generateReport(timeframe));

  // Stripe
  ipcMain.handle('stripe:createCheckout', async (_, payload) => {
    try {
      const stripeSecretKey = store.getSetting('stripeSecretKey');
      if (!stripeSecretKey) return { success: false, error: 'Stripe Secret Key not configured in Settings' };
      
      const stripe = new Stripe(stripeSecretKey);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: payload.currency || 'rwf',
            product_data: { name: payload.description || 'POS Order' },
            unit_amount: Math.round(payload.amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `http://localhost:4000/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:4000/api/stripe/cancel`,
      });
      return { success: true, url: session.url, id: session.id };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
};
