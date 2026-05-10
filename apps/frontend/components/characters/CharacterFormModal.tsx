'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { createCharacter, updateCharacter } from '@/lib/api';
import type { Character } from '@/types';

interface CharacterFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (character: Character) => void;
  projectId: number;
  character?: Character | null;
}

const roleOptions = [
  { value: '主角', label: '主角' },
  { value: '配角', label: '配角' },
  { value: '反派', label: '反派' },
  { value: '导师', label: '导师' },
  { value: '路人', label: '路人' },
];

const genderOptions = [
  { value: '', label: '选择性别' },
  { value: '男', label: '男' },
  { value: '女', label: '女' },
  { value: '其他', label: '其他' },
];

export function CharacterFormModal({ open, onOpenChange, onSaved, projectId, character }: CharacterFormModalProps) {
  const isEdit = !!character;
  const [name, setName] = useState('');
  const [role, setRole] = useState('配角');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [personality, setPersonality] = useState('');
  const [appearance, setAppearance] = useState('');
  const [background, setBackground] = useState('');
  const [goals, setGoals] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (character) {
      setName(character.name);
      setRole(character.role || '配角');
      setAge(character.age || '');
      setGender(character.gender || '');
      setPersonality(character.personality || '');
      setAppearance(character.appearance || '');
      setBackground(character.background || '');
      setGoals(character.goals || '');
      setTags(character.tags || '');
    } else {
      resetForm();
    }
  }, [character, open]);

  const resetForm = () => {
    setName('');
    setRole('配角');
    setAge('');
    setGender('');
    setPersonality('');
    setAppearance('');
    setBackground('');
    setGoals('');
    setTags('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const data = {
        name: name.trim(),
        role,
        age: age || undefined,
        gender: gender || undefined,
        personality: personality || undefined,
        appearance: appearance || undefined,
        background: background || undefined,
        goals: goals || undefined,
        tags: tags || undefined,
      };

      let res;
      if (isEdit) {
        res = await updateCharacter(character!.id, data);
      } else {
        res = await createCharacter(projectId, data);
      }
      onSaved(res.data.data);
      resetForm();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save character:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={isEdit ? '编辑角色' : '新建角色'} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">名称 *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="角色姓名" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">角色定位</label>
            <Select options={roleOptions} value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">年龄</label>
            <Input value={age} onChange={(e) => setAge(e.target.value)} placeholder="例如：28岁" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">性别</label>
            <Select options={genderOptions} value={gender} onChange={(e) => setGender(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">性格特点</label>
          <Textarea rows={2} value={personality} onChange={(e) => setPersonality(e.target.value)} placeholder="描述角色的性格..." />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">外貌描写</label>
          <Textarea rows={2} value={appearance} onChange={(e) => setAppearance(e.target.value)} placeholder="角色的外貌特征..." />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">背景故事</label>
          <Textarea rows={2} value={background} onChange={(e) => setBackground(e.target.value)} placeholder="角色的背景经历..." />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">目标动机</label>
          <Textarea rows={2} value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="角色的目标和动机..." />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">标签</label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="多个标签用逗号分隔" />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button type="submit" disabled={!name.trim() || loading}>
            {loading ? '保存中...' : isEdit ? '更新角色' : '创建角色'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
