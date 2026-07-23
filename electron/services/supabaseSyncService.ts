import { createClient } from '@supabase/supabase-js';

export class SupabaseSyncService {
  store: any;
  supabase: any;
  isRunning: boolean = false;
  timer: any;

  constructor(store: any) {
    this.store = store;
  }

  start() {
    // Run sync every 30 seconds
    this.timer = setInterval(() => this.sync(), 30000);
    // Initial sync
    setTimeout(() => this.sync(), 5000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  async sync() {
    if (this.isRunning) return;
    
    // Credentials hardcoded to avoid client-facing technical setup
    const url = 'https://xpdgenyyytfmibznhpesg.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwZGdlbnl5dGZtaWJ6bmhwZXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNTczNzQsImV4cCI6MjA5ODkzMzM3NH0.XhKxdN9_7AwxnaEE_Ejvh3OcqCwuhzzczr1771pr_l4';
    
    // Disable cloud sync if using the default non-existent URL to prevent console spam
    if (!url || !key || url.includes('xpdgenyyytfmibznhpesg')) return;

    this.isRunning = true;

    try {
      // Re-initialize client if url or key changes
      if (!this.supabase || this.supabase.supabaseUrl !== url) {
        this.supabase = createClient(url, key);
      }

      const jobs = this.store.getPendingSyncJobs();
      if (!jobs || jobs.length === 0) {
        this.isRunning = false;
        return;
      }

      for (const job of jobs) {
        let success = false;
        try {
          const payload = JSON.parse(job.payload);
          const [table, action] = job.endpoint.split(':');

          if (action === 'upsert') {
            const { error } = await this.supabase.from(table).upsert(payload);
            if (!error) {
              success = true;
            } else {
              console.error(`Supabase Upsert Error for ${job.endpoint}:`, error);
            }
          } else if (action === 'delete') {
            const { error } = await this.supabase.from(table).delete().eq('id', payload.id);
            if (!error) {
              success = true;
            } else {
              console.error(`Supabase Delete Error for ${job.endpoint}:`, error);
            }
          } else {
             // Unknown action, mark successful to remove it from queue
             success = true; 
          }

          if (success) {
            this.store.markSyncJobComplete(job.id);
          } else {
            this.store.incrementSyncJobRetry(job.id);
          }
        } catch (e) {
          console.error("Failed to process sync job", e);
          this.store.incrementSyncJobRetry(job.id);
        }
      }
    } catch (e) {
      console.error("Supabase sync failed critically:", e);
    } finally {
      this.isRunning = false;
    }
  }
}
