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
      this.dbPath = path.join(app.getPath('userData'), 'sales.db');
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
