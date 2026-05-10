import type { Metadata } from 'next';
import { Shell } from '@/components/layout/Shell';
import './globals.css';

export const metadata: Metadata = {
  title: '明睿创作 - AI 智能写作平台',
  description: '明睿智能小说平台，AI 赋能大纲构思、角色建模、世界观构建与智能写作辅助',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
