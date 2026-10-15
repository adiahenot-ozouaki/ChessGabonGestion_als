'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Classement', short: 'Rang' },
  { href: '/tournois', label: 'Tournois', short: 'Tournois' },
  { href: '/a-propos', label: 'À propos', short: 'Infos' },
] as const;

interface SiteHeaderProps {
  action?: ReactNode;
}

export function SiteHeader({ action }: SiteHeaderProps = {}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/95 pt-safe backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
        <Logo size="sm" />
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-3">
          <nav
            aria-label="Navigation principale"
            className="-mx-1 flex max-w-full items-center gap-0.5 overflow-x-auto px-1 scrollbar-none sm:gap-1.5"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'shrink-0 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors touch-manipulation sm:px-3 sm:py-1.5',
                  isActive(item.href)
                    ? 'bg-brand-light text-brand-dark'
                    : 'text-muted active:bg-gray-100 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <span className="sm:hidden">{item.short}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
          {action}
        </div>
      </div>
    </header>
  );
}
