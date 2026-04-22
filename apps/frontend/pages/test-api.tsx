import React, { useState, useEffect } from 'react';

export default function TestAPI() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    try {
      // Test novels endpoint
      const novelsRes = await fetch('/api/v1/novels');
      const novelsData = await novelsRes.json();
      setResult({
        novels: novelsData
      });
    } catch (err: any) {
      setResult({ error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    if (!confirm('确定要删除所有数据吗？')) return;
    try {
      await fetch('/api/v1/novels', { method: 'DELETE' });
      await fetch('/api/v1/users', { method: 'DELETE' });
      setResult(null);
    } catch (err: any) {
      alert('删除失败: ' + (err as Error).message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f12', color: '#e4e4e7', padding: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>API 测试页面</h1>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={testEndpoints}
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              background: '#7c6af0',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '12px'
            }}
          >
            {loading ? '测试中...' : '测试 API'}
          </button>

          <button
            onClick={clearAll}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            清除所有数据
          </button>
        </div>

        {loading && (
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '20px' }}>
            正在测试...
          </div>
        )}

        {result?.error && (
          <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444', marginBottom: '20px' }}>
            错误: {result.error}
          </div>
        )}

        {result?.novels && (
          <div style={{ padding: '20px', background: 'rgba(124, 106, 240, 0.1)', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '16px', color: '#7c6af0' }}>Novels 数据 ({result.novels.success ? result.novels.data.length : 0} 条)</h3>
            {result.novels.success && result.novels.data.length === 0 && (
              <p>暂无数据，请先执行 seed 操作</p>
            )}
            {result.novels.success && result.novels.data.length > 0 && (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {result.novels.data.map((item: any, i: number) => (
                  <div key={i} style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <strong>#{i + 1}</strong> {item.title}
                    <br />
                    <span style={{ fontSize: '12px', color: '#71717a' }}>
                      ID: {item.id}, BookID: {item.book_id}, 作者: {item.author_id}
                    </span>
                    <br />
                    <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
                      字数: {item.word_count}, 章节数: {item.chapter_count}, 状态: {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
