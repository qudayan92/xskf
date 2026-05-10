'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Globe, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WorldElementCard } from '@/components/world/WorldElementCard';
import { WorldElementFormModal } from '@/components/world/WorldElementFormModal';
import { getWorlds, deleteWorld } from '@/lib/api';
import type { WorldItem } from '@/types';

const typeFilters = [
  { key: '', label: '全部' },
  { key: 'location', label: '地点' },
  { key: 'faction', label: '势力' },
  { key: 'technology', label: '科技' },
  { key: 'history', label: '历史' },
  { key: 'race', label: '种族' },
];

export default function WorldPage() {
  const params = useParams();
  const projectId = Number(params.id);

  const [items, setItems] = useState<WorldItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<WorldItem | null>(null);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadItems();
  }, [projectId]);

  const loadItems = async () => {
    try {
      const res = await getWorlds(projectId);
      setItems(res.data.data || []);
    } catch (err) {
      console.error('Failed to load world items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个世界元素吗？')) return;
    try {
      await deleteWorld(id);
      setItems((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error('Failed to delete world item:', err);
    }
  };

  const filteredItems = typeFilter
    ? items.filter((item) => item.type === typeFilter)
    : items;

  return (
    <div className="max-w-5xl mx-auto px-10 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">世界观</h1>
          <p className="text-sm text-[var(--text-muted)]">{items.length} 个世界元素</p>
        </div>
        <Button variant="primary" onClick={() => { setEditingItem(null); setShowForm(true); }}>
          <Plus size={18} />
          新建元素
        </Button>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-6">
        {typeFilters.map((f) => (
          <button
            key={f.key}
            className={f.key === typeFilter ? 'filter-chip active' : 'filter-chip'}
            onClick={() => setTypeFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--bg-secondary)] rounded-[var(--radius-lg)] p-6 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)]" />
                <div className="flex-1">
                  <div className="h-5 bg-[var(--bg-elevated)] rounded w-1/3 mb-2" />
                  <div className="h-4 bg-[var(--bg-elevated)] rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-24">
          <Globe size={48} className="text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-secondary)] mb-2">还没有世界元素</h3>
          <p className="text-[var(--text-muted)] mb-6">创建地点、势力、科技等，构建你的虚构世界</p>
          <Button variant="primary" onClick={() => { setEditingItem(null); setShowForm(true); }}>
            <Plus size={18} />
            新建元素
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative group">
              <WorldElementCard
                item={item}
                onClick={() => { setEditingItem(item); setShowForm(true); }}
              />
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--error)] p-1"
                title="删除元素"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <WorldElementFormModal
        open={showForm}
        onOpenChange={setShowForm}
        onSaved={(saved) => {
          if (editingItem) {
            setItems((prev) => prev.map((w) => (w.id === saved.id ? saved : w)));
          } else {
            setItems((prev) => [...prev, saved]);
          }
        }}
        projectId={projectId}
        item={editingItem}
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
