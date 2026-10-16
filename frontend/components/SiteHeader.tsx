'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Info, ListOrdered, Trophy } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Classement', short: 'Rang', icon: ListOrdered },
  { href: '/tournois', label: 'Tournois', short: 'Tournois', icon: Trophy },
  { href: '/a-propos', label: 'À propos', short: 'Infos', icon: Info },
] as const;

interface SiteHeaderProps {
  action?: ReactNode;
}

export function SiteHeader({ action }: SiteHeaderProps = {}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b bg-white/95 pt-safe backdrop-blur-md transition-shadow duration-200 supports-[backdrop-filter]:bg-white/90',
        scrolled
          ? 'border-border/80 shadow-sm shadow-black/5'
          : 'border-border shadow-none'
      )}
    >
      <div className="mx-auto flex h-12 max-w-5xl items-center gap-2 px-3 sm:h-14 sm:gap-4 sm:px-6">
        <div className="min-w-0 shrink-0">
          <Logo size="sm" />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-3">
          <nav
            aria-label="Navigation principale"
            className="flex max-w-full items-center gap-0.5 overflow-x-auto scrollbar-none sm:gap-1"
          >
            {NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium touch-manipulation transition-colors sm:px-3 sm:py-1.5',
                    active
                      ? 'bg-brand-light text-brand-dark'
                      : 'text-muted hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 sm:hidden',
                      active ? 'text-brand-dark' : 'text-muted group-hover:text-gray-700'
                    )}
                    aria-hidden
                  />
                  <span className="sm:hidden">{item.short}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                  <span
                    className={cn(
                      'pointer-events-none absolute bottom-1 left-1/2 hidden h-0.5 w-4 -translate-x-1/2 rounded-full bg-brand transition-all sm:block',
                      active ? 'opacity-100 w-5' : 'opacity-0 w-3 group-hover:opacity-40'
                    )}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </nav>

          {action && (
            <>
              <span
                className="hidden h-5 w-px shrink-0 bg-border sm:block"
                aria-hidden
              />
              <div className="shrink-0">{action}</div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
