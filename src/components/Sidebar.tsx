'use client';
import { FolderOpen, LayoutDashboard, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-bg-secondary border-r border-border-subtle hidden md:flex flex-col">
      <div className="h-14 flex items-center px-6 border-b border-border-subtle">
        <div className="flex items-center space-x-2 text-accent">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-xs">N</span>
          </div>
          <span className="font-semibold text-text text-lg tracking-tight">Nexa</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                isActive ? "bg-bg-tertiary text-text" : "text-text-secondary hover:bg-bg-tertiary hover:text-text"
              )}>
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-border-subtle">
        <button className="flex items-center space-x-3 text-text-secondary hover:text-text transition-colors text-sm font-medium w-full px-2">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
