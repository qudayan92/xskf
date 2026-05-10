'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PenLine, Users, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  projectId: number;
}

const navItems = [
  { href: '', label: '项目概览', icon: LayoutDashboard },
  { href: '/editor', label: '写作编辑器', icon: PenLine },
  { href: '/characters', label: '角色管理', icon: Users },
  { href: '/world', label: '世界观', icon: Globe },
];

export function Sidebar({ projectId }: SidebarProps) {
  const pathname = usePathname();
  const basePath = `/projects/${projectId}`;

  return (
    <aside className="w-[250px] bg-[var(--bg-secondary)] border-r border-[var(--glass-border)] p-5 flex flex-col gap-1">
      <div className="sidebar-title">项目导航</div>
      {navItems.map((item) => {
        const href = basePath + item.href;
        const isActive = pathname === href || (item.href === '' && pathname === basePath);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              'list-item',
              isActive && 'active'
            )}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
