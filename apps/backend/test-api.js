// API Test Script
const http = require('http');

const BASE_URL = 'http://localhost:4000';

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing Novel AI Platform API...\n');

  // Test 1: Health Check
  console.log('1️⃣ Health Check');
  const health = await request('GET', '/api/health');
  console.log(`   Status: ${health.status}`, health.data);

  // Test 2: Create Project
  console.log('\n2️⃣ Create Project');
  const project = await request('POST', '/api/v1/projects', {
    name: '星际流光',
    genre: '科幻',
    stylePref: '硬科幻',
    targetWordCount: 500000
  });
  console.log(`   Status: ${project.status}`, project.data?.name);
  const projectId = project.data?.id;

  // Test 3: Get Projects
  console.log('\n3️⃣ Get Projects');
  const projects = await request('GET', '/api/v1/projects');
  console.log(`   Status: ${projects.status}`, `Count: ${projects.data?.length}`);

  // Test 4: Create Chapter
  if (projectId) {
    console.log('\n4️⃣ Create Chapter');
    const chapter = await request('POST', `/api/v1/projects/${projectId}/chapters`, {
      title: '第一章：星际迷途',
      content: '飞船穿越星际尘埃带...'
    });
    console.log(`   Status: ${chapter.status}`, chapter.data?.title);
  }

  // Test 5: AI Generate Outline
  console.log('\n5️⃣ AI Generate Outline');
  const outline = await request('POST', '/api/v1/generate/outline', {
    genre: '科幻',
    theme: '星际探索',
    style: '硬科幻'
  });
  console.log(`   Status: ${outline.status}`, outline.data?.title);

  // Test 6: AI Generate Character
  console.log('\n6️⃣ AI Generate Character');
  const character = await request('POST', '/api/v1/generate/character', {
    role: '主角',
    genre: '科幻',
    description: '星际探索员'
  });
  console.log(`   Status: ${character.status}`, character.data?.name);

  console.log('\n✅ All tests completed!');
}

testAPI().catch(console.error);