const crypto = require('crypto');

module.exports = (app, ipcMain, store) => {
  console.log("Initializing Hotel PMS Plugin Backend...");
  const db = store.db;

  // 1. Inject Database Schema
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS hotel_properties (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT
      );

      -- Default property if none exists
      INSERT OR IGNORE INTO hotel_properties (id, name, address) VALUES ('default', 'Main Hotel', '123 Main St');

      CREATE TABLE IF NOT EXISTS hotel_rooms (
        id TEXT PRIMARY KEY,
        propertyId TEXT DEFAULT 'default',
        roomNumber TEXT NOT NULL,
        type TEXT NOT NULL,
        pricePerNight REAL NOT NULL,
        status TEXT DEFAULT 'Clean',
        capacity INTEGER DEFAULT 2
      );

      CREATE TABLE IF NOT EXISTS hotel_rate_plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        price REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS hotel_reservations (
        id TEXT PRIMARY KEY,
        propertyId TEXT DEFAULT 'default',
        customerId TEXT,
        customerName TEXT NOT NULL,
        roomId TEXT NOT NULL,
        checkInDate TEXT NOT NULL,
        checkOutDate TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        ratePlanId TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS hotel_folios (
        id TEXT PRIMARY KEY,
        reservationId TEXT NOT NULL,
        folioType TEXT DEFAULT 'A', -- A = Master/Company, B = Guest/Incidentals
        charges TEXT DEFAULT '[]', -- JSON array
        payments TEXT DEFAULT '[]', -- JSON array
        balance REAL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS hotel_housekeeping (
        id TEXT PRIMARY KEY,
        roomId TEXT NOT NULL,
        status TEXT NOT NULL,
        assignedTo TEXT,
        notes TEXT,
        updatedAt TEXT
      CREATE TABLE IF NOT EXISTS hotel_guests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        preferences TEXT,
        vipStatus TEXT DEFAULT 'Standard',
        totalStays INTEGER DEFAULT 0,
        createdAt TEXT
      );
      `);
      
      // Migrations for existing tables
      try { db.exec("ALTER TABLE hotel_rooms ADD COLUMN propertyId TEXT DEFAULT 'default'"); } catch (e) {}
      try { db.exec("ALTER TABLE hotel_rooms ADD COLUMN capacity INTEGER DEFAULT 2"); } catch (e) {}
      try { db.exec("ALTER TABLE hotel_reservations ADD COLUMN propertyId TEXT DEFAULT 'default'"); } catch (e) {}
      try { db.exec("ALTER TABLE hotel_reservations ADD COLUMN ratePlanId TEXT"); } catch (e) {}
      try { db.exec("ALTER TABLE hotel_reservations ADD COLUMN groupId TEXT"); } catch (e) {}
      try { db.exec("ALTER TABLE hotel_rate_plans ADD COLUMN roomType TEXT DEFAULT 'All'"); } catch (e) {}
      try { db.exec("ALTER TABLE hotel_rate_plans ADD COLUMN basePrice REAL DEFAULT 0"); } catch (e) {}
      try { db.exec("ALTER TABLE hotel_rate_plans ADD COLUMN currency TEXT DEFAULT 'FRW'"); } catch (e) {}
      try { db.exec("ALTER TABLE hotel_rate_plans ADD COLUMN weekendPremium REAL DEFAULT 0"); } catch (e) {}
      try { db.exec("ALTER TABLE hotel_rate_plans ADD COLUMN isActive INTEGER DEFAULT 1"); } catch (e) {}
      
      db.exec(`
        CREATE TABLE IF NOT EXISTS hotel_night_audit (
          id TEXT PRIMARY KEY,
          date TEXT NOT NULL,
          roomsOccupied INTEGER,
          totalRevenue REAL,
          runBy TEXT,
          createdAt TEXT
        );
      `);
      
    console.log("Hotel PMS extended tables created/verified successfully.");
  } catch (err) {
    console.error("Failed to inject Hotel PMS tables:", err);
  }

  // Properties
  ipcMain.handle('hotel:getProperties', () => {
    return db.prepare('SELECT * FROM hotel_properties').all();
  });

  // Rooms
  ipcMain.handle('hotel:getRooms', (event, propertyId = 'default') => {
    return db.prepare('SELECT * FROM hotel_rooms WHERE propertyId = ? ORDER BY roomNumber ASC').all(propertyId);
  });

  ipcMain.handle('hotel:addRoom', (event, room) => {
    const id = crypto.randomUUID();
    const stmt = db.prepare('INSERT INTO hotel_rooms (id, propertyId, roomNumber, type, pricePerNight, status, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, room.propertyId || 'default', room.roomNumber, room.type, room.pricePerNight, room.status || 'Clean', room.capacity || 2);
    return { id, ...room };
  });

  ipcMain.handle('hotel:updateRoomStatus', (event, id, status) => {
    const stmt = db.prepare('UPDATE hotel_rooms SET status = ? WHERE id = ?');
    stmt.run(status, id);
    // Log in housekeeping
    db.prepare(`INSERT INTO hotel_housekeeping (id, roomId, status, updatedAt) VALUES (?, ?, ?, datetime('now'))`).run(crypto.randomUUID(), id, status);
    return true;
  });

  // Rate Plans
  ipcMain.handle('hotel:getRatePlans', () => {
    return db.prepare('SELECT * FROM hotel_rate_plans').all();
  });

  ipcMain.handle('hotel:addRatePlan', (event, plan) => {
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO hotel_rate_plans (id, name, type, price, roomType, basePrice, currency, weekendPremium, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, plan.name, plan.type || 'Standard', plan.price || 0, plan.roomType || 'All', plan.basePrice || 0, plan.currency || 'FRW', plan.weekendPremium || 0, plan.isActive ? 1 : 0);
    return { id, ...plan };
  });

  ipcMain.handle('hotel:updateRatePlan', (event, id, plan) => {
    db.prepare('UPDATE hotel_rate_plans SET name = ?, roomType = ?, basePrice = ?, currency = ?, weekendPremium = ?, isActive = ? WHERE id = ?').run(plan.name, plan.roomType, plan.basePrice, plan.currency, plan.weekendPremium, plan.isActive ? 1 : 0, id);
    return true;
  });

  ipcMain.handle('hotel:deleteRatePlan', (event, id) => {
    db.prepare('DELETE FROM hotel_rate_plans WHERE id = ?').run(id);
    return true;
  });

  // Reservations
  ipcMain.handle('hotel:getReservations', (event, propertyId = 'default') => {
    return db.prepare(`
      SELECT r.*, rm.roomNumber, rm.type as roomType 
      FROM hotel_reservations r
      LEFT JOIN hotel_rooms rm ON r.roomId = rm.id
      WHERE r.propertyId = ?
      ORDER BY r.checkInDate DESC
    `).all(propertyId);
  });

  ipcMain.handle('hotel:addReservation', (event, res) => {
    const id = crypto.randomUUID();
    const stmt = db.prepare(`INSERT INTO hotel_reservations (id, propertyId, customerId, customerName, roomId, checkInDate, checkOutDate, status, ratePlanId, groupId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`);
    stmt.run(id, res.propertyId || 'default', res.customerId || '', res.customerName, res.roomId, res.checkInDate, res.checkOutDate, res.status || 'Pending', res.ratePlanId || null, res.groupId || null);
    
    // Create Default Folio A
    db.prepare('INSERT INTO hotel_folios (id, reservationId, folioType) VALUES (?, ?, "A")').run(crypto.randomUUID(), id);
    
    if (res.status === 'Checked-In') {
      db.prepare('UPDATE hotel_rooms SET status = "Occupied" WHERE id = ?').run(res.roomId);
    }
    
    return { id, ...res };
  });

  ipcMain.handle('hotel:updateReservationStatus', (event, id, status, roomId) => {
    const stmt = db.prepare('UPDATE hotel_reservations SET status = ? WHERE id = ?');
    stmt.run(status, id);
    
    if (status === 'Checked-In') {
      db.prepare('UPDATE hotel_rooms SET status = "Occupied" WHERE id = ?').run(roomId);
    } else if (status === 'Checked-Out' || status === 'Cancelled') {
      db.prepare('UPDATE hotel_rooms SET status = "Dirty" WHERE id = ?').run(roomId);
    }
    
    return true;
  });

  // Folios & Charges
  ipcMain.handle('hotel:getFolios', (event, reservationId) => {
    return db.prepare('SELECT * FROM hotel_folios WHERE reservationId = ?').all(reservationId);
  });

  ipcMain.handle('hotel:addFolio', (event, reservationId, folioType) => {
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO hotel_folios (id, reservationId, folioType) VALUES (?, ?, ?)').run(id, reservationId, folioType);
    return id;
  });

  ipcMain.handle('hotel:addChargeToRoom', (event, roomId, amount, description = 'Room Charge', folioType = 'A') => {
    const activeRes = db.prepare('SELECT id FROM hotel_reservations WHERE roomId = ? AND status = "Checked-In"').get(roomId);
    if (!activeRes) return false;

    const folio = db.prepare('SELECT id, charges, balance FROM hotel_folios WHERE reservationId = ? AND folioType = ?').get(activeRes.id, folioType);
    if (!folio) return false;

    let charges = JSON.parse(folio.charges || '[]');
    charges.push({ date: new Date().toISOString(), description, amount });
    const newBalance = folio.balance + amount;

    db.prepare('UPDATE hotel_folios SET charges = ?, balance = ? WHERE id = ?').run(JSON.stringify(charges), newBalance, folio.id);
    return true;
  });

  ipcMain.handle('hotel:addPaymentToFolio', (event, folioId, amount, method) => {
    const folio = db.prepare('SELECT payments, balance FROM hotel_folios WHERE id = ?').get(folioId);
    if (!folio) return false;

    let payments = JSON.parse(folio.payments || '[]');
    payments.push({ date: new Date().toISOString(), method, amount });
    const newBalance = folio.balance - amount;

    db.prepare('UPDATE hotel_folios SET payments = ?, balance = ? WHERE id = ?').run(JSON.stringify(payments), newBalance, folioId);
    return true;
  });

  // Housekeeping
  ipcMain.handle('hotel:getHousekeepingTasks', () => {
    return db.prepare(`
      SELECT h.*, r.roomNumber 
      FROM hotel_housekeeping h
      JOIN hotel_rooms r ON h.roomId = r.id
      ORDER BY h.updatedAt DESC
      LIMIT 100
    `).all();
  });
  // Guests
  ipcMain.handle('hotel:getGuests', () => {
    return db.prepare('SELECT * FROM hotel_guests ORDER BY name ASC').all();
  });

  ipcMain.handle('hotel:addGuest', (event, guest) => {
    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO hotel_guests (id, name, email, phone, preferences, vipStatus, totalStays, createdAt) 
      VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))
    `);
    stmt.run(id, guest.name, guest.email || '', guest.phone || '', guest.preferences || '', guest.vipStatus || 'Standard');
    return { id, ...guest };
  });

  ipcMain.handle('hotel:updateGuest', (event, id, data) => {
    const stmt = db.prepare(`
      UPDATE hotel_guests 
      SET name = ?, email = ?, phone = ?, preferences = ?, vipStatus = ?
      WHERE id = ?
    `);
    stmt.run(data.name, data.email || '', data.phone || '', data.preferences || '', data.vipStatus || 'Standard', id);
    return true;
  });

  // Night Audit
  ipcMain.handle('hotel:runNightAudit', (event, data) => {
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO hotel_night_audit (id, date, roomsOccupied, totalRevenue, runBy, createdAt) VALUES (?, ?, ?, ?, ?, datetime("now"))').run(id, data.date, data.roomsOccupied, data.totalRevenue, data.runBy);
    
    // In a real system, here we would post room charges to all active folios for 'Occupied' rooms.
    return { id, success: true };
  });

  ipcMain.handle('hotel:getNightAudits', () => {
    return db.prepare('SELECT * FROM hotel_night_audit ORDER BY createdAt DESC').all();
  });

};
