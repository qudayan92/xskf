const { query, run } = require('../db');

const WorldItem = {
  async findByProject(projectId, type) {
    let sql = 'SELECT * FROM world_items WHERE project_id = ?';
    const params = [projectId];
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    sql += ' ORDER BY updated_at DESC';
    return query(sql, params);
  },

  async findById(id) {
    const rows = await query('SELECT * FROM world_items WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const {
      project_id, type, name, description, icon,
      attributes, relationships
    } = data;
    const { lastId } = await run(
      `INSERT INTO world_items (project_id, type, name, description, icon, attributes, relationships)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [project_id, type, name, description || null, icon || null,
       attributes ? JSON.stringify(attributes) : null,
       relationships ? JSON.stringify(relationships) : null]
    );
    return WorldItem.findById(lastId);
  },

  async update(id, data) {
    const allowedFields = ['type', 'name', 'description', 'icon', 'attributes', 'relationships'];
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(key === 'attributes' || key === 'relationships' ? JSON.stringify(value) : value);
      }
    }

    if (fields.length === 0) return WorldItem.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await run(
      `UPDATE world_items SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return WorldItem.findById(id);
  },

  async delete(id) {
    await run('DELETE FROM world_items WHERE id = ?', [id]);
    return { deleted: true };
  },

  async countByProject(projectId) {
    const rows = await query(
      'SELECT COUNT(*) as count FROM world_items WHERE project_id = ?',
      [projectId]
    );
    return rows[0]?.count || 0;
  }
};

module.exports = WorldItem;
