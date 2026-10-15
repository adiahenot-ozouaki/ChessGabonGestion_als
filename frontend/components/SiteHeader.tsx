'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Classement' },
  { href: '/tournois', label: 'Tournois' },
  { href: '/a-propos', label: 'À propos' },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Logo size="sm" />
        <nav
          aria-label="Navigation principale"
          className="flex items-center gap-1 overflow-x-auto scrollbar-none sm:gap-1.5"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3',
                isActive(item.href)
                  ? 'bg-brand-light text-brand-dark'
                  : 'text-muted hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
