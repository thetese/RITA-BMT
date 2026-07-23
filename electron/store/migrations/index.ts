import { Umzug } from 'umzug';
import fs from 'fs';
import path from 'path';

class BetterSqlite3Storage {
  db: any;
  tableName: string;

  constructor(options: any) {
    this.db = options.db;
    this.tableName = options.tableName || 'SequelizeMeta';
  }

  async logMigration({ name }) {
    this.db.prepare(`INSERT INTO ${this.tableName} (name) VALUES (?)`).run(name);
  }

  async unlogMigration({ name }) {
    this.db.prepare(`DELETE FROM ${this.tableName} WHERE name = ?`).run(name);
  }

  async executed() {
    this.db.prepare(`CREATE TABLE IF NOT EXISTS ${this.tableName} (name TEXT PRIMARY KEY)`).run();
    const rows = this.db.prepare(`SELECT name FROM ${this.tableName} ORDER BY name ASC`).all();
    return rows.map(r => r.name);
  }
}

export const setupMigrations = (db) => {
  return new Umzug({
    migrations: {
      glob: ['electron/store/migrations/!(*index).{ts,js}', { cwd: process.cwd() }],
      resolve: ({ name, path, context }) => {
        const migration = require(path);
        return {
          name,
          up: async () => { if(migration.up) return migration.up({ context }); },
          down: async () => { if(migration.down) return migration.down({ context }); },
        };
      },
    },
    context: db,
    storage: new BetterSqlite3Storage({ db, tableName: 'migrations' }),
    logger: console,
  });
};
