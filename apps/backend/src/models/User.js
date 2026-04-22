const { query, run, getLastInsertRowId } = require('../db');

class User {
  static async findAll() {
    return query('SELECT id, username, pen_name, avatar, email, bio, total_books, total_words, created_at FROM users ORDER BY created_at DESC');
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows[0]) delete rows[0].password;
    return rows[0] || null;
  }

  static async findByUsername(username) {
    const rows = await query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  }

  static async create(data) {
    const { username, pen_name, avatar, email, phone, password, bio } = data;
    const sql = `INSERT INTO users (username, pen_name, avatar, email, phone, password, bio) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await run(sql, [username, pen_name || null, avatar || null, email || null, phone || null, password, bio || null]);
    const id = await getLastInsertRowId();
    return this.findById(id);
  }

  static async update(id, data) {
    const sets = [];
    const params = [];
    for (const [k, v] of Object.entries(data)) {
      if (k === 'id' || k === 'password') continue;
      sets.push(`${k} = ?`);
      params.push(v);
    }
    if (data.password) {
      sets.push('password = ?');
      params.push(data.password);
    }
    if (sets.length === 0) return;
    params.push(id);
    await run(`UPDATE users SET ${sets.join(',')} WHERE id = ?`, params);
    return this.findById(id);
  }

  static async delete(id) {
    await run('DELETE FROM users WHERE id = ?', [id]);
  }

  static async updateStats(userId, booksDelta = 0, wordsDelta = 0) {
    await run(
      'UPDATE users SET total_books = total_books + ?, total_words = total_words + ? WHERE id = ?',
      [booksDelta, wordsDelta, userId]
    );
  }

  static async verifyPassword(username, plainPassword) {
    const user = await this.findByUsername(username);
    if (!user) return null;
    if (user.password !== plainPassword) return null;
    delete user.password;
    return user;
  }
}

module.exports = User;