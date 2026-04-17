const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

let dbPromise = open({
  filename: path.join(__dirname, '..', 'database.sqlite'),
  driver: sqlite3.Database
});

const pool = {
  execute: async (sql, params = []) => {
    const db = await dbPromise;
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
    
    if (isSelect) {
      const rows = await db.all(sql, params);
      return [rows, []];
    } else {
      const result = await db.run(sql, params);
      return [{ insertId: result.lastID, affectedRows: result.changes }, []];
    }
  }
};

dbPromise.then(async (db) => {
  const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    try {
      const row = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='students'");
      if (!row) {
        console.log('Migrating database from schema.sql to SQLite...');
        let schemaStr = fs.readFileSync(schemaPath, 'utf8');
        
        // Convert MySQL schema features into SQLite
        schemaStr = schemaStr.replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
        schemaStr = schemaStr.replace(/SET FOREIGN_KEY_CHECKS = 0;/gi, 'PRAGMA foreign_keys = OFF;');
        schemaStr = schemaStr.replace(/SET FOREIGN_KEY_CHECKS = 1;/gi, 'PRAGMA foreign_keys = ON;');
        
        const statements = schemaStr.split(';').filter(s => s.trim().length > 0);
        for (let stmt of statements) {
          await db.run(stmt);
        }
        console.log('Local database seeded successfully.');
      }
    } catch (e) {
      console.error("Migration error:", e);
    }
  }
});

module.exports = pool;
