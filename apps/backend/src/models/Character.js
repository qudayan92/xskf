const { query, run } = require('../db');

const Character = {
  async findByProject(projectId) {
    return query(
      'SELECT * FROM characters WHERE project_id = ? ORDER BY updated_at DESC',
      [projectId]
    );
  },

  async findById(id) {
    const rows = await query('SELECT * FROM characters WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const {
      project_id, name, role = '配角', age, gender,
      personality, appearance, background, goals, tags
    } = data;
    const { lastId } = await run(
      `INSERT INTO characters (project_id, name, role, age, gender, personality, appearance, background, goals, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [project_id, name, role, age || null, gender || null,
       personality || null, appearance || null, background || null,
       goals || null, tags || null]
    );
    return Character.findById(lastId);
  },

  async update(id, data) {
    const allowedFields = ['name', 'role', 'age', 'gender', 'personality', 'appearance', 'background', 'goals', 'tags'];
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return Character.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await run(
      `UPDATE characters SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return Character.findById(id);
  },

  async delete(id) {
    await run('DELETE FROM characters WHERE id = ?', [id]);
    return { deleted: true };
  },

  async countByProject(projectId) {
    const rows = await query(
      'SELECT COUNT(*) as count FROM characters WHERE project_id = ?',
      [projectId]
    );
    return rows[0]?.count || 0;
  }
};

module.exports = Character;
