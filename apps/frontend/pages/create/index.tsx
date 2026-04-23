import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import StepGenre from '../../components/CreateWizard/StepGenre';
import StepHook from '../../components/CreateWizard/StepHook';
import StepPreview from '../../components/CreateWizard/StepPreview';

interface WizardData {
  keyword: string;
  selectedTitle: string;
  genre: string;
  subGenre: string;
  title: string;
  hook: string;
  summary: string;
  targetWords: number;
}

const CreateWizard: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WizardData>({
    keyword: '',
    selectedTitle: '',
    genre: '科幻',
    subGenre: '',
    title: '',
    hook: '',
    summary: '',
    targetWords: 100,
  });

  const updateData = useCallback((patch: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...patch }));
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/novels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.selectedTitle || data.keyword + '传说',
          author_id: 2,
          subtitle: data.hook.slice(0, 50),
          summary: data.summary,
          category_id: getCategoryId(data.genre),
          tags: `${data.genre},${data.subGenre}`,
          status: 0,
        }),
      });
      const result = await res.json();
      if (!result.success) {
        console.error('Create failed:', result.error);
        alert('创建失败: ' + (result.error || '未知错误'));
        return;
      }
      const novelData = result.data;
      if (!novelData) {
        console.error('Create failed: no data returned');
        alert('创建失败：无返回数据');
        return;
      }
      const bookId = novelData.book_id;
      if (!bookId) {
        console.error('Create failed: book_id is missing');
        alert('创建失败：book_id缺失');
        return;
      }
      router.push(`/editor?novelId=${bookId}`);
    } catch (err) {
      console.error('Create failed:', err);
      alert('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{
        background: 'rgba(15, 15, 20, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => step > 1 ? setStep(step - 1) : router.push('/works')}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {step > 1 ? '上一步' : '返回'}
              </button>
              <span className="text-gray-500 text-sm">|</span>
              <span className="text-sm font-medium" style={{ color: '#7c6af0' }}>
                📖 新建作品
              </span>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(s => (
                <React.Fragment key={s}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    s === step ? 'text-white' : s < step ? 'text-white' : 'text-gray-500'
                  }`} style={{
                    background: s === step ? '#7c6af0' : s < step ? '#22c55e' : 'rgba(255,255,255,0.08)',
                  }}>
                    {s < step ? '✓' : s}
                  </div>
                  {s < 3 && <div className={`w-10 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-700'}`} />}
                </React.Fragment>
              ))}
            </div>

            <span className="text-xs text-gray-500">步骤 {step}/3</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        {step === 1 && (
          <StepGenre data={data} updateData={updateData} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <StepHook data={data} updateData={updateData} onNext={() => setStep(3)} />
        )}
        {step === 3 && (
          <StepPreview data={data} onCreate={handleCreate} loading={loading} />
        )}
      </main>
    </div>
  );
};

function getCategoryId(genre: string): number {
  const map: Record<string, number> = { '玄幻': 2, '科幻': 3, '都市': 4, '历史': 5, '悬疑': 6, '言情': 7, '奇幻': 8, '军事': 9, '游戏': 10 };
  return map[genre] || 3;
}

export default CreateWizard;