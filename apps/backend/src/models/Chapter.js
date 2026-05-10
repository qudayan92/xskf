const { query, run } = require('../db');

const Chapter = {
  async findByProject(projectId) {
    return query(
      'SELECT * FROM chapters WHERE project_id = ? ORDER BY chapter_no ASC',
      [projectId]
    );
  },

  async findById(id) {
    const rows = await query('SELECT * FROM chapters WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { project_id, chapter_no, title, content = '', status = 'draft' } = data;
    const word_count = content.length;
    const { lastId } = await run(
      'INSERT INTO chapters (project_id, chapter_no, title, content, word_count, status) VALUES (?, ?, ?, ?, ?, ?)',
      [project_id, chapter_no, title, content, word_count, status]
    );
    return Chapter.findById(lastId);
  },

  async update(id, data) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return Chapter.findById(id);

    // Recalculate word_count if content changed
    if (data.content !== undefined) {
      fields.push('word_count = ?');
      values.push(data.content.length);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await run(
      `UPDATE chapters SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return Chapter.findById(id);
  },

  async delete(id) {
    await run('DELETE FROM chapters WHERE id = ?', [id]);
    return { deleted: true };
  },

  async reorder(projectId, chapterIds) {
    for (let i = 0; i < chapterIds.length; i++) {
      await run(
        'UPDATE chapters SET chapter_no = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?',
        [i + 1, chapterIds[i], projectId]
      );
    }
    return Chapter.findByProject(projectId);
  },

  async countByProject(projectId) {
    const rows = await query(
      'SELECT COUNT(*) as count, COALESCE(SUM(word_count), 0) as total_words FROM chapters WHERE project_id = ?',
      [projectId]
    );
    return rows[0] || { count: 0, total_words: 0 };
  }
};

module.exports = Chapter;
