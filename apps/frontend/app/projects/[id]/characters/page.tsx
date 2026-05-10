'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CharacterCard } from '@/components/characters/CharacterCard';
import { CharacterFormModal } from '@/components/characters/CharacterFormModal';
import { getCharacters, deleteCharacter } from '@/lib/api';
import type { Character } from '@/types';

const roleFilters = ['全部', '主角', '配角', '反派', '导师'];

export default function CharactersPage() {
  const params = useParams();
  const projectId = Number(params.id);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChar, setEditingChar] = useState<Character | null>(null);
  const [roleFilter, setRoleFilter] = useState('全部');

  useEffect(() => {
    loadCharacters();
  }, [projectId]);

  const loadCharacters = async () => {
    try {
      const res = await getCharacters(projectId);
      setCharacters(res.data.data || []);
    } catch (err) {
      console.error('Failed to load characters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个角色吗？')) return;
    try {
      await deleteCharacter(id);
      setCharacters((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete character:', err);
    }
  };

  const filteredChars = roleFilter === '全部'
    ? characters
    : characters.filter((c) => c.role === roleFilter);

  return (
    <div className="max-w-5xl mx-auto px-10 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">角色管理</h1>
          <p className="text-sm text-[var(--text-muted)]">{characters.length} 个角色</p>
        </div>
        <Button variant="primary" onClick={() => { setEditingChar(null); setShowForm(true); }}>
          <Plus size={18} />
          新建角色
        </Button>
      </div>

      {/* Role filter */}
      <div className="flex gap-2 mb-6">
        {roleFilters.map((role) => (
          <button
            key={role}
            className={role === roleFilter ? 'filter-chip active' : 'filter-chip'}
            onClick={() => setRoleFilter(role)}
          >
            {role}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--bg-secondary)] rounded-[var(--radius-lg)] p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[var(--bg-elevated)]" />
                <div className="flex-1">
                  <div className="h-5 bg-[var(--bg-elevated)] rounded w-1/3 mb-2" />
                  <div className="h-4 bg-[var(--bg-elevated)] rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredChars.length === 0 ? (
        <div className="text-center py-24">
          <Users size={48} className="text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-secondary)] mb-2">还没有角色</h3>
          <p className="text-[var(--text-muted)] mb-6">创建你的第一个角色，为故事注入生命</p>
          <Button variant="primary" onClick={() => { setEditingChar(null); setShowForm(true); }}>
            <Plus size={18} />
            新建角色
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChars.map((character) => (
            <div key={character.id} className="relative group">
              <CharacterCard
                character={character}
                onClick={() => { setEditingChar(character); setShowForm(true); }}
              />
              <button
                onClick={() => handleDelete(character.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--error)] p-1"
                title="删除角色"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <CharacterFormModal
        open={showForm}
        onOpenChange={setShowForm}
        onSaved={(char) => {
          if (editingChar) {
            setCharacters((prev) => prev.map((c) => (c.id === char.id ? char : c)));
          } else {
            setCharacters((prev) => [...prev, char]);
          }
        }}
        projectId={projectId}
        character={editingChar}
      />

      <style>{`
        .filter-chip {
          padding: 6px 14px;
          font-size: 13px;
          border-radius: 20px;
          border: 1px solid var(--glass-border);
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .filter-chip:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .filter-chip.active {
          background: var(--accent-glow);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
