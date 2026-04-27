'use client';

import React, { useState } from 'react';
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

const ToolsPage: React.FC = () => {
  const router = useRouter();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);

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
      }
    } catch (err) {
      console.error('Failed to fetch chapters:', err);
    }
  };

  const handleSelectChange = (novel: Novel) => {
    setSelectedNovel(novel);
    fetchChapters(novel.book_id);
  };

  const exportTxt = () => {
    if (!selectedNovel || chapters.length === 0) return;
    const fullContent = chapters.map(ch => `# ${ch.title}\n\n${ch.content}`).join('\n\n');
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNovel.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    alert('导出成功！');
  };

  const checkSensitive = () => {
    if (!selectedNovel || chapters.length === 0) return;
    const fullContent = chapters.map(ch => ch.content).join('\n');
    const sensitiveList = ['违禁词1', '违禁词2'];
    const found = sensitiveList.filter(word => fullContent.includes(word));
    setResult({ type: '敏感词', count: found.length, words: found });
    setShowResult(true);
  };

  const checkText = () => {
    if (!selectedNovel || chapters.length === 0) return;
    const charCount = chapters.reduce((sum, ch) => sum + ch.content.length, 0);
    const wordCount = chapters.reduce((sum, ch) => sum + ch.content.replace(/\s/g, '').length, 0);
    const puncCount = chapters.reduce((sum, ch) => sum + (ch.content.match(/[。，、！？；：]/g) || []).length, 0);
    setResult({ type: '文字', charCount, wordCount, puncCount });
    setShowResult(true);
  };

  React.useEffect(() => {
    fetchNovels();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0f0f12', color: '#e4e4e7' }}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">工具集</h1>
        <p className="text-sm mb-8" style={{ color: '#71717a' }}>导出与检测</p>

        <div className="mb-6">
          <label className="text-sm mb-2 block" style={{ color: '#71717a' }}>选择作品</label>
          <select
            value={selectedNovel?.id || ''}
            onChange={(e) => {
              const novel = novels.find(n => n.id === Number(e.target.value));
              if (novel) handleSelectChange(novel);
            }}
            className="w-full p-3 rounded-lg"
            style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.08)', color: '#e4e4e7' }}
          >
            {novels.map(novel => (
              <option key={novel.id} value={novel.id}>{novel.title}</option>
            ))}
          </select>
        </div>

        {selectedNovel && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl" style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-lg font-medium mb-4">导出</h2>
              <button
                onClick={exportTxt}
                className="w-full py-2 rounded-lg font-medium"
                style={{ background: '#7c6af0', color: '#fff' }}
              >
                导出TXT
              </button>
            </div>

            <div className="p-4 rounded-xl" style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="text-lg font-medium mb-4">检测</h2>
              <button
                onClick={checkSensitive}
                className="w-full mb-2 py-2 rounded-lg font-medium"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
              >
                敏感词检测
              </button>
              <button
                onClick={checkText}
                className="w-full py-2 rounded-lg font-medium"
                style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}
              >
                文字检查
              </button>
            </div>
          </div>
        )}

        {showResult && (
          <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="max-w-sm p-6 rounded-2xl" style={{ background: '#14141c', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-medium">检测结果</h3>
                <button onClick={() => setShowResult(false)} className="text-gray-500">✕</button>
              </div>
              {result.type === '敏感词' ? (
                <div>
                  <p>发现 <span className="text-red-400">{result.count}</span> 个敏感词</p>
                </div>
              ) : (
                <div>
                  <p>总字数: <span className="text-white">{result.charCount}</span></p>
                  <p>去空格: <span className="text-white">{result.wordCount}</span></p>
                  <p>标点数: <span className="text-white">{result.puncCount}</span></p>
                </div>
              )}
              <button
                onClick={() => setShowResult(false)}
                className="w-full mt-4 py-2 rounded-lg"
                style={{ background: '#7c6af0', color: '#fff' }}
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPage;