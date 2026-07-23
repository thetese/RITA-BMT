const path = require('path');
const { app } = require('electron');
const Database = require('better-sqlite3');
const coreStore = require('./store/coreStore');
const restaurantStore = require('./store/restaurantStore');
const retailStore = require('./store/retailStore');

import { setupMigrations } from './store/migrations';

class Store {
  dbPath: string;
  db: any;

  constructor(dbPath?: string) {
    // If not running in electron (e.g. tests), app might be undefined or missing getPath
    const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
    
    if (dbPath) {
      this.dbPath = dbPath;
    } else {
      const fs = require('fs');
      const isPackaged = app.isPackaged;
      const baseDir = isPackaged ? path.dirname(app.getPath('exe')) : app.getAppPath();
      
      const appType = process.env.VITE_APP_TYPE || 'retail';
      const dbFilename = `sales_${appType}.db`;
      
      this.dbPath = path.join(baseDir, dbFilename);
      
      const oldDbPath = path.join(app.getPath('userData'), dbFilename);
      // If the database doesn't exist in the new app folder yet, but exists in the old AppData folder, copy it over
      if (!fs.existsSync(this.dbPath) && fs.existsSync(oldDbPath)) {
        try {
          fs.copyFileSync(oldDbPath, this.dbPath);
          console.log('Migrated database to app folder.');
        } catch (err) {
          console.error('Could not migrate old database:', err);
        }
      }
    }
    
    this.db = new Database(this.dbPath);
    this.init();
  }

  async init() {
    const umzug = setupMigrations(this.db);
    try {
      await umzug.up();
      console.log('Database migrations executed successfully.');
    } catch (error) {
      console.error('Error executing migrations:', error);
    }
  }
}

// Mixin the store methods into the Store class prototype
Object.assign(Store.prototype, coreStore, restaurantStore, retailStore);

module.exports = Store;
