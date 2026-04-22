const { initDb, run, getLastInsertRowId, query } = require('./db');

async function seedCharacters() {
  await initDb();

  const characters = [
    { name: '林远航', role: '主角', age: '28', gender: '男', personality: '冷静果断，善于思考，对未知充满好奇', tags: '热血,正直' },
    { name: '苏瑶', role: '女主', age: '26', gender: '女', personality: '聪慧机敏，善于外交沟通', tags: '女主,智慧' },
    { name: '神秘导师', role: '导师', age: '未知', gender: '未知', personality: '古老文明的守护者，深不可测', tags: '导师,神秘' },
    { name: '黑泽明', role: '反派', age: '45', gender: '男', personality: '野心勃勃，权谋深沉，不择手段', tags: '反派,腹黑' },
  ];

  for (const char of characters) {
    await run(`
      INSERT INTO characters (name, role, age, gender, personality, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [char.name, char.role, char.age, char.gender, char.personality, char.tags]);
    console.log('Inserted:', char.name);
  }

  const result = await query('SELECT * FROM characters');
  console.log('Total characters:', result.length);
  console.log(JSON.stringify(result, null, 2));

  process.exit(0);
}

seedCharacters().catch(err => {
  console.error(err);
  process.exit(1);
});