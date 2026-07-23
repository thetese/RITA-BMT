const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

function startServer(store, port = 4000) {
  const app = express();
  const http = require('http');
  const server = http.createServer(app);
  const { Server } = require('socket.io');
  
  // Real-time WebSockets setup
  const io = new Server(server, {
    cors: { origin: ['http://localhost:5173', 'file://'] }
  });

  io.on('connection', (socket) => {
    console.log('Client connected for real-time updates:', socket.id);
  });
  
  app.use(helmet());
  app.use(cors({ origin: ['http://localhost:5173', 'file://'] }));
  app.use(express.json());

  // Rate Limiting for API routes
  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
  });
  app.use('/api', apiLimiter);

  // JWT Authentication Middleware
  const authMiddleware = require('./middleware/auth')(store);
  app.use('/api', authMiddleware);

  // Routes Setup
  const authRouter = require('./routes/auth')(store);
  const productsRouter = require('./routes/products')(store);
  const salesRouter = require('./routes/sales')(store, io);
  const customersRouter = require('./routes/customers')(store);
  const dashboardRouter = require('./routes/dashboard')(store);
  const inventoryRouter = require('./routes/inventory')(store);

  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/sales', salesRouter);
  app.use('/api/customers', customersRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/inventory', inventoryRouter);

  // Stripe Checkout Session
  app.post('/api/stripe/create-checkout', async (req, res) => {
    try {
      const stripeSecretKey = store.getSetting('stripeSecretKey');
      if (!stripeSecretKey) {
        return res.status(400).json({ error: 'Stripe Secret Key not configured in Settings' });
      }
      
      const stripe = require('stripe')(stripeSecretKey);
      const { amount, currency = 'rwf', description = 'POS Order' } = req.body;
      
      // For POS, we just want a simple charge. 
      // RWF isn't fully supported for all Stripe features, fallback to USD if needed
      // Actually, Stripe requires amount in smallest currency unit (e.g. cents)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: currency,
            product_data: { name: description },
            unit_amount: Math.round(amount * 100), // convert to cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        // In an electron app, we don't have a real return URL. Just return to localhost.
        success_url: `http://localhost:${port}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:${port}/api/stripe/cancel`,
      });

      res.json({ url: session.url, id: session.id });
    } catch (e) {
      console.error("Stripe Error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/stripe/success', (req, res) => {
    res.send('<html><body><h1 style="color:green; text-align:center; font-family:sans-serif; margin-top:50px;">Payment Successful!</h1><p style="text-align:center; font-family:sans-serif;">You can close this window and return to the POS.</p><script>setTimeout(() => window.close(), 3000);</script></body></html>');
  });

  app.get('/api/stripe/cancel', (req, res) => {
    res.send('<html><body><h1 style="color:red; text-align:center; font-family:sans-serif; margin-top:50px;">Payment Cancelled</h1><p style="text-align:center; font-family:sans-serif;">You can close this window and return to the POS.</p><script>setTimeout(() => window.close(), 3000);</script></body></html>');
  });

  // Third-Party Reporting API Extensibility
  app.get('/api/reports/sales', (req, res) => {
    try {
      const sales = store.getSales();
      res.json({ success: true, data: sales });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/reports/products', (req, res) => {
    try {
      const products = store.getProducts();
      res.json({ success: true, data: products });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error('Express Server Error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  server.listen(port, () => {
    console.log(`Local Sync Server with WebSockets running on http://localhost:${port}`);
  });
}

function startCloudSync(store, sendToWindow) {
  console.log("Cloud Sync Engine initialized. Worker starting...");
  
  let supabase = null;
  let realtimeChannel = null;

  const initSupabase = () => {
    const supabaseUrl = store.getSetting('supabaseUrl');
    const supabaseKey = store.getSetting('supabaseKey');
    if (!supabaseUrl || !supabaseKey) return false;

    if (!supabase) {
      supabase = createClient(supabaseUrl, supabaseKey);
      
      // Initialize Realtime Listeners
      realtimeChannel = supabase.channel('public-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, payload => {
          console.log(`[SYNC] Received remote ${payload.eventType} on ${payload.table}`);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            try {
              // Generalized local upsert from cloud
              const table = payload.table;
              const data = payload.new;
              
              if (table === 'held_carts') {
                const stmt = store.db.prepare(`
                  INSERT INTO held_carts (id, name, cartData, waiterName, createdAt, updatedAt, storeId, syncStatus)
                  VALUES (@id, @name, @cart_data, @waiter_name, @created_at, @updated_at, @store_id, 'SYNCED')
                  ON CONFLICT(id) DO UPDATE SET 
                  name=excluded.name, cartData=excluded.cartData, waiterName=excluded.waiterName, 
                  updatedAt=excluded.updatedAt, syncStatus='SYNCED'
                `);
                stmt.run({
                  id: data.id, name: data.name, cart_data: data.cart_data, waiter_name: data.waiter_name,
                  created_at: data.created_at, updated_at: data.updated_at, store_id: data.store_id
                });
              }
              // Add other tables as needed...

              // Notify renderer to refresh data
              if (sendToWindow) sendToWindow('cloud:update', { table: payload.table, action: payload.eventType, data: payload.new });
            } catch (err) {
              console.error("[SYNC] Error applying cloud update locally:", err);
            }
          }
        })
        .subscribe((status) => {
          console.log('[SYNC] Realtime subscription status:', status);
        });
    }
    return true;
  };

  // Run queue processor every 2 minutes
  setInterval(async () => {
    try {
      if (!initSupabase()) return;

      const pendingJobs = store.getPendingSyncJobs();
      if (pendingJobs.length === 0) return;

      console.log(`[SYNC] Processing ${pendingJobs.length} offline jobs to Supabase...`);

      for (const job of pendingJobs) {
        if (job.retryCount > 10) continue; // Skip if failing too much

        try {
          const payload = JSON.parse(job.payload);
          let table = '';
          let action = 'upsert';

          // Parse endpoint format 'table:action' or legacy '/api/cloud/table'
          if (job.endpoint.includes(':')) {
            const parts = job.endpoint.split(':');
            table = parts[0];
            action = parts[1] || 'upsert';
          } else if (job.endpoint.startsWith('/api/cloud/')) {
            const parts = job.endpoint.split('/');
            table = parts[3]; // e.g. 'sales'
            if (parts[4] === 'delete') {
              action = 'delete';
            }
          } else {
             // Fallback for any unknown format
             table = 'sales';
          }

          if (!table) {
            throw new Error(`Invalid sync endpoint format: ${job.endpoint}`);
          }

          let resultError = null;

          if (action === 'upsert') {
            const { error } = await supabase
              .from(table)
              .upsert(payload, { onConflict: 'id' });
            resultError = error;
          } else if (action === 'delete') {
            const { error } = await supabase
              .from(table)
              .delete()
              .eq('id', payload.id);
            resultError = error;
          } else {
             throw new Error(`Unknown sync action: ${action}`);
          }

          if (resultError) {
            throw resultError;
          }
          
          // If successful, remove from queue
          store.markSyncJobComplete(job.id);
          console.log(`[SYNC] Successfully processed ${action} on ${table} for job ${job.id}`);
        } catch (syncErr) {
          console.error(`[SYNC] Job ${job.id} failed to sync to Supabase:`, syncErr);
          store.incrementSyncJobRetry(job.id);
        }
      }
    } catch (e) {
      console.error("Sync Engine error:", e);
    }
  }, 120000); 
}

module.exports = { startServer, startCloudSync };
export {};
