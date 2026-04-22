const { query, run, getLastInsertRowId } = require('../db');

class Category {
  static async findAll() {
    return query('SELECT * FROM categories ORDER BY sort_order ASC, id ASC');
  }

  static async findTree() {
    const all = await this.findAll();
    const roots = all.filter(c => c.parent_id === 0);
    const map = {};
    all.forEach(c => { map[c.id] = c; c.children = []; });
    all.forEach(c => {
      if (c.parent_id !== 0 && map[c.parent_id]) {
        map[c.parent_id].children.push(c);
      }
    });
    return roots;
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const { parent_id = 0, name, sort_order = 0 } = data;
    await run('INSERT INTO categories (parent_id, name, sort_order) VALUES (?, ?, ?)', [parent_id, name, sort_order]);
    const id = await getLastInsertRowId();
    return this.findById(id);
  }

  static async update(id, data) {
    const sets = [];
    const params = [];
    for (const [k, v] of Object.entries(data)) {
      if (k === 'id') continue;
      sets.push(`${k} = ?`);
      params.push(v);
    }
    if (sets.length === 0) return;
    params.push(id);
    await run(`UPDATE categories SET ${sets.join(',')} WHERE id = ?`, params);
    return this.findById(id);
  }

  static async delete(id) {
    await run('DELETE FROM categories WHERE id = ? OR parent_id = ?', [id, id]);
  }
}

module.exports = Category;