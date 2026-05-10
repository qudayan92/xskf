'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PenLine, Users, Globe, BookOpen, Edit3, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { getProject, updateProject, deleteProject, getProjectStats } from '@/lib/api';
import type { Project, ProjectStats } from '@/types';

const genreOptions = [
  { value: '', label: '选择类型' },
  { value: '玄幻', label: '玄幻' },
  { value: '科幻', label: '科幻' },
  { value: '都市', label: '都市' },
  { value: '历史', label: '历史' },
  { value: '悬疑', label: '悬疑' },
  { value: '言情', label: '言情' },
  { value: '奇幻', label: '奇幻' },
  { value: '军事', label: '军事' },
];

const statusMap: Record<string, string> = {
  draft: '草稿',
  writing: '连载中',
  completed: '已完成',
};

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [projRes, statsRes] = await Promise.all([
        getProject(projectId),
        getProjectStats(projectId),
      ]);
      setProject(projRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Failed to load project:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    if (!project) return;
    setEditName(project.name);
    setEditGenre(project.genre || '');
    setEditSummary(project.summary || '');
    setShowEdit(true);
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await updateProject(projectId, {
        name: editName.trim(),
        genre: editGenre || null,
        summary: editSummary || null,
      });
      setProject(res.data.data);
      setShowEdit(false);
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个项目吗？所有关联数据将被永久删除。')) return;
    try {
      await deleteProject(projectId);
      router.push('/projects');
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--bg-elevated)] rounded w-1/3" />
          <div className="h-4 bg-[var(--bg-elevated)] rounded w-1/2" />
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--text-muted)]">项目不存在</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-10 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{project.name}</h1>
          <div className="flex items-center gap-3">
            {project.genre && <Badge variant="accent">{project.genre}</Badge>}
            <Badge>{statusMap[project.status] || project.status}</Badge>
            <span className="text-sm text-[var(--text-muted)]">
              目标 {project.target_word_count?.toLocaleString() || 0} 字
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={openEdit}>
            <Edit3 size={16} />
            编辑
          </Button>
          <Button variant="ghost" onClick={handleDelete}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {project.summary && (
        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">{project.summary}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <Card hover={false}>
          <div className="stat-number">{stats?.chapterCount || 0}</div>
          <div className="stat-label">章节数</div>
        </Card>
        <Card hover={false}>
          <div className="stat-number">{stats?.totalWords?.toLocaleString() || 0}</div>
          <div className="stat-label">总字数</div>
        </Card>
        <Card hover={false}>
          <div className="stat-number">{stats?.characterCount || 0}</div>
          <div className="stat-label">角色数</div>
        </Card>
        <Card hover={false}>
          <div className="stat-number">{stats?.worldCount || 0}</div>
          <div className="stat-label">世界元素</div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { icon: PenLine, label: '继续写作', href: `/projects/${projectId}/editor`, color: 'var(--accent-primary)' },
          { icon: Users, label: '管理角色', href: `/projects/${projectId}/characters`, color: '#4ade80' },
          { icon: Globe, label: '世界观', href: `/projects/${projectId}/world`, color: '#fbbf24' },
        ].map((action) => (
          <Card
            key={action.label}
            className="cursor-pointer text-center py-8"
            onClick={() => router.push(action.href)}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: `${action.color}15` }}
            >
              <action.icon size={22} style={{ color: action.color }} />
            </div>
            <span className="font-medium text-[var(--text-primary)]">{action.label}</span>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal open={showEdit} onOpenChange={setShowEdit} title="编辑项目">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">项目名称</label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">类型</label>
            <Select options={genreOptions} value={editGenre} onChange={(e) => setEditGenre(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">简介</label>
            <Textarea rows={3} value={editSummary} onChange={(e) => setEditSummary(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setShowEdit(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving || !editName.trim()}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
