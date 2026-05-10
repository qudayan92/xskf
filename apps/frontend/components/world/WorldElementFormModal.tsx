'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { createWorld, updateWorld } from '@/lib/api';
import type { WorldItem } from '@/types';

interface WorldElementFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (item: WorldItem) => void;
  projectId: number;
  item?: WorldItem | null;
}

const typeOptions = [
  { value: 'location', label: '🌍 地点' },
  { value: 'faction', label: '🚀 势力' },
  { value: 'technology', label: '💫 科技' },
  { value: 'history', label: '📜 历史' },
  { value: 'race', label: '👽 种族' },
];

const iconOptions = [
  { value: '', label: '选择图标' },
  { value: '🌍', label: '🌍 星球' },
  { value: '🚀', label: '🚀 飞船' },
  { value: '💫', label: '💫 星辰' },
  { value: '📜', label: '📜 卷轴' },
  { value: '👽', label: '👽 外星' },
  { value: '🏰', label: '🏰 城堡' },
  { value: '🏙️', label: '🏙️ 城市' },
  { value: '🌊', label: '🌊 海洋' },
  { value: '🗡️', label: '🗡️ 武器' },
  { value: '🔮', label: '🔮 水晶' },
  { value: '⚙️', label: '⚙️ 齿轮' },
];

export function WorldElementFormModal({ open, onOpenChange, onSaved, projectId, item }: WorldElementFormModalProps) {
  const isEdit = !!item;
  const [name, setName] = useState('');
  const [type, setType] = useState('location');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setType(item.type || 'location');
      setDescription(item.description || '');
      setIcon(item.icon || '');
    } else {
      setName('');
      setType('location');
      setDescription('');
      setIcon('');
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !type) return;

    setLoading(true);
    try {
      const data = {
        type,
        name: name.trim(),
        description: description || undefined,
        icon: icon || undefined,
      };

      let res;
      if (isEdit) {
        res = await updateWorld(item!.id, data);
      } else {
        res = await createWorld(projectId, data);
      }
      onSaved(res.data.data);
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save world item:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={isEdit ? '编辑世界元素' : '新建世界元素'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">名称 *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="元素名称" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">类型 *</label>
            <Select options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">图标</label>
          <Select options={iconOptions} value={icon} onChange={(e) => setIcon(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">描述</label>
          <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="描述这个世界元素..." />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button type="submit" disabled={!name.trim() || !type || loading}>
            {loading ? '保存中...' : isEdit ? '更新元素' : '创建元素'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
