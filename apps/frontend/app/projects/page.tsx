'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { getProjects, deleteProject } from '@/lib/api';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data.data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个项目吗？所有关联的章节、角色和世界观数据将被删除。')) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-10 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">我的项目</h1>
          <p className="text-[var(--text-tertiary)]">管理你的所有创作项目</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus size={18} />
          新建项目
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-[var(--radius-lg)] p-6 animate-pulse">
              <div className="h-6 bg-[var(--bg-elevated)] rounded w-2/3 mb-3" />
              <div className="h-4 bg-[var(--bg-elevated)] rounded w-1/3 mb-4" />
              <div className="h-4 bg-[var(--bg-elevated)] rounded w-full mb-2" />
              <div className="h-3 bg-[var(--bg-elevated)] rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24">
          <FolderOpen size={48} className="text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-secondary)] mb-2">还没有项目</h3>
          <p className="text-[var(--text-muted)] mb-6">创建你的第一个小说项目，开始创作之旅</p>
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={18} />
            新建项目
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="relative group">
              <ProjectCard project={project} onClick={() => router.push(`/projects/${project.id}`)} />
              <button
                onClick={(e) => handleDelete(e, project.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--error)] p-1"
                title="删除项目"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <CreateProjectModal
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={(project) => setProjects((prev) => [project, ...prev])}
      />
    </div>
  );
}
