const { query, run, getLastInsertRowId, transaction } = require('../db');

class Novel {
  static async findAll(where = {}) {
    let sql = 'SELECT * FROM novels WHERE 1=1';
    const params = [];
    if (where.author_id) { sql += ' AND author_id = ?'; params.push(where.author_id); }
    if (where.status !== undefined) { sql += ' AND status = ?'; params.push(where.status); }
    if (where.category_id !== undefined) { sql += ' AND category_id = ?'; params.push(where.category_id); }
    sql += ' ORDER BY updated_at DESC';
    return query(sql, params);
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM novels WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByBookId(bookId) {
    const rows = await query('SELECT * FROM novels WHERE book_id = ?', [bookId]);
    return rows[0] || null;
  }

static async create(data) {
    const { book_id: provided_book_id, author_id, title, subtitle, cover_image, summary, category_id, tags, status, word_count, chapter_count } = data;
    const book_id = provided_book_id || 'BK' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase();
    const sql = `INSERT INTO novels (book_id, author_id, title, subtitle, cover_image, summary, category_id, tags, status, word_count, chapter_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await run(sql, [book_id, author_id, title, subtitle || null, cover_image || null, summary || null, category_id || 0, tags || null, status || 0, word_count || 0, chapter_count || 0]);
    const id = await getLastInsertRowId();
    return {
      id, book_id, author_id, title,
      subtitle: subtitle || null, cover_image: cover_image || null,
      summary: summary || null, category_id: category_id || 0,
      tags: tags || null, status: status || 0,
      word_count: word_count || 0, chapter_count: chapter_count || 0
    };
  }

  static async update(id, data) {
    const ALLOWED = ['title','subtitle','cover_image','summary','category_id','tags','status','word_count','chapter_count','last_update_time'];
    const sets = [];
    const params = [];
    for (const [k, v] of Object.entries(data)) {
      if (k === 'id' || !ALLOWED.includes(k)) continue;
      sets.push(`${k} = ?`);
      params.push(v);
    }
    if (sets.length === 0) return this.findById(id);
    params.push(id);
    await run(`UPDATE novels SET ${sets.join(',')} WHERE id = ?`, params);
    return this.findById(id);
  }

  static async delete(id) {
    const novel = await this.findById(id);
    if (!novel) return false;
    await run('DELETE FROM novels WHERE id = ?', [id]);
    return true;
  }

  static async updateWordCount(id, delta = 0) {
    const chapters = await query('SELECT SUM(word_count) as total FROM chapters WHERE book_id = ?', [id]);
    const totalWords = chapters[0]?.total || 0;
    await run(`UPDATE novels SET word_count = ? WHERE id = ?`, [totalWords, id]);
  }
}

module.exports = Novel;