const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/novel.db');

let db = null;

async function initDb() {
  const SQL = await initSqlJs();

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`PRAGMA foreign_keys = ON`);

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      genre VARCHAR(50) DEFAULT NULL,
      summary TEXT DEFAULT NULL,
      target_word_count INTEGER DEFAULT 100000,
      status VARCHAR(20) DEFAULT 'draft',
      word_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      chapter_no INTEGER NOT NULL,
      title VARCHAR(100) NOT NULL,
      content TEXT DEFAULT '',
      word_count INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(50) DEFAULT '配角',
      age VARCHAR(20) DEFAULT NULL,
      gender VARCHAR(20) DEFAULT NULL,
      personality TEXT DEFAULT NULL,
      appearance TEXT DEFAULT NULL,
      background TEXT DEFAULT NULL,
      goals TEXT DEFAULT NULL,
      tags VARCHAR(255) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS world_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      type VARCHAR(50) NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT DEFAULT NULL,
      icon VARCHAR(10) DEFAULT NULL,
      attributes TEXT DEFAULT NULL,
      relationships TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_chapters_project ON chapters(project_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_characters_project ON characters(project_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_world_items_project ON world_items(project_id)');

  saveDb();
  return db;
}

function getDb() {
  return db;
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

async function query(sql, params = []) {
  if (!db) await initDb();

  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);

    const results = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row);
    }
    stmt.free();

    return results;
  } catch (err) {
    console.error('Query error:', sql, params, err.message);
    throw err;
  }
}

async function run(sql, params = []) {
  if (!db) await initDb();

  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    stmt.step();
    const changes = db.getRowsModified();
    const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
    let lastId = 0;
    if (isInsert) {
      const result = db.exec('SELECT last_insert_rowid()');
      if (result.length > 0 && result[0].values.length > 0) {
        lastId = result[0].values[0][0];
      }
    }
    stmt.free();
    saveDb();
    return { changes, lastId };
  } catch (err) {
    console.error('Run error:', sql, params, err.message);
    throw err;
  }
}

async function getLastInsertRowId() {
  if (!db) await initDb();
  try {
    const result = db.exec('SELECT last_insert_rowid()');
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0];
    }
    return 0;
  } catch (err) {
    console.error('getLastInsertRowId error:', err.message);
    return 0;
  }
}

async function transaction(callback) {
  if (!db) await initDb();

  try {
    db.run('BEGIN TRANSACTION');
    await callback();
    db.run('COMMIT');
    saveDb();
  } catch (err) {
    db.run('ROLLBACK');
    throw err;
  }
}

module.exports = { initDb, getDb, query, run, getLastInsertRowId, transaction, saveDb };
