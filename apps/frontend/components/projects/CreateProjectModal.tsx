'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { createProject } from '@/lib/api';
import type { Project } from '@/types';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (project: Project) => void;
}

const genreOptions = [
  { value: '', label: '选择类型（可选）' },
  { value: '玄幻', label: '玄幻' },
  { value: '科幻', label: '科幻' },
  { value: '都市', label: '都市' },
  { value: '历史', label: '历史' },
  { value: '悬疑', label: '悬疑' },
  { value: '言情', label: '言情' },
  { value: '奇幻', label: '奇幻' },
  { value: '军事', label: '军事' },
];

export function CreateProjectModal({ open, onOpenChange, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await createProject({ name: name.trim(), genre: genre || undefined, summary: summary || undefined });
      onCreated(res.data.data);
      setName('');
      setGenre('');
      setSummary('');
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="新建项目">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">项目名称 *</label>
          <Input
            placeholder="给你的作品起个名字..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">类型</label>
          <Select options={genreOptions} value={genre} onChange={(e) => setGenre(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">简介</label>
          <Textarea
            placeholder="简单描述你的故事..."
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="submit" disabled={!name.trim() || loading}>
            {loading ? '创建中...' : '创建项目'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
