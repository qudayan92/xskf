'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Novel {
  id: number;
  book_id: string;
  title: string;
}

interface Chapter {
  id: number;
  title: string;
  content: string;
}

interface Version {
  id: number;
  chapter_id: number;
  chapter_title: string;
  content: string;
  word_count: number;
  created_at: string;
}

const VersionHistory: React.FC = () => {
  const router = useRouter();
  const { novelId } = router.query;
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/novels`);
      const data = await res.json();
      if (data.success) {
        setNovels(data.data || []);
        if (data.data?.length > 0) {
          setSelectedNovel(data.data[0]);
          fetchChapters(data.data[0].book_id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch novels:', err);
    }
  };

  const fetchChapters = async (bookId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/books/${bookId}/chapters`);
      const data = await res.json();
      if (data.success) {
        setChapters(data.data || []);
        if (data.data?.length > 0) {
          setSelectedChapter(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chapters:', err);
    }
  };

  const fetchVersions = async (chapterId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/chapters/${chapterId}/versions`);
      const data = await res.json();
      if (data.success) {
        setVersions(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch versions:', err);
    }
    setLoading(false);
  };

  const handleNovelChange = (novel: Novel) => {
    setSelectedNovel(novel);
    fetchChapters(novel.book_id);
  };

  const handleChapterChange = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setSelectedVersion(null);
    fetchVersions(chapter.id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f0f12', color: '#e4e4e7' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">📜 版本历史</h1>
        <p className="text-sm mb-6" style={{ color: '#71717a' }}>查看编辑历史，一键恢复</p>

        {/* Novel Selection */}
        <div className="mb-4">
          <select
            value={selectedNovel?.id || ''}
            onChange={(e) => {
              const novel = novels.find(n => n.id === Number(e.target.value));
              if (novel) handleNovelChange(novel);
            }}
            className="w-full p-3 rounded-lg"
            style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.08)', color: '#e4e4e7' }}
          >
            {novels.map(novel => (
              <option key={novel.id} value={novel.id}>{novel.title}</option>
            ))}
          </select>
        </div>

        {/* Chapter Selection */}
        <div className="mb-4">
          <select
            value={selectedChapter?.id || ''}
            onChange={(e) => {
              const chapter = chapters.find(c => c.id === Number(e.target.value));
              if (chapter) handleChapterChange(chapter);
            }}
            className="w-full p-3 rounded-lg"
            style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.08)', color: '#e4e4e7' }}
          >
            {chapters.map(ch => (
              <option key={ch.id} value={ch.id}>{ch.title}</option>
            ))}
          </select>
        </div>

        {/* Versions List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10" style={{ color: '#71717a' }}>加载中...</div>
          ) : versions.length === 0 ? (
            <div className="text-center py-10" style={{ color: '#52525b' }}>
              <p>暂无版本记录</p>
              <p className="text-xs mt-2">开始编辑后会自动保存版本</p>
            </div>
          ) : (
            versions.map(v => (
              <div
                key={v.id}
                onClick={() => setSelectedVersion(v)}
                className="p-4 rounded-xl cursor-pointer transition-all"
                style={{
                  background: selectedVersion?.id === v.id ? '#2a2a34' : '#1c1c24',
                  border: selectedVersion?.id === v.id ? '1px solid rgba(124,106,240,0.3)' : '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{formatDate(v.created_at)}</span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(124,106,240,0.15)', color: '#a78bfa' }}>
                        {v.word_count} 字
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定要恢复到这个版本吗？')) {
                        alert('恢复功能开发中');
                      }
                    }}
                    className="px-3 py-1 rounded-lg text-xs"
                    style={{ background: 'rgba(124,106,240,0.15)', color: '#a78bfa' }}
                  >
                    恢复
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Preview */}
        {selectedVersion && (
          <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="w-full max-w-2xl mx-4 p-6 rounded-2xl max-h-[80vh] overflow-y-auto" style={{ background: '#14141c', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium">{selectedVersion.chapter_title}</h3>
                  <p className="text-xs" style={{ color: '#71717a' }}>{formatDate(selectedVersion.created_at)}</p>
                </div>
                <button onClick={() => setSelectedVersion(null)} className="text-gray-500">✕</button>
              </div>
              <div className="p-4 rounded-lg" style={{ background: '#1c1c24' }}>
                <pre className="text-sm whitespace-pre-wrap" style={{ color: '#a1a1aa', fontFamily: 'inherit', lineHeight: 1.8 }}>
                  {selectedVersion.content || '(空内容)'}
                </pre>
              </div>
              <button
                onClick={() => {
                  if (confirm('确定要恢复到这个版本吗？当前内容将被替换。')) {
                    alert('恢复功能开发中');
                  }
                }}
                className="w-full mt-4 py-2 rounded-lg font-medium"
                style={{ background: '#7c6af0', color: '#fff' }}
              >
                恢复此版本
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionHistory;