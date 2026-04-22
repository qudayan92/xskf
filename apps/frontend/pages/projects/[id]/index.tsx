import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Project {
  id: number;
  name: string;
  genre: string;
  summary: string;
  outline: string;
  status: string;
  word_count: number;
  target_word_count: number;
}

interface Chapter {
  id: number;
  chapter_no: number;
  title: string;
  word_count: number;
  status: string;
}

const ProjectDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchChapters();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/projects/${id}`);
      setProject(res.data.data);
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/chapters?project_id=${id}`);
      setChapters(res.data.data || []);
    } catch (err) {
      console.error('Error fetching chapters:', err);
    }
  };

  const handleGenerateOutline = async () => {
    if (!aiPrompt) return;
    setGenerating(true);
    try {
      const res = await axios.post(`${API_URL}/api/v1/ai/generate-outline`, {
        title: project?.name,
        genre: project?.genre,
        summary: aiPrompt,
      });
      if (res.data.data?.outline) {
        await axios.patch(`${API_URL}/api/v1/projects/${id}`, {
          outline: JSON.stringify(res.data.data.outline),
        });
        fetchProject();
        setAiPrompt('');
      }
    } catch (err) {
      console.error('Error generating outline:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddChapter = async () => {
    try {
      const nextNo = chapters.length + 1;
      await axios.post(`${API_URL}/api/v1/chapters`, {
        project_id: id,
        chapter_no: nextNo,
        title: `第${nextNo}章`,
        content: '',
      });
      fetchChapters();
    } catch (err) {
      console.error('Error adding chapter:', err);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === '已完成') return { bg: 'bg-green-600/20', text: 'text-green-400' };
    if (status === '进行中') return { bg: 'bg-amber-500/20', text: 'text-amber-400' };
    return { bg: 'bg-zinc-700/50', text: 'text-gray-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f12', color: '#71717a' }}>
        加载中...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f0f12', color: '#e4e4e7' }}>
      <header style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        background: 'rgba(15, 15, 18, 0.85)', backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid rgba(255,255,255,0.06)', height: 64
      }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', height: '100%', position: 'relative', padding: '0 24px' }}>
          <div className="flex items-center gap-4" style={{ position: 'absolute', left: 24, top: 0, height: '100%' }}>
            <Link href="/projects" legacyBehavior>
              <a className="text-gray-400 hover:text-white flex items-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </a>
            </Link>
            <div>
              <h1 className="font-semibold text-white">{project?.name || '项目详情'}</h1>
              <span className="text-xs" style={{ color: '#f59e0b' }}>{project?.genre || '未分类'} · {project?.status}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1" style={{ paddingTop: 64 }}>
        <aside className="w-64 p-4 border-r" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <nav className="space-y-1">
            {[
              { name: '情节大纲', href: '#outline', active: true },
              { name: '章节编辑', href: '#chapters' },
              { name: '人物档案', href: '/characters' },
              { name: '世界观设定', href: '/world' },
            ].map((item, i) => (
              <a key={i} href={item.href} className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                item.active ? 'bg-amber-500/10 text-amber-400' : 'text-gray-400 hover:text-white'
              }`}>
                {item.name}
              </a>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">情节大纲</h2>
              <button onClick={handleAddChapter} className="text-xs" style={{ color: '#f59e0b' }}>+ 添加章节</button>
            </div>
            <div className="p-6 rounded-xl border" style={{ background: '#18181b', borderColor: 'rgba(255,255,255,0.06)' }}>
              {chapters.length > 0 ? (
                <div className="space-y-3">
                  {chapters.map((chapter) => {
                    const statusStyle = getStatusColor(chapter.status === 'published' ? '已完成' : chapter.status === 'draft' ? '进行中' : '待开始');
                    return (
                      <div key={chapter.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                        <div>
                          <span className="text-sm text-white">第{chapter.chapter_no}章：{chapter.title}</span>
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${statusStyle.bg} ${statusStyle.text}`}>
                            {chapter.status === 'published' ? '已完成' : chapter.status === 'draft' ? '进行中' : '待开始'}
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: '#71717a' }}>{(chapter.word_count || 0).toLocaleString()} 字</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: '#71717a' }}>暂无章节，点击添加开始创作</p>
              )}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">AI 生成大纲</h2>
            <div className="flex gap-4">
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="描述你的故事..."
                className="flex-1 px-4 py-3 rounded-lg"
                style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e4e7' }}
              />
              <button
                onClick={handleGenerateOutline}
                disabled={generating}
                className="px-6 py-3 font-medium rounded-lg disabled:opacity-50"
                style={{ background: '#f59e0b', color: '#000' }}
              >
                {generating ? '生成中...' : 'AI 生成'}
              </button>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">项目信息</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border" style={{ background: '#18181b', borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="text-sm" style={{ color: '#71717a' }}>类型</span>
                <p className="text-white font-medium">{project?.genre || '未设置'}</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ background: '#18181b', borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="text-sm" style={{ color: '#71717a' }}>目标字数</span>
                <p className="text-white font-medium">{(project?.target_word_count || 0).toLocaleString()} 字</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ background: '#18181b', borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="text-sm" style={{ color: '#71717a' }}>当前字数</span>
                <p className="text-white font-medium">{(project?.word_count || 0).toLocaleString()} 字</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ background: '#18181b', borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="text-sm" style={{ color: '#71717a' }}>状态</span>
                <p className="text-white font-medium">{project?.status || '新建'}</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProjectDetail;