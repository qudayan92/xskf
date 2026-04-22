const { query, run, getLastInsertRowId } = require('../db');

class Chapter {
  static async findByBookId(bookId) {
    return query('SELECT * FROM chapters WHERE book_id = ? ORDER BY chapter_no ASC', [bookId]);
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM chapters WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const { book_id, chapter_no, chapter_title, content, status = 0 } = data;
    const wordCount = (content || '').replace(/\s/g, '').length;
    const sql = `INSERT INTO chapters (book_id, chapter_no, chapter_title, content, word_count, status) VALUES (?, ?, ?, ?, ?, ?)`;
    await run(sql, [book_id, chapter_no, chapter_title, content, wordCount, status]);
    const insertId = await getLastInsertRowId();
    return this.findById(insertId);
  }

  static async update(id, data) {
    const sets = [];
    const params = [];
    for (const [k, v] of Object.entries(data)) {
      if (k === 'id') continue;
      if (k === 'content') {
        sets.push(`${k} = ?, word_count = ?`);
        params.push(v);
        params.push((v || '').replace(/\s/g, '').length);
      } else {
        sets.push(`${k} = ?`);
        params.push(v);
      }
    }
    if (sets.length === 0) return;
    params.push(id);
    await run(`UPDATE chapters SET ${sets.join(',')} WHERE id = ?`, params);
    return this.findById(id);
  }

  static async delete(id) {
    const ch = await this.findById(id);
    await run('DELETE FROM chapters WHERE id = ?', [id]);
    if (ch) {
      const chapters = await query('SELECT SUM(word_count) as total, COUNT(*) as count FROM chapters WHERE book_id = ?', [ch.book_id]);
      const totalWords = chapters[0]?.total || 0;
      const chapterCount = chapters[0]?.count || 0;
      await run('UPDATE novels SET word_count = ?, chapter_count = ? WHERE id = ?', [totalWords, chapterCount, ch.book_id]);
    }
  }

  static async getNextChapterNo(bookId) {
    const rows = await query('SELECT COALESCE(MAX(chapter_no), 0) + 1 AS next_no FROM chapters WHERE book_id = ?', [bookId]);
    return rows[0]?.next_no || 1;
  }
}

module.exports = Chapter;