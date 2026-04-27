const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/novel.db');

let db = null;

async function initDb() {
  const SQL = await initSqlJs();
  
  const dir = path.dirname(DB_PATH);
  console.log('DB path:', DB_PATH);
  console.log('DB dir exists:', fs.existsSync(dir));
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    console.log('Loading existing DB from:', DB_PATH);
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  // Create tables if not exist
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) NOT NULL UNIQUE,
      pen_name VARCHAR(50) DEFAULT NULL,
      avatar VARCHAR(255) DEFAULT NULL,
      email VARCHAR(100) DEFAULT NULL,
      phone VARCHAR(20) DEFAULT NULL,
      password VARCHAR(255) NOT NULL,
      bio TEXT,
      total_books INTEGER DEFAULT 0,
      total_words INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER DEFAULT 0,
      name VARCHAR(50) NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS novels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id VARCHAR(32) NOT NULL UNIQUE,
      author_id INTEGER NOT NULL,
      title VARCHAR(100) NOT NULL,
      subtitle VARCHAR(100) DEFAULT NULL,
      cover_image VARCHAR(255) DEFAULT NULL,
      summary TEXT,
      category_id INTEGER DEFAULT 0,
      tags VARCHAR(255) DEFAULT NULL,
      status INTEGER DEFAULT 0,
      word_count INTEGER DEFAULT 0,
      chapter_count INTEGER DEFAULT 0,
      last_chapter_id INTEGER DEFAULT NULL,
      last_update_time DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS chapter_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER NOT NULL,
      content TEXT,
      word_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id)
    )
  `);

db.run(`
CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(50) DEFAULT '配角',
      age VARCHAR(20) DEFAULT NULL,
      gender VARCHAR(20) DEFAULT NULL,
      avatar TEXT DEFAULT NULL,
      appearance TEXT DEFAULT NULL,
      personality TEXT DEFAULT NULL,
      background TEXT DEFAULT NULL,
      goals TEXT DEFAULT NULL,
      secrets TEXT DEFAULT NULL,
      weaknesses TEXT DEFAULT NULL,
      tags TEXT DEFAULT NULL,
      arc TEXT DEFAULT NULL,
      habit TEXT DEFAULT NULL,
      skills TEXT DEFAULT NULL,
      relationships TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS worlds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      type VARCHAR(50) NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT DEFAULT NULL,
      icon VARCHAR(10) DEFAULT NULL,
      attributes TEXT DEFAULT NULL,
      relationships TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      genre VARCHAR(50) DEFAULT NULL,
      summary TEXT DEFAULT NULL,
      outline TEXT DEFAULT NULL,
      target_word_count INTEGER DEFAULT 100000,
      style_pref VARCHAR(50) DEFAULT NULL,
      status VARCHAR(20) DEFAULT '新建',
      word_count INTEGER DEFAULT 0,
      cover_image VARCHAR(255) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id VARCHAR(32) DEFAULT NULL,
      project_id INTEGER DEFAULT NULL,
      chapter_no INTEGER NOT NULL,
      title VARCHAR(100) NOT NULL,
      content TEXT DEFAULT NULL,
      word_count INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_novels_author ON novels(author_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_novels_status ON novels(status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_chapters_book ON chapters(book_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
  db.run('CREATE INDEX IF NOT EXISTS idx_characters_project ON characters(project_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_worlds_project ON worlds(project_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name)');
  db.run('CREATE INDEX IF NOT EXISTS idx_chapters_project ON chapters(project_id)');

  // Insert initial categories if empty
  const catCount = db.exec('SELECT COUNT(*) FROM categories')[0]?.values[0][0] || 0;
  if (catCount === 0) {
    db.run(`INSERT INTO categories (id, parent_id, name, sort_order) VALUES (1, 0, '全部', 0)`);
    db.run(`INSERT INTO categories (id, parent_id, name, sort_order) VALUES (2, 1, '玄幻', 1)`);
    db.run(`INSERT INTO categories (id, parent_id, name, sort_order) VALUES (3, 1, '科幻', 2)`);
    db.run(`INSERT INTO categories (id, parent_id, name, sort_order) VALUES (4, 1, '都市', 3)`);
    db.run(`INSERT INTO categories (id, parent_id, name, sort_order) VALUES (5, 1, '历史', 4)`);
    db.run(`INSERT INTO categories (id, parent_id, name, sort_order) VALUES (6, 1, '悬疑', 5)`);
    db.run(`INSERT INTO categories (id, parent_id, name, sort_order) VALUES (7, 1, '言情', 6)`);
    db.run(`INSERT INTO categories (id, parent_id, name, sort_order) VALUES (8, 1, '奇幻', 7)`);
    db.run(`INSERT INTO categories (id, parent_id, name, sort_order) VALUES (9, 1, '军事', 8)`);
    db.run(`INSERT INTO categories (id, parent_id, name, sort_order) VALUES (10, 1, '游戏', 9)`);
  }

  // Insert default users if empty
  const userCount = db.exec('SELECT COUNT(*) FROM users')[0]?.values[0][0] || 0;
  if (userCount === 0) {
    db.run(`INSERT INTO users (username, password, pen_name, bio) VALUES ('admin', 'test123', '管理员', '平台管理员')`);
    db.run(`INSERT INTO users (username, password, pen_name, bio) VALUES ('testuser', 'test123', '明睿', 'AI 赋能的创作者')`);
  }

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
    db.run(sql, params);
    saveDb();
    return { changes: db.getRowsModified() };
  } catch (err) {
    console.error('Run error:', sql, params, err.message);
    throw err;
  }
}

async function getLastInsertRowId() {
  const result = await query('SELECT last_insert_rowid() as id');
  return result[0]?.id || 0;
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