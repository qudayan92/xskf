import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Project {
  id: number;
  name: string;
  genre: string;
  summary: string;
  status: string;
  word_count: number;
  target_word_count: number;
  updated_at: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', genre: '科幻', summary: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/v1/projects`);
      setProjects(res.data.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProject.name) return;
    try {
      console.log('Creating project with data:', newProject);
      const res = await axios.post(`${API_URL}/api/v1/projects`, newProject);
      console.log('Create success:', res.data);
      setShowModal(false);
      setNewProject({ name: '', genre: '科幻', summary: '' });
      fetchProjects();
    } catch (err: any) {
      console.error('Error creating project:', err);
      console.error('Response:', err.response?.data);
      alert('创建失败: ' + (err.response?.data?.error || (err as Error).message));
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '从未';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '昨天';
    return `${days}天前`;
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f0f12', color: '#e4e4e7' }}>
      <header style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        background: 'rgba(15, 15, 18, 0.85)', backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid rgba(255,255,255,0.06)', height: 64
      }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', height: '100%', position: 'relative', padding: '0 24px' }}>
          <div className="flex items-center gap-3" style={{ position: 'absolute', left: 24, top: 0, height: '100%' }}>
            <Link href="/" legacyBehavior>
              <a className="flex items-center gap-2 cursor-pointer">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  <span className="text-white font-bold text-sm">睿</span>
                </div>
                <span className="font-medium text-white">明睿小说</span>
              </a>
            </Link>
          </div>
          <nav className="flex items-center gap-1" style={{ position: 'absolute', left: '50%', top: 0, height: '100%', transform: 'translateX(-50%)' }}>
            <Link href="/" legacyBehavior>
              <a className="px-4 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white">首页</a>
            </Link>
            <Link href="/projects" legacyBehavior>
              <a className="px-4 py-2 text-sm font-medium rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>我的作品</a>
            </Link>
            <Link href="/docs/overview" legacyBehavior>
              <a className="px-4 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white">文档</a>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12" style={{ paddingTop: 80 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">我的作品</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 font-medium rounded-lg transition-colors"
            style={{ background: '#f59e0b', color: '#000' }}
          >
            + 新建作品
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: '#71717a' }}>加载中...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#71717a' }}>暂无作品，点击新建开始创作</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} legacyBehavior>
                <a className="p-6 rounded-xl transition-all cursor-pointer block" style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
                      <span className="text-xs" style={{ color: '#f59e0b' }}>{project.genre || '未分类'}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      project.status === '新建' ? 'bg-green-600/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm" style={{ color: '#71717a' }}>
                    <span>{(project.word_count || 0).toLocaleString()} 字</span>
                    <span>更新于 {formatTime(project.updated_at)}</span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}

        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">AI 创作入口</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: '情节大纲', href: '/projects/new/outline', icon: '📋' },
              { title: '人物建模', href: '/characters/new', icon: '👤' },
              { title: '世界观设定', href: '/world', icon: '🌍' },
            ].map((item, i) => (
              <Link key={i} href={item.href} legacyBehavior>
                <a className="p-5 rounded-xl border transition-all cursor-pointer text-center block" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <span className="font-medium text-gray-200">{item.title}</span>
                </a>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="p-6 rounded-xl w-96" style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 className="text-lg font-semibold mb-4">新建作品</h2>
            <div className="mb-4">
              <label className="block text-sm mb-2" style={{ color: '#71717a' }}>作品名称</label>
              <input
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{ background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e4e7' }}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2" style={{ color: '#71717a' }}>类型</label>
              <select
                value={newProject.genre}
                onChange={(e) => setNewProject({ ...newProject, genre: e.target.value })}
                className="w-full px-3 py-2 rounded-lg"
                style={{ background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e4e7' }}
              >
                {['科幻', '玄幻', '都市', '历史', '悬疑', '言情', '奇幻', '军事', '游戏'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2" style={{ color: '#71717a' }}>简介</label>
              <textarea
                value={newProject.summary}
                onChange={(e) => setNewProject({ ...newProject, summary: e.target.value })}
                className="w-full px-3 py-2 rounded-lg h-24 resize-none"
                style={{ background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e4e7' }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 rounded-lg"
                style={{ background: '#27272a', color: '#a1a1aa' }}
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2 rounded-lg"
                style={{ background: '#f59e0b', color: '#000' }}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;