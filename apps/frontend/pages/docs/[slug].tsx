import React from 'react';
import { useRouter } from 'next/router';

function renderInline(slug: string) {
  switch (slug) {
    case 'overview':
      return '<h2>Overview</h2><p>开放文档治理的总览，确保本地与云端治理的一致性。</p>';
    case 'architecture':
      return '<h2>Architecture</h2><p>系统架构总览、模块边界和数据流。</p>';
    case 'api/v1':
      return '<h2>API v1</h2><p>端点概览（占位）</p>';
    default:
      return '<h2>文档</h2><p>内容即将填充。</p>';
  }
}

const DocPage: React.FC = () => {
  const router = useRouter();
  const slugRaw = router.query.slug;
  const slug = Array.isArray(slugRaw) ? slugRaw.join('/') : (slugRaw || 'overview');
  const content = renderInline(slug as string);
  return (
    <div className="p-6 max-w-4xl mx-auto" dangerouslySetInnerHTML={{ __html: content }} />
  );
};

export default DocPage;