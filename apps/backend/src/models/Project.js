const { query, run } = require('../db');

const Project = {
  async findAll() {
    return query('SELECT * FROM projects ORDER BY updated_at DESC');
  },

  async findById(id) {
    const rows = await query('SELECT * FROM projects WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { name, genre, summary, target_word_count = 100000, status = 'draft' } = data;
    const { lastId } = await run(
      'INSERT INTO projects (name, genre, summary, target_word_count, status) VALUES (?, ?, ?, ?, ?)',
      [name, genre || null, summary || null, target_word_count, status]
    );
    return Project.findById(lastId);
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

    if (fields.length === 0) return Project.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await run(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return Project.findById(id);
  },

  async delete(id) {
    await run('DELETE FROM projects WHERE id = ?', [id]);
    return { deleted: true };
  }
};

module.exports = Project;
