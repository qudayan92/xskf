'use client';

import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = Number(params.id);

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <Sidebar projectId={projectId} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
